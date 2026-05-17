# Production image for dronelingo.
# Mirrors the ALTEKO/MezaData multi-stage pattern: build → prune → minimal runner.
#
# Expects:
#   package.json + package-lock.json   (npm)
#   next.config.{mjs,ts,js}            (Next.js 15 standalone output: { output: 'standalone' })
#   prisma/schema.prisma               (Prisma ORM)
#   scripts/docker-entrypoint.sh       (runs migrations then exec)
#
# This file is committed before the application code lands. CI will fail with
# "no package.json" until the first code commit — that's the intended signal.

# node:24-bookworm-slim — Debian (glibc), required for the @xenova/transformers
# ONNX Runtime native bindings. Alpine + musl-libc + libc6-compat shim crashes
# at `require("@xenova/transformers")` with `Ort::Exception` because ONNX
# distributes glibc-only prebuilt binaries.
FROM node:24-bookworm-slim AS base
WORKDIR /app

# ── Stage 1: deps — install with cache-friendly layer ──────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
# Prisma schema must be present before `npm ci` runs because the package.json
# postinstall hook ("prisma generate") reads from it. Cheap cache hit: prisma/
# rarely changes versus package files.
COPY prisma ./prisma
RUN npm ci

# ── Stage 2: builder — Prisma + Next build ─────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV SKIP_ENV_VALIDATION=true
# Bake production URL into the client bundle at build time.
# NEXT_PUBLIC_* vars must be present during `next build`, not just at runtime.
ARG NEXT_PUBLIC_SITE_URL=https://dronelingo.eu
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Prisma generate is idempotent and runs from the schema in prisma/.
RUN npx prisma generate
RUN npm run build

# ── Stage 3: runner — minimal Debian, non-root ─────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid 1001 --no-create-home --shell /usr/sbin/nologin nextjs
# wget for the orchestrator healthcheck.
RUN apt-get update && apt-get install -y --no-install-recommends wget \
 && rm -rf /var/lib/apt/lists/*

# Next.js standalone output (set output: 'standalone' in next.config).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Full content/ tree — entrypoint runs scripts/import-content.ts on
# every start to upsert topics, lessons, and questions into Postgres.
COPY --from=builder --chown=nextjs:nodejs /app/content ./content

# Import script — runs after `prisma migrate deploy`.
COPY --from=builder --chown=nextjs:nodejs /app/scripts/import-content.ts ./scripts/import-content.ts

# Search indexer + source tree it imports (runs on demand via
# `docker compose exec app npx tsx scripts/index-search.ts`).
# Bundled here so prod can rebuild the SearchChunk table without a
# separate dev box. tsconfig.json carries the `@/` path alias resolution.
COPY --from=builder --chown=nextjs:nodejs /app/scripts/index-search.ts ./scripts/index-search.ts
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Prisma schema needed for `prisma migrate deploy` at container start.
COPY --from=builder /app/prisma ./prisma

# Replace the standalone-bundled node_modules with the full builder
# install. The standalone tracer only ships modules used by the Next.js
# runtime, so prisma CLI's own transitive deps (@prisma/config →
# `effect`, etc.) go missing. The image is a bit larger but the
# entrypoint's `prisma migrate deploy` resolves reliably.
COPY --from=builder /app/node_modules ./node_modules

# Entrypoint: prisma migrate deploy then exec CMD.
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
# Bind on all interfaces so the in-container healthcheck (wget localhost:3000)
# can reach the server. Without this, Docker injects HOSTNAME=<container-id>
# and Next.js standalone binds only to that hostname, leaving 127.0.0.1
# unanswered and the healthcheck permanently unhealthy.
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
