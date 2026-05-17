# Search Architecture

Status: active engineering design for the dronelingo search subsystem.

Primary issue: `#77`
Coordinated with: `#75` (source library UX), `#76` (ingestion policy)

This document defines how dronelingo indexes and serves search across
lessons, questions, blog posts, source-library pages, and static pages.

## Goals

- give learners a single search box that lands them on the right lesson
  section, question explanation, or regulation paragraph — not just a
  top-level page;
- preserve locale fidelity (lv-default site, with en and ru in parity for
  Tier-1 content);
- ship hybrid retrieval (lexical + semantic) as a single MVP rather than
  iterating through lexical-only, then vector-only intermediate releases;
- keep operational footprint inside the existing Postgres container.

## Non-goals (for this MVP)

- federated search across third-party regulators;
- per-user personalization or query history;
- a custom vector database;
- re-ranking with a heavier cross-encoder model (deferred to follow-up);
- query expansion or synonym dictionaries (deferred to follow-up).

## Engine choice

**Vector storage:** `pgvector` (`pgvector/pgvector:pg16` image).
**Lexical retrieval:** Postgres built-in FTS (`to_tsvector` + GIN).
**Embedding generator:** local Node model via `@xenova/transformers`,
checkpoint `Xenova/multilingual-e5-small` (384 dimensions, multilingual
including Latvian and Russian).

Rationale:

- the project already runs Postgres 16 for content data; co-locating
  vector storage avoids a new operational surface (no Pinecone, no
  Qdrant container, no managed vector DB);
- the embedding model runs in the existing Node runtime — no Python
  sidecar, no external API key, no per-embedding cost. The trade-off
  is a one-time ~120 MB model download on the indexer host;
- Postgres FTS gives high-quality matches for exact terms our learners
  type (`VLOS`, `UAS.OPEN.060`, `BGKIS`, `Art. 15`) that pure semantic
  retrieval misses;
- one hybrid retriever ships in Phase 1, avoiding the wasted scaffolding
  of building a lexical-only release first and then rewriting the
  `/api/search` contract and UI to add vectors.

## Indexed entities

| Type      | Source                                                       | Chunk granularity                              | Approximate count |
|-----------|--------------------------------------------------------------|------------------------------------------------|-------------------|
| `lesson`  | `content/lessons/<topic>/<lesson>/{lv,en,ru}.mdx`            | one chunk per `##` section                     | ~120 sections × 3 locales |
| `question`| `content/questions/<topic>.yml` (already in `Question` table)| one chunk per question per locale              | ~429 × 3          |
| `blog`    | `content/blog/<dir>/{lv,en,ru}.mdx`                          | one chunk per `##` section                     | ~50 × 3           |
| `source`  | `content/sources/<id>/{lv,en,ru}.mdx`                        | one chunk per explicit `{#anchor}` section     | ~30 × 3           |
| `static`  | `content/static/{faq,guide,privacy,terms,regulations}/<locale>.mdx` | per `##` (or per FAQ Q, per guide step) | ~40 × 3           |

**Out of scope (not indexed):**

- `meta.yml` and `seo.yml` files (metadata, not user-facing prose);
- MDX component props that are not human-readable copy
  (`<CinematicScene imagePrompt="…">`);
- `MiniQuiz` blocks (questions are indexed separately via the question
  family, and re-indexing them as lesson chunks creates near-duplicates);
- attempt records, exam results, user data;
- the search results page itself (`/search` is excluded from
  `sitemap.ts` PUBLIC_PATHS).

## Chunking strategy

The chunker lives in `src/lib/search/chunk.ts` and produces typed
`SearchChunkInput` records that the indexer upserts.

### Lessons

- One chunk per `##` heading after MDX-to-text conversion.
- Body target: 400–800 tokens. If a section exceeds 1000 tokens, split
  on paragraph boundaries with one-paragraph overlap.
- `anchor = slugify(headingText)`.
- `url = /{locale}/learn/{topicSlug}/{lessonSlug}#{anchor}`.
- `title = lesson title + " · " + headingText`.

Custom MDX components extract specific prop fields:

| Component         | Text extracted                            |
|-------------------|-------------------------------------------|
| `MissionBriefing` | `objective` prop + children prose         |
| `CinematicScene`  | `caption` prop (image prompt skipped)     |
| `Artefact`        | `description` + `caption`                 |
| `Scenario`        | children prose                            |
| `MemoryAnchor`    | children prose                            |
| `CommonMistakes`  | children prose                            |
| `MiniQuiz`        | skipped (questions indexed separately)    |

Unknown JSX names throw at extraction time so a newly-introduced
component cannot silently disappear from the index.

### Questions

- One chunk per (questionId, locale).
- Body = `stem + "\n\n" + correct option text + "\n\n" + explanation`.
- **Distractor rationales are NOT embedded** — including them pollutes
  the vector neighborhood (a question about "wrong answer X" surfaces
  for "X" queries).
- `anchor = null`.
- `url = /{locale}/practice?qid={externalId}`.
- `title = stem (truncated to 80 chars)`.

### Blog

- Per `##` section, same MDX-to-text path as lessons (no custom
  components to handle here).
- 400–800 token target, paragraph-overlap split if oversized.
- `url = /{locale}/blog/{localisedSlug}#{anchor}` — note the per-locale
  slug from blog `meta.yml`.

### Sources

- Already authored with `## Heading {#anchor-id}` markers. The chunker
  splits on those boundaries verbatim.
- `url = /{locale}/regulations/{sourceId}#{anchor}`.
- Per-type retrieval boost is highest (×1.3) because sources are the
  authoritative answer family for regulatory queries.

### Static pages

- **FAQ** — one chunk per `## Question`.
- **Guide** — one chunk per numbered step.
- **Privacy / Terms / Regulations** — one chunk per `##` section.
- `url = /{locale}/{pageType}#{anchor}`.

## Metadata schema

The single polymorphic `SearchChunk` table in `prisma/schema.prisma`:

```prisma
model SearchChunk {
  id           String   @id @default(cuid())
  contentType  String   // 'lesson' | 'question' | 'blog' | 'source' | 'static'
  contentId    String   // topicSlug/lessonSlug, questionId, blogSlug, sourceId, staticPage
  locale       String   // 'lv' | 'en' | 'ru'
  anchor       String?
  url          String
  title        String
  body         String   @db.Text
  sourceHash   String   // sha256(body + modelVersion)
  modelVersion String   // pin so model upgrades trigger reindex
  // tsv         tsvector  — generated column, declared via raw SQL
  // embedding   vector(384)? — declared via raw SQL
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([contentType, contentId, locale, anchor])
  @@index([contentType, locale])
}
```

The hand-edited migration adds:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "SearchChunk"
  ADD COLUMN "tsv" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || body)
  ) STORED;

ALTER TABLE "SearchChunk"
  ADD COLUMN "embedding" vector(384);

CREATE INDEX "SearchChunk_tsv_idx"
  ON "SearchChunk" USING GIN ("tsv");

CREATE INDEX "SearchChunk_embedding_idx"
  ON "SearchChunk" USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

Why these choices:

- `tsvector` config is `'simple'` (no stemmer): English stemming on
  Latvian or Russian text hurts recall, and we have no `'latvian'`
  built-in. Stemming is sacrificed for predictable multilingual
  behavior;
- HNSW beats IVFFlat at our corpus size (~600 chunks). IVFFlat needs
  enough training vectors to pick a sensible `lists` value; HNSW is
  robust at this scale and continues to scale upward without retraining;
- `m=16, ef_construction=64` are the pgvector defaults — fine for v1,
  tune later if recall is poor;
- the unique constraint on
  `(contentType, contentId, locale, anchor)` makes upserts idempotent
  and lets the indexer skip unchanged chunks via `sourceHash`.

## Indexing pipeline

The indexer lives at `scripts/index-search.ts` and is triggered
manually with `make index-search` (or in CI on `main`). It is **not**
in the deploy path — embedding generation is too slow and too
side-effecting to gate releases on.

Pseudo-flow:

1. Walk every content family using the existing loaders
   (`src/lib/sources.ts`, `src/lib/blog.ts`, `src/lib/static-page.ts`,
   `prisma.lesson.findMany()`, `prisma.question.findMany()`).
2. For each loaded item, run the chunker. Each chunk has a stable
   `sourceHash = sha256(body + modelVersion)`.
3. UPSERT the row keyed by `(contentType, contentId, locale, anchor)`.
4. If the existing row's `sourceHash` matches, skip embedding.
   Otherwise queue the chunk for embedding.
5. Batch the queue (size 32), call
   `embed(texts)` which prepends `"passage: "` to each input (e5
   requirement), and write the resulting 384-d vectors back.
6. Print summary: `new=N, changed=N, unchanged=N, deleted=N`.

Two Make targets:

- `make index-search` — full pipeline (chunks + embeddings).
- `make index-search-dry` — chunks only, leaves `embedding = NULL`.
  Lets developers work on lexical search without downloading the model.

A `SEARCH_VECTOR_ENABLED` env flag short-circuits the vector retriever
when set to `false`, so the search endpoint degrades gracefully to
lexical-only when no embeddings exist yet.

## Query pipeline

The query library lives at `src/lib/search/query.ts`. The HTTP endpoint
at `src/app/api/search/route.ts` is a thin Zod-validated wrapper.

For a query `q` in locale `loc`:

1. **Lexical (FTS):**
   `SELECT id, ts_rank_cd("tsv", plainto_tsquery('simple', $1)) AS rank`
   `FROM "SearchChunk"`
   `WHERE locale = $2 AND "tsv" @@ plainto_tsquery('simple', $1)`
   `ORDER BY rank DESC LIMIT 50;`
2. **Vector:** embed the query with `"query: "` e5 prefix, then:
   `SELECT id, 1 - ("embedding" <=> $1) AS score`
   `FROM "SearchChunk"`
   `WHERE locale = $2 AND "embedding" IS NOT NULL`
   `ORDER BY "embedding" <=> $1 LIMIT 50;`
3. **Fuse with RRF (Reciprocal Rank Fusion):**
   `score(d) = Σᵢ 1 / (k + rankᵢ(d))`, where `k = 60` and `i ∈
   {fts, vector}`.
4. **Apply per-type multiplicative boost:**

   | Type      | Boost |
   |-----------|-------|
   | `source`  | ×1.3  |
   | `lesson`  | ×1.1  |
   | `blog`    | ×1.0  |
   | `static`  | ×1.0  |
   | `question`| ×0.8  |

5. Return top 20 results.
6. **Locale fallback:** if step 5 returns zero results for the
   requested locale, re-run the query with `locale = 'en'`. Never fall
   back across locales when at least one in-locale result exists.

## API surface

```http
POST /api/search
Content-Type: application/json

{
  "q": "kā reģistrēt operatoru",
  "locale": "lv",
  "limit": 20
}
```

Response:

```json
{
  "took": 38,
  "results": [
    {
      "type": "source",
      "title": "CAA Latvia — Reģistrācija · Operatora reģistrācija",
      "snippet": "…Operatora reģistrācija notiek caur e.caa.gov.lv…",
      "url": "/lv/regulations/caa-lv-registration#operator-registration",
      "locale": "lv",
      "score": 0.0418
    }
  ]
}
```

Rate limit: 30 requests/minute/IP. Bad input returns 400 with Zod
error details; empty `q` returns `{ results: [] }` without hitting the
DB.

## Anchor strategy

`rehype-slug` is added to `src/lib/mdx-options.ts` so every rendered
`##` heading gets an `id` attribute computed from the heading text. The
indexer uses the same slugify function on the same heading text, so
anchors round-trip between rendered pages and search-result URLs.

Source-library pages with explicit `## Heading {#anchor-id}` keep
their explicit IDs because `rehype-slug` does not overwrite existing
`id` attributes.

Known limitation: renaming a heading silently changes its anchor and
breaks any URL someone shared. Mitigation: the anchor-collision linter
(follow-up issue #77.4) will fail CI if two headings in the same file
slugify to the same id; heading-rename churn is logged during indexing
so it surfaces in PR review.

## Locale handling

- `locale` is required on every chunk and every query.
- The indexer fans out per locale: lessons exist in `lv.mdx`, `en.mdx`,
  `ru.mdx` and produce three distinct chunks per section.
- Blog posts have per-locale **slugs** (`meta.yml`
  `slug: { lv, en, ru }`); the indexer resolves each chunk's `url` to
  the locale-correct slug.
- Tier-2 EU languages (DeepL auto-translation) are explicitly excluded
  from indexing for v1 — embedding quality on machine-translated copy
  is poor and the corpus is small enough to live without it.

## Ranking & boosts

RRF was chosen over weighted-sum because the two retrievers produce
scores on incompatible scales (`ts_rank_cd` is unbounded, cosine
similarity is bounded). RRF is parameter-light, robust, and matches
the literature consensus for hybrid retrieval on small corpora.

The per-type boost above is intentionally conservative:

- sources are boosted because they are authoritative for the
  regulatory-lookup queries that dominate this domain;
- questions are de-boosted because the question bank is the largest
  family by row count and unboosted would drown out lesson
  explanations.

These boosts will be re-tuned with click data once the search-logging
follow-up lands.

## Risks

- **Latvian retrieval quality.** `multilingual-e5-small` is decent on
  Latvian but not Latvian-SOTA. The hybrid FTS layer catches keyword
  queries even when the vector retriever underperforms; a cross-encoder
  reranker follow-up exists to upgrade this without rewiring the
  indexer.
- **Anchor drift.** Heading renames change anchors. The anchor-collision
  linter and indexing churn log are the planned defenses; no automatic
  redirect map for v1.
- **Custom MDX components.** New components added to lessons must be
  registered in `mdx-to-text.ts`. The extractor throws on unknown JSX
  names by default so this is a build-time failure, not a silent
  degradation.
- **HNSW recall on small corpus.** ~600 rows is below HNSW's sweet
  spot. Recall remains correct (HNSW is exact for small graphs); tune
  `ef_search` at query time if offline eval shows misses.
- **Model bundle size.** ~120 MB first-time download on the indexer
  host. Documented in operations; production deploy uses an image that
  already includes the model cache (or warms it on first
  `make index-search` after deploy).
- **Schema migration on shared VPS.** Switching from `postgres:16-alpine`
  to `pgvector/pgvector:pg16` restarts the DB container. The deploy
  workflow already takes a pre-deploy `pg_dump` and gates on
  `/api/health`; the image swap is tested locally against a restored
  prod backup before release.

## Follow-up issues

Filed after #77 closes:

1. **feat(search): reranker** — cross-encoder
   (e.g., `Xenova/bge-reranker-base`) over top-50 hybrid candidates.
2. **feat(search): query expansion + synonyms** — drone-domain
   dictionary (`BVLOS` ↔ `beyond visual line of sight`, `geo-zona` ↔
   `geographical zone`, etc.).
3. **feat(search): zero-result and low-CTR query logging** —
   minimal dashboard for tuning boosts and seeding the synonym list.
4. **chore(search): anchor-collision linter** — CI check that fails
   when two `##` in the same file slugify to the same id.
5. **feat(search): highlight-on-target URLs** — append
   `#:~:text=` fragments where supported, fall back to plain anchors.
