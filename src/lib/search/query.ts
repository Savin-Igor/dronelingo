// Hybrid search query: Postgres FTS + pgvector cosine, fused with RRF.
//
// See docs/search-architecture.md for the full pipeline and ranking model.

import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "@/env";
import { routing } from "@/i18n/routing";
import { embed, toPgVector } from "./embeddings";
import type { ContentType } from "./chunk";

export type SearchResult = {
  type: ContentType;
  title: string;
  snippet: string;
  url: string;
  locale: string;
  score: number;
};

const FALLBACK_LOCALE = "en";
const PER_RETRIEVER_LIMIT = 50;
const DEFAULT_RESULT_LIMIT = 20;
const RRF_K = 60;
const SNIPPET_CHARS = 220;

const TYPE_BOOST: Record<string, number> = {
  source: 1.3,
  lesson: 1.1,
  blog: 1.0,
  static: 1.0,
  question: 0.8,
};

type RetrievedRow = {
  id: string;
  rank: number;
};

type ChunkRow = {
  id: string;
  contentType: string;
  url: string;
  title: string;
  body: string;
  locale: string;
};

const prisma = new PrismaClient();

async function ftsRetrieve(
  q: string,
  locale: string,
): Promise<RetrievedRow[]> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT id
      FROM "SearchChunk"
      WHERE locale = ${locale}
        AND tsv @@ plainto_tsquery('simple', ${q})
      ORDER BY ts_rank_cd(tsv, plainto_tsquery('simple', ${q})) DESC
      LIMIT ${PER_RETRIEVER_LIMIT}
    `,
  );
  return rows.map((r, i) => ({ id: r.id, rank: i + 1 }));
}

async function vectorRetrieve(
  q: string,
  locale: string,
): Promise<RetrievedRow[]> {
  if (!env.SEARCH_VECTOR_ENABLED) return [];
  const [vec] = await embed([q], "query");
  if (!vec) return [];
  const pgvec = toPgVector(vec);
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT id
      FROM "SearchChunk"
      WHERE locale = ${locale}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${pgvec}::vector
      LIMIT ${PER_RETRIEVER_LIMIT}
    `,
  );
  return rows.map((r, i) => ({ id: r.id, rank: i + 1 }));
}

/**
 * Reciprocal Rank Fusion across the two retrievers, then per-type boost.
 * Returns ids in descending fused-score order.
 */
function fuse(
  fts: RetrievedRow[],
  vec: RetrievedRow[],
  typesById: Map<string, string>,
): Array<{ id: string; score: number }> {
  const scores = new Map<string, number>();
  for (const r of fts) {
    scores.set(r.id, (scores.get(r.id) ?? 0) + 1 / (RRF_K + r.rank));
  }
  for (const r of vec) {
    scores.set(r.id, (scores.get(r.id) ?? 0) + 1 / (RRF_K + r.rank));
  }
  const boosted: Array<{ id: string; score: number }> = [];
  for (const [id, raw] of scores) {
    const type = typesById.get(id) ?? "static";
    const boost = TYPE_BOOST[type] ?? 1.0;
    boosted.push({ id, score: raw * boost });
  }
  boosted.sort((a, b) => b.score - a.score);
  return boosted;
}

function makeSnippet(body: string, q: string): string {
  const lower = body.toLowerCase();
  const needle = q.toLowerCase().split(/\s+/).find((t) => t.length >= 3);
  if (needle) {
    const idx = lower.indexOf(needle);
    if (idx >= 0) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(body.length, start + SNIPPET_CHARS);
      const prefix = start > 0 ? "…" : "";
      const suffix = end < body.length ? "…" : "";
      return prefix + body.slice(start, end).trim() + suffix;
    }
  }
  // No keyword hit (semantic-only match) — show the first SNIPPET_CHARS.
  if (body.length <= SNIPPET_CHARS) return body.trim();
  return body.slice(0, SNIPPET_CHARS).trim() + "…";
}

/**
 * Hybrid search entry point. Returns top-N results for `q` in `locale`,
 * falling back to English if no in-locale results are found.
 */
export async function searchHybrid(
  q: string,
  locale: string,
  limit: number = DEFAULT_RESULT_LIMIT,
): Promise<SearchResult[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const results = await searchOneLocale(trimmed, locale, limit);
  if (results.length > 0 || locale === FALLBACK_LOCALE) return results;
  return searchOneLocale(trimmed, FALLBACK_LOCALE, limit);
}

async function searchOneLocale(
  q: string,
  locale: string,
  limit: number,
): Promise<SearchResult[]> {
  // Run both retrievers in parallel.
  const [fts, vec] = await Promise.all([
    ftsRetrieve(q, locale),
    vectorRetrieve(q, locale),
  ]);

  const allIds = new Set<string>();
  for (const r of fts) allIds.add(r.id);
  for (const r of vec) allIds.add(r.id);
  if (allIds.size === 0) return [];

  // Hydrate rows + capture contentType for boosts.
  const rows = await prisma.searchChunk.findMany({
    where: { id: { in: Array.from(allIds) } },
    select: {
      id: true,
      contentType: true,
      url: true,
      title: true,
      body: true,
      locale: true,
    },
  });
  const byId = new Map<string, ChunkRow>();
  for (const r of rows) byId.set(r.id, r);
  const typesById = new Map<string, string>();
  for (const r of rows) typesById.set(r.id, r.contentType);

  const fused = fuse(fts, vec, typesById);
  const top = fused.slice(0, limit);

  const out: SearchResult[] = [];
  for (const { id, score } of top) {
    const row = byId.get(id);
    if (!row) continue;
    out.push({
      type: row.contentType as ContentType,
      title: row.title,
      snippet: makeSnippet(row.body, q),
      url: row.url,
      locale: row.locale,
      score,
    });
  }
  return out;
}
