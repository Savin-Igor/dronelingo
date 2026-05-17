/**
 * Search indexer for dronelingo.
 *
 * Walks every content family (lessons, questions, blog, sources, static),
 * chunks each item via src/lib/search/chunk.ts, and UPSERTs into the
 * SearchChunk table. Embeddings are computed for new or changed chunks.
 *
 * Usage:
 *   tsx scripts/index-search.ts          # full pipeline (chunks + embeddings)
 *   tsx scripts/index-search.ts --dry    # chunks only; embeddings stay NULL
 *
 * Idempotency: re-running with no content changes is fast — sourceHash
 * short-circuits the expensive embedding step.
 *
 * NOT in the deploy path. Embedding generation is too slow and too side
 * effecting to gate releases on. Run manually after content changes, or
 * wire into CI on `main`.
 */

import crypto from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";
import { routing } from "@/i18n/routing";
import { listAllSources, getSourceBody } from "@/lib/sources";
import { listAllPosts, getPostByLocalisedSlug } from "@/lib/blog";
import { readStaticPage } from "@/lib/static-page";
import {
  chunkLesson,
  chunkQuestion,
  chunkBlog,
  chunkSource,
  chunkStatic,
  type SearchChunkInput,
  type ContentType,
} from "@/lib/search/chunk";
import { embed, toPgVector, MODEL_VERSION } from "@/lib/search/embeddings";

const DRY = process.argv.includes("--dry");
// 4 is the sweet spot on a 4 GB VPS with no swap: bigger batches leak
// ONNX Runtime memory across iterations and trigger cgroup OOM after
// ~32 embeddings. Override with SEARCH_INDEX_BATCH on workstations
// with more headroom (dev machine: 32 works fine).
const BATCH_SIZE = Number(process.env.SEARCH_INDEX_BATCH ?? 4);

const prisma = new PrismaClient();

// ── Locale helpers ────────────────────────────────────────────────────────

type LocaleString = string;
type LocaleMap = Record<string, string>;

function localize(field: unknown, locale: LocaleString): string {
  if (!field || typeof field !== "object") return "";
  const map = field as LocaleMap;
  return map[locale] ?? map.en ?? "";
}

// ── Hashing ───────────────────────────────────────────────────────────────

function hashChunk(body: string): string {
  return crypto
    .createHash("sha256")
    .update(MODEL_VERSION + "\0" + body)
    .digest("hex");
}

// ── Collectors ────────────────────────────────────────────────────────────

async function collectLessonChunks(): Promise<SearchChunkInput[]> {
  const lessons = await prisma.lesson.findMany({
    include: { topic: { select: { slug: true } } },
  });
  const out: SearchChunkInput[] = [];
  for (const lesson of lessons) {
    for (const locale of routing.locales) {
      const mdx = localize(lesson.bodyMdx, locale);
      const title = localize(lesson.title, locale);
      if (!mdx || !title) continue;
      out.push(
        ...chunkLesson({
          locale,
          topicSlug: lesson.topic.slug,
          lessonSlug: lesson.slug,
          lessonTitle: title,
          mdx,
        }),
      );
    }
  }
  return out;
}

async function collectQuestionChunks(): Promise<SearchChunkInput[]> {
  const questions = await prisma.question.findMany();
  const out: SearchChunkInput[] = [];
  for (const q of questions) {
    for (const locale of routing.locales) {
      const stem = localize(q.stem, locale);
      const explanation = localize(q.explanation, locale);
      if (!stem || !explanation) continue;
      const options = q.options as unknown as Array<{
        id: string;
        text: LocaleMap;
      }>;
      const correctOpt = options.find((o) => o.id === q.correctOptionId);
      const correctOptionText = correctOpt ? localize(correctOpt.text, locale) : "";
      out.push(
        ...chunkQuestion({
          externalId: q.externalId,
          locale,
          stem,
          correctOptionText,
          explanation,
        }),
      );
    }
  }
  return out;
}

function collectBlogChunks(): SearchChunkInput[] {
  const posts = listAllPosts();
  const out: SearchChunkInput[] = [];
  for (const meta of posts) {
    for (const locale of routing.locales) {
      const localisedSlug = meta.slug[locale];
      if (!localisedSlug) continue;
      const post = getPostByLocalisedSlug(locale, localisedSlug);
      if (!post) continue;
      const title = meta.title[locale] ?? meta.title.en ?? "";
      out.push(
        ...chunkBlog({
          locale,
          dirSlug: meta.dirSlug,
          localisedSlug,
          title,
          mdx: post.bodyMdx,
        }),
      );
    }
  }
  return out;
}

function collectSourceChunks(): SearchChunkInput[] {
  const sources = listAllSources();
  const out: SearchChunkInput[] = [];
  for (const meta of sources) {
    for (const locale of routing.locales) {
      const mdx = getSourceBody(meta.id, locale);
      if (!mdx) continue;
      const sourceTitle =
        meta.shortTitle[locale] ??
        meta.shortTitle.en ??
        meta.officialTitle[locale] ??
        meta.officialTitle.en ??
        meta.id;
      out.push(
        ...chunkSource({
          locale,
          sourceId: meta.id,
          sourceTitle,
          mdx,
        }),
      );
    }
  }
  return out;
}

function collectStaticChunks(): SearchChunkInput[] {
  const pageTypes = ["faq", "guide", "privacy", "terms", "regulations"];
  const out: SearchChunkInput[] = [];
  for (const pageType of pageTypes) {
    for (const locale of routing.locales) {
      const mdx = readStaticPage(pageType, locale);
      if (!mdx) continue;
      out.push(...chunkStatic({ locale, pageType, mdx }));
    }
  }
  return out;
}

// ── Upsert + embed ────────────────────────────────────────────────────────

type ChunkKey = string; // `${contentType}|${contentId}|${locale}|${anchor}`

function keyOf(c: { contentType: string; contentId: string; locale: string; anchor: string }): ChunkKey {
  return `${c.contentType}|${c.contentId}|${c.locale}|${c.anchor}`;
}

type Stats = {
  new: number;
  changed: number;
  unchanged: number;
  deleted: number;
  /** chunks where content was unchanged but embedding still needed backfill */
  reembedded: number;
};

async function upsertChunks(
  inputs: SearchChunkInput[],
  contentType: ContentType,
): Promise<Stats> {
  const stats: Stats = {
    new: 0,
    changed: 0,
    unchanged: 0,
    deleted: 0,
    reembedded: 0,
  };

  // Existing rows for this contentType. We use $queryRaw so we can also
  // surface the embedding-IS-NULL flag — Prisma can't represent the vector
  // column type in findMany select.
  const existing = await prisma.$queryRaw<
    Array<{
      id: string;
      contentType: string;
      contentId: string;
      locale: string;
      anchor: string;
      sourceHash: string;
      modelVersion: string;
      hasEmbedding: boolean;
    }>
  >(Prisma.sql`
    SELECT id, "contentType", "contentId", locale, anchor,
           "sourceHash", "modelVersion",
           (embedding IS NOT NULL) AS "hasEmbedding"
    FROM "SearchChunk"
    WHERE "contentType" = ${contentType}
  `);
  const existingByKey = new Map<ChunkKey, (typeof existing)[number]>();
  for (const row of existing) existingByKey.set(keyOf(row), row);

  const inputKeys = new Set<ChunkKey>();
  const toEmbed: Array<{ id: string; body: string }> = [];

  for (const input of inputs) {
    const key = keyOf(input);
    inputKeys.add(key);
    const hash = hashChunk(input.body);
    const prev = existingByKey.get(key);

    const hashMatches =
      prev &&
      prev.sourceHash === hash &&
      prev.modelVersion === MODEL_VERSION;

    if (hashMatches && (DRY || prev.hasEmbedding)) {
      // Nothing to do: chunk is unchanged AND either we don't need
      // embeddings (dry mode) or the embedding is already present.
      stats.unchanged++;
      continue;
    }

    if (hashMatches && !prev.hasEmbedding && !DRY) {
      // Content unchanged but embedding missing (e.g. previous dry run).
      // Skip the content upsert; just queue for embed.
      stats.reembedded++;
      toEmbed.push({ id: prev.id, body: input.body });
      continue;
    }

    const upserted = await prisma.searchChunk.upsert({
      where: {
        contentType_contentId_locale_anchor: {
          contentType: input.contentType,
          contentId: input.contentId,
          locale: input.locale,
          anchor: input.anchor,
        },
      },
      create: {
        contentType: input.contentType,
        contentId: input.contentId,
        locale: input.locale,
        anchor: input.anchor,
        url: input.url,
        title: input.title,
        body: input.body,
        sourceHash: hash,
        modelVersion: MODEL_VERSION,
      },
      update: {
        url: input.url,
        title: input.title,
        body: input.body,
        sourceHash: hash,
        modelVersion: MODEL_VERSION,
      },
      select: { id: true },
    });

    if (prev) stats.changed++;
    else stats.new++;

    if (!DRY) toEmbed.push({ id: upserted.id, body: input.body });
  }

  // Delete chunks no longer present in the input set.
  for (const [key, row] of existingByKey) {
    if (!inputKeys.has(key)) {
      await prisma.searchChunk.delete({ where: { id: row.id } });
      stats.deleted++;
    }
  }

  // Batch embed.
  for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
    const batch = toEmbed.slice(i, i + BATCH_SIZE);
    const vectors = await embed(
      batch.map((c) => c.body),
      "passage",
    );
    for (let j = 0; j < batch.length; j++) {
      const pgvec = toPgVector(vectors[j]);
      // Prisma has no vector type — raw update with explicit ::vector cast.
      await prisma.$executeRaw(
        Prisma.sql`UPDATE "SearchChunk" SET "embedding" = ${pgvec}::vector WHERE "id" = ${batch[j].id}`,
      );
    }
    process.stdout.write(
      `    embedded ${Math.min(i + BATCH_SIZE, toEmbed.length)}/${toEmbed.length}\r`,
    );
  }
  if (toEmbed.length) process.stdout.write("\n");

  return stats;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(
    `Search indexer · ${DRY ? "DRY (no embeddings)" : "full"} · model=${MODEL_VERSION}`,
  );

  const families: Array<{ name: ContentType; collect: () => Promise<SearchChunkInput[]> | SearchChunkInput[] }> = [
    { name: "lesson", collect: collectLessonChunks },
    { name: "question", collect: collectQuestionChunks },
    { name: "blog", collect: () => collectBlogChunks() },
    { name: "source", collect: () => collectSourceChunks() },
    { name: "static", collect: () => collectStaticChunks() },
  ];

  for (const family of families) {
    process.stdout.write(`\n[${family.name}] collecting…\n`);
    const chunks = await family.collect();
    process.stdout.write(`[${family.name}] ${chunks.length} chunks; upserting…\n`);
    const stats = await upsertChunks(chunks, family.name);
    console.log(
      `[${family.name}] new=${stats.new} changed=${stats.changed} ` +
        `reembedded=${stats.reembedded} unchanged=${stats.unchanged} ` +
        `deleted=${stats.deleted}`,
    );
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
