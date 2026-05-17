-- pgvector extension. Provided by the pgvector/pgvector:pg16 image.
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "SearchChunk" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "anchor" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchChunk_pkey" PRIMARY KEY ("id")
);

-- Generated tsvector column for lexical FTS.
-- 'simple' config: no stemmer, predictable behavior across lv/en/ru.
ALTER TABLE "SearchChunk"
    ADD COLUMN "tsv" tsvector
    GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce("title", '') || ' ' || "body")
    ) STORED;

-- Vector column for semantic search.
-- 384 dims = Xenova/multilingual-e5-small output. Nullable so chunks
-- can be inserted before embeddings are computed (make index-search-dry).
ALTER TABLE "SearchChunk"
    ADD COLUMN "embedding" vector(384);

-- Indexes
CREATE UNIQUE INDEX "SearchChunk_contentType_contentId_locale_anchor_key"
    ON "SearchChunk"("contentType", "contentId", "locale", "anchor");

CREATE INDEX "SearchChunk_contentType_locale_idx"
    ON "SearchChunk"("contentType", "locale");

-- GIN on tsvector — lexical retrieval.
CREATE INDEX "SearchChunk_tsv_idx"
    ON "SearchChunk" USING GIN ("tsv");

-- HNSW on embedding (cosine distance) — semantic retrieval.
-- m=16, ef_construction=64 are pgvector defaults; ef_search is tuned at query time.
CREATE INDEX "SearchChunk_embedding_idx"
    ON "SearchChunk" USING hnsw ("embedding" vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
