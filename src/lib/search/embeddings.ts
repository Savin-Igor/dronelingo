// Local embeddings via @xenova/transformers — no external API key, no
// Python sidecar. Model: multilingual-e5-small (384 dims), good on lv/en/ru.
//
// The pipeline downloads model weights on first use (~120 MB) into the
// HuggingFace cache directory. The download is a one-time cost per host.

import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";

// Pinned in SearchChunk.modelVersion so a model upgrade invalidates the
// sourceHash cache and triggers a re-embed.
export const MODEL_VERSION = "multilingual-e5-small-v1";

export const EMBEDDING_DIM = 384;

let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = pipeline(
      "feature-extraction",
      EMBEDDING_MODEL,
    ) as Promise<FeatureExtractionPipeline>;
  }
  return pipelinePromise;
}

/**
 * Warm the model up at app boot so the first user query doesn't pay the
 * cold-start cost. Caller is expected to not await this.
 */
export function warmEmbeddings(): Promise<void> {
  return getPipeline().then(() => undefined);
}

type EmbedKind = "passage" | "query";

/**
 * Embed a batch of texts. e5 requires a `"passage: "` or `"query: "` prefix
 * — indexing uses `passage`, query-time uses `query`.
 *
 * Returns one 384-dim Float32-backed array per input.
 */
export async function embed(
  texts: string[],
  kind: EmbedKind,
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const pipe = await getPipeline();
  const prefixed = texts.map((t) => `${kind}: ${t}`);
  const output = await pipe(prefixed, { pooling: "mean", normalize: true });
  // Output shape: [batch, dim]. Convert each row to plain number[] for
  // serialization into Postgres.
  const data = output.data as Float32Array;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    const start = i * EMBEDDING_DIM;
    out.push(Array.from(data.slice(start, start + EMBEDDING_DIM)));
  }
  return out;
}

/**
 * Convert a number[] embedding into the pgvector text format `[v1,v2,…]`.
 * Prisma has no native vector type so we ship the value as a string and
 * cast in the SQL: `$1::vector`.
 */
export function toPgVector(v: number[]): string {
  return "[" + v.join(",") + "]";
}
