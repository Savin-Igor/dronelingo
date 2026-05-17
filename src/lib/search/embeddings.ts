// Local embeddings via @xenova/transformers — no external API key, no
// Python sidecar. Model: multilingual-e5-small (384 dims), good on lv/en/ru.
//
// The pipeline downloads model weights on first use (~120 MB) into the
// HuggingFace cache directory. The download is a one-time cost per host.
//
// Dynamic import prevents the ONNX Runtime native binary from being
// evaluated during `next build`, which crashes on memory-limited CI runners.

export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";

// Pinned in SearchChunk.modelVersion so a model upgrade invalidates the
// sourceHash cache and triggers a re-embed.
export const MODEL_VERSION = "multilingual-e5-small-v1";

export const EMBEDDING_DIM = 384;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelinePromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPipeline(): Promise<any> {
  if (!pipelinePromise) {
    pipelinePromise = import("@xenova/transformers").then(
      ({ env: xenovaEnv, pipeline }) => {
        // Point the cache at a persistent volume in production so model
        // weights survive container restarts. Falls back to the package
        // default (node_modules/@xenova/transformers/src/.cache/) in dev.
        if (process.env.TRANSFORMERS_CACHE) {
          xenovaEnv.cacheDir = process.env.TRANSFORMERS_CACHE;
        }
        return pipeline("feature-extraction", EMBEDDING_MODEL);
      },
    );
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
