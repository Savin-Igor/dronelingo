/**
 * Idempotent content importer for dronelingo.
 *
 * Reads YAML topics, MDX lessons, and YAML question banks from `content/`
 * and UPSERTs them into Postgres via Prisma.
 *
 * Usage:
 *   tsx scripts/import-content.ts
 *
 * Layout (see .claude/plans/content-importer.md for the full contract):
 *   content/topics/<slug>.yml
 *   content/lessons/<topic-slug>/<lesson-slug>/{meta.yml, lv.mdx, en.mdx, ru.mdx}
 *   content/questions/<topic-slug>.yml
 *
 * Idempotency: re-running with no file changes performs UPSERTs that touch
 * `updatedAt` but produce no logical diff. The summary distinguishes
 * created vs updated rows for the current run.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";

const CONTENT_DIR = resolve(process.cwd(), "content");

// ── Validation schemas ────────────────────────────────────────────────────

const Multilingual = z
  .record(z.string(), z.string().min(1))
  .refine((v) => typeof v.en === "string" && v.en.length > 0, {
    message: "missing required `en` fallback",
  });

const TopicYaml = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ord: z.number().int().nonnegative(),
  title: Multilingual,
  summary: Multilingual,
});

const LessonMetaYaml = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ord: z.number().int().nonnegative(),
  title: Multilingual,
  sourceRef: z.string().min(1).optional(),
});

const QuestionYaml = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stem: Multilingual,
  options: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9]+$/),
        text: Multilingual,
      }),
    )
    .min(2),
  correctOptionId: z.string(),
  explanation: Multilingual,
  sourceRef: z.string().min(1),
  difficulty: z.number().int().min(1).max(5).optional(),
});

const QuestionsYaml = z.array(QuestionYaml);

// ── Helpers ───────────────────────────────────────────────────────────────

type Counts = { created: number; updated: number };

function emptyCounts(): Counts {
  return { created: 0, updated: 0 };
}

function readYaml<T>(path: string, schema: z.ZodType<T>): T {
  const raw = readFileSync(path, "utf-8");
  const parsed = parseYaml(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Validation failed for ${path}:\n${issues}`);
  }
  return result.data;
}

function readMdxLocales(lessonDir: string, locales: string[]): Record<string, string> {
  const body: Record<string, string> = {};
  for (const locale of locales) {
    const file = join(lessonDir, `${locale}.mdx`);
    if (!existsSync(file)) {
      throw new Error(
        `Lesson ${lessonDir} declares title.${locale} in meta.yml but ${locale}.mdx is missing`,
      );
    }
    body[locale] = readFileSync(file, "utf-8");
  }
  return body;
}

function listDirs(parent: string): string[] {
  if (!existsSync(parent)) return [];
  return readdirSync(parent).filter((entry) =>
    statSync(join(parent, entry)).isDirectory(),
  );
}

function listFiles(parent: string, ext: string): string[] {
  if (!existsSync(parent)) return [];
  return readdirSync(parent).filter((f) => f.endsWith(ext));
}

// ── Importers ─────────────────────────────────────────────────────────────

async function importTopics(prisma: PrismaClient): Promise<Map<string, string>> {
  const counts = emptyCounts();
  const slugToId = new Map<string, string>();
  const topicsDir = join(CONTENT_DIR, "topics");
  const files = listFiles(topicsDir, ".yml");

  for (const file of files) {
    const data = readYaml(join(topicsDir, file), TopicYaml);
    const existing = await prisma.topic.findUnique({ where: { slug: data.slug } });
    const row = await prisma.topic.upsert({
      where: { slug: data.slug },
      create: {
        slug: data.slug,
        ord: data.ord,
        title: data.title as Prisma.InputJsonValue,
        summary: data.summary as Prisma.InputJsonValue,
      },
      update: {
        ord: data.ord,
        title: data.title as Prisma.InputJsonValue,
        summary: data.summary as Prisma.InputJsonValue,
      },
    });
    slugToId.set(data.slug, row.id);
    if (existing) counts.updated++;
    else counts.created++;
  }

  console.log(
    `topics:    ${files.length} total · ${counts.created} created · ${counts.updated} updated`,
  );
  return slugToId;
}

async function importLessons(
  prisma: PrismaClient,
  topicSlugToId: Map<string, string>,
): Promise<void> {
  const counts = emptyCounts();
  let total = 0;
  const lessonsRoot = join(CONTENT_DIR, "lessons");

  for (const topicSlug of listDirs(lessonsRoot)) {
    const topicId = topicSlugToId.get(topicSlug);
    if (!topicId) {
      throw new Error(
        `content/lessons/${topicSlug}/ has no matching content/topics/${topicSlug}.yml`,
      );
    }

    const topicDir = join(lessonsRoot, topicSlug);
    for (const lessonSlug of listDirs(topicDir)) {
      const lessonDir = join(topicDir, lessonSlug);
      const meta = readYaml(join(lessonDir, "meta.yml"), LessonMetaYaml);
      if (meta.slug !== lessonSlug) {
        throw new Error(
          `Lesson dir name "${lessonSlug}" does not match meta.yml slug "${meta.slug}" at ${lessonDir}`,
        );
      }
      const titleLocales = Object.keys(meta.title);
      const bodyMdx = readMdxLocales(lessonDir, titleLocales);

      const existing = await prisma.lesson.findUnique({
        where: { topicId_slug: { topicId, slug: meta.slug } },
      });
      await prisma.lesson.upsert({
        where: { topicId_slug: { topicId, slug: meta.slug } },
        create: {
          topicId,
          slug: meta.slug,
          ord: meta.ord,
          title: meta.title as Prisma.InputJsonValue,
          bodyMdx: bodyMdx as Prisma.InputJsonValue,
          sourceRef: meta.sourceRef ?? null,
        },
        update: {
          ord: meta.ord,
          title: meta.title as Prisma.InputJsonValue,
          bodyMdx: bodyMdx as Prisma.InputJsonValue,
          sourceRef: meta.sourceRef ?? null,
        },
      });
      total++;
      if (existing) counts.updated++;
      else counts.created++;
    }
  }

  console.log(
    `lessons:   ${total} total · ${counts.created} created · ${counts.updated} updated`,
  );
}

async function importQuestions(
  prisma: PrismaClient,
  topicSlugToId: Map<string, string>,
): Promise<void> {
  const counts = emptyCounts();
  let total = 0;
  const questionsDir = join(CONTENT_DIR, "questions");
  const files = listFiles(questionsDir, ".yml");

  for (const file of files) {
    const topicSlug = file.replace(/\.yml$/, "");
    const topicId = topicSlugToId.get(topicSlug);
    if (!topicId) {
      throw new Error(
        `content/questions/${file} has no matching content/topics/${topicSlug}.yml`,
      );
    }

    const questions = readYaml(join(questionsDir, file), QuestionsYaml);
    for (const q of questions) {
      const optionIds = q.options.map((o) => o.id);
      if (!optionIds.includes(q.correctOptionId)) {
        throw new Error(
          `Question ${q.id} in ${file}: correctOptionId "${q.correctOptionId}" is not in options [${optionIds.join(", ")}]`,
        );
      }

      const existing = await prisma.question.findUnique({
        where: { externalId: q.id },
      });
      await prisma.question.upsert({
        where: { externalId: q.id },
        create: {
          externalId: q.id,
          topicId,
          stem: q.stem as Prisma.InputJsonValue,
          options: q.options as unknown as Prisma.InputJsonValue,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation as Prisma.InputJsonValue,
          sourceRef: q.sourceRef,
          difficulty: q.difficulty ?? null,
        },
        update: {
          topicId,
          stem: q.stem as Prisma.InputJsonValue,
          options: q.options as unknown as Prisma.InputJsonValue,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation as Prisma.InputJsonValue,
          sourceRef: q.sourceRef,
          difficulty: q.difficulty ?? null,
        },
      });
      total++;
      if (existing) counts.updated++;
      else counts.created++;
    }
  }

  console.log(
    `questions: ${total} total · ${counts.created} created · ${counts.updated} updated`,
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`content/ directory not found at ${CONTENT_DIR}`);
  }
  const prisma = new PrismaClient();
  try {
    const topicSlugToId = await importTopics(prisma);
    await importLessons(prisma, topicSlugToId);
    await importQuestions(prisma, topicSlugToId);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
