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

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
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
# Prisma generate is idempotent and runs from the schema in prisma/.
RUN npx prisma generate
RUN npm run build

# ── Stage 3: runner — minimal alpine, non-root ─────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs
# wget for the orchestrator healthcheck (smaller than curl on alpine).
RUN apk add --no-cache wget

# Next.js standalone output (set output: 'standalone' in next.config).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Static MDX content read at request time by `src/lib/static-page.ts`.
COPY --from=builder --chown=nextjs:nodejs /app/content/static ./content/static

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
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
