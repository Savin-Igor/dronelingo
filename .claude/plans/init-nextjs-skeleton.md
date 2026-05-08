# Initialize Next.js 15 + Prisma + Postgres skeleton

Reference: GitHub issue #4 (Savin-Igor/dronelingo).

## Goal

Land the first runnable code so that:
- `make dev-setup` boots Postgres + Next.js dev server, `/` renders
- `make build` produces `.next/standalone` consumable by the existing `Dockerfile`
- `npm run type-check` and `npm run lint` exit 0
- `/api/health` returns 200 with `{status,db,version}`, 503 on DB failure
- CI workflow turns green
- `prisma/schema.prisma` ships with at least `User` model + initial migration

This is a **skeleton**, not a feature implementation. No business logic. No UI design. No content. Only the smallest surface that satisfies the existing infra contract (Dockerfile, CI, deploy.yml, Makefile, /api/health gate).

## Relationship to `mvp-development.md` M1

This issue is the **first PR inside M1**, not all of M1. `mvp-development.md` §M1 lists 8 steps spanning 1–2 weeks; this issue lands the smallest runnable subset and explicitly defers the rest into follow-up issues. The mapping:

| `mvp-development.md` M1 step | This issue | Status after merge |
|---|---|---|
| 1. `npx create-next-app` (Next 15, App Router, Tailwind, TS) | ✅ done in step 1 | Closed |
| 2. Prisma schema with all 7 models + multilingual `Json` | ⚠️ **partial** — only `User`; remaining 6 models = follow-up | Open: "Prisma schema for Topic/Lesson/Question/Attempt/ExamResult/Certificate" |
| 3. NextAuth (email magic link via Resend) | ⚠️ **partial** — packages installed, no provider/route wired | Open: "Wire NextAuth Resend magic-link" (blocked on #3) |
| 4. `next-intl` `[locale]` segment, default `lv`, switcher on 24 EU langs, Accept-Language detection | ⚠️ **partial** — `[locale]` + Tier 1 (`lv/en/ru`) only; no switcher UI; no Tier 2 stubs | Open: "Locale switcher + Tier 2 EU langs (DeepL pipeline)" |
| 5. Translation files (`lv/en/ru` human; Tier 2 DeepL auto + `verified=false`) | ⚠️ **partial** — single placeholder key in `lv/en/ru`; DeepL pipeline = follow-up | Open: "DeepL Tier 2 translation pipeline" |
| 6. Content importer `scripts/import-content.ts` | ❌ deferred | Open: "Content importer (MDX + YAML → DB)" — depends on full Prisma schema |
| 7. Landing page in lv/en/ru with hero/CTA | ❌ deferred | Open: "Landing page M1" |
| 8. First `make release v=0.1.0` → palpalych | ❌ deferred | Blocked on #2 (secrets) and #3 (DNS+Resend) |

Net: this issue closes M1 step 1 and partially covers steps 2/3/4/5. Five follow-up issues will be filed at the end of this PR to complete M1.

## Context

### What already exists (do not change)

- `Dockerfile` — expects `package.json`, `next.config.{mjs,ts,js}` with `output: 'standalone'`, `prisma/schema.prisma`, `scripts/docker-entrypoint.sh`
- `scripts/docker-entrypoint.sh` — runs `prisma migrate deploy`, then `exec "$@"` (CMD `node server.js`)
- `docker-compose.dev.yml` — Postgres on host port 5434, DB `dronelingo`, user/pass `postgres`/`postgres`; Mailhog 1026/8026
- `Makefile` — already wired to `npm run dev|build|type-check|lint`, `prisma generate|db push|migrate dev|migrate deploy`
- `.github/workflows/ci.yml` — calls `npm ci`, `prisma generate`, `prisma migrate deploy` (gated on hashFiles), `npm run type-check`, `npm run lint`, `npm run build`. CI Postgres lives on `localhost:5432`, DB `dronelingo_test`
- `.github/workflows/deploy.yml` — gated on `hashFiles('package.json') != ''`
- `.env.example` — already documents all required env vars
- `docker-compose.yml` (prod) — runs `node server.js` from the standalone output, expects `DATABASE_URL` pointing at the `db` service

### Constraints from CLAUDE.md

- Default locale is `lv`. Tier 1 (human): `lv, en, ru`. Tier 2: 21 EU langs (DeepL/`en` fallback) — **scaffold the structure now, content later**
- Multilingual content fields are `Json` columns (`{lv, en, ru, ...}` with `en` fallback), no per-locale tables
- `/api/health` must `SELECT 1` on Postgres and return 503 on failure
- App listens on `:3000` inside the container; host nginx proxies `:3030 → :3000`
- Prisma migrations are mandatory once code lands (`make migrate`, not `db push`, for committed migrations)

## Stack snapshot

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router, TS, src dir) | `output: 'standalone'` |
| Styling | Tailwind CSS v4 (whatever `create-next-app` ships) | Default config, no theme work |
| ORM | Prisma + `@prisma/client` | provider `postgresql` |
| DB | PostgreSQL 16 (Docker locally, GH service in CI) | |
| Auth | NextAuth v5 (`next-auth@beta`) + `@auth/prisma-adapter` | **install only — no provider wiring yet**; provider config moves to a follow-up issue |
| i18n | `next-intl` with `[locale]` segment | default `lv`; routes for `lv/en/ru`; fallback `en` |
| Env validation | `@t3-oss/env-nextjs` + `zod` | minimal schema; `SKIP_ENV_VALIDATION=true` honoured |
| Linter | ESLint via `next lint` (Next default) | scripts already referenced in CI |
| Health | `src/app/api/health/route.ts` | runs `SELECT 1`, includes `version` from `package.json` |

`next-auth` is **installed but not wired to a route handler** in this issue. Wiring email magic-link via Resend depends on issue #3 (Resend domain verification) and is its own follow-up. That keeps issue #4 truly a skeleton.

## Steps

### 1. Bootstrap Next.js 15

```
npx create-next-app@latest . \
  --typescript --app --tailwind --src-dir \
  --import-alias '@/*' --eslint --use-npm --turbopack --no-git
```

- `--turbopack` is the current Next 15 default for `dev`. Build still uses webpack.
- `--no-git` because we are already in a git repo.
- Confirm `.gitignore` from `create-next-app` does not clobber the existing one — merge if needed.

After bootstrap:
- Edit `next.config.{mjs,ts}` → add `output: 'standalone'`.
- Confirm `package.json` has scripts: `dev`, `build`, `start`, `lint`. Add `type-check: "tsc --noEmit"`.

### 2. Prisma

```
npm install @prisma/client
npm install -D prisma
npx prisma init --datasource-provider postgresql
```

- Replace generated `prisma/schema.prisma` with **minimum** model:
  - `User { id String @id @default(cuid()), email String @unique, name String?, locale String @default("lv"), createdAt DateTime @default(now()), updatedAt DateTime @updatedAt }`
- Topic/Lesson/Question/Attempt/ExamResult/Certificate are **deferred** to a follow-up schema issue (M1 step 2 in `mvp-development.md`). Issue #4 is skeleton-only — adding seven models with multilingual `Json` fields would balloon scope and force premature decisions.
- Generate first migration with the local DB up:
  ```
  make db-up
  npx prisma migrate dev --name init
  ```
- Commit `prisma/migrations/<timestamp>_init/`.

### 3. NextAuth (install only)

```
npm install next-auth@beta @auth/prisma-adapter
```

- Do **not** create `src/auth.ts` or `src/app/api/auth/[...nextauth]/route.ts` yet. Wiring waits for #3.
- Rationale: a half-wired NextAuth without `RESEND_API_KEY` will either crash at boot or require dummy provider stubs that get thrown away. Better to land it in one piece behind verified DNS.

### 4. next-intl

```
npm install next-intl
```

- Create `src/i18n/request.ts` per next-intl Next 15 App Router setup.
- Routing: `[locale]` segment under `src/app/[locale]/`. Locales array: `['lv', 'en', 'ru']`. Default: `lv`.
- Move bootstrap `page.tsx` from `src/app/` to `src/app/[locale]/page.tsx`.
- Translation files: `messages/lv.json`, `messages/en.json`, `messages/ru.json` with one key each (e.g. `home.title`).
- Tier 2 (de/fr/...) — directory exists but **empty in this issue**. Adding empty stubs invites stale fallbacks. Document in `messages/README.md` instead.
- Middleware: `src/middleware.ts` from next-intl with `localePrefix: 'always'`.

### 5. /api/health

`src/app/api/health/route.ts`:
- Runs `prisma.$queryRaw\`SELECT 1\`` with a 2 s timeout.
- Returns `{ status: 'ok'|'degraded', db: 'up'|'down', version: <package.version>, time: <iso> }`.
- 200 on success, 503 on DB failure.
- Mark route `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` so Next does not cache it.
- This route lives **outside** `[locale]` (no localization).

### 6. Env validation

- Install `@t3-oss/env-nextjs zod`.
- Create `src/env.ts` with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `EMAIL_*`, `ADMIN_EMAIL` as currently in `.env.example`. Optional fields stay optional.
- Honour `SKIP_ENV_VALIDATION=true` (the t3-env helper supports this natively).

### 7. Local smoke

```
make dev-setup        # db up + prisma db push + npm run dev
curl -s http://localhost:3000/api/health | jq
curl -I http://localhost:3000/      # 307 → /lv
curl -I http://localhost:3000/lv    # 200
curl -I http://localhost:3000/en    # 200
curl -I http://localhost:3000/ru    # 200
```

### 8. Type-check + lint + build

```
npm run type-check
npm run lint
npm run build      # produces .next/standalone
```

### 9. Optional Docker smoke (skip if time)

```
make build         # docker build -t dronelingo:local
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgres://postgres:postgres@host.docker.internal:5434/dronelingo \
  dronelingo:local
```

This validates the existing Dockerfile actually consumes the new code. Worth doing once before pushing, since CI does not currently build the image (deploy.yml does, but only on tag).

### 10. Commit

Single commit, conventional title:

> `feat(skeleton): initialize Next.js 15 + Prisma + next-intl + /api/health`

Body lists what was scaffolded vs deferred (auth providers, content schema).

## Acceptance criteria

- [ ] `make dev-setup` runs to a working `npm run dev`
- [ ] `/api/health` returns 200 with `{status:'ok', db:'up'}` while Postgres is up
- [ ] `/api/health` returns 503 with `db:'down'` when Postgres is stopped (verify by `make stop`)
- [ ] `/`, `/lv`, `/en`, `/ru` all render placeholder content
- [ ] `npm run type-check` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run build` produces `.next/standalone/server.js`
- [ ] `prisma/schema.prisma` exists with `User` model
- [ ] `prisma/migrations/<ts>_init/migration.sql` is committed
- [ ] CI on the resulting commit is green (after push)

## Out of scope (each becomes a follow-up GitHub issue at PR merge)

These map back to `mvp-development.md` §M1–M4 and will be filed against `Savin-Igor/dronelingo` once the skeleton PR merges:

1. **Prisma schema for Topic/Lesson/Question/Attempt/ExamResult/Certificate** with multilingual `Json` fields — `mvp-development.md` M1 step 2 (rest)
2. **NextAuth Resend magic-link wiring** (route handler + adapter + email template) — M1 step 3 (rest); blocked on #3
3. **Locale switcher UI + Tier 2 EU language stubs** (DeepL pipeline + `verified=false` flag) — M1 steps 4–5 (rest)
4. **Content importer `scripts/import-content.ts`** (MDX + YAML → DB UPSERT) — M1 step 6; depends on follow-up #1 above
5. **Landing page in lv/en/ru** (hero + value prop + CTA) — M1 step 7
6. **Test framework selection + CI wiring** (Vitest unit + Playwright e2e) — not in `mvp-development.md`; pre-M2 hygiene
7. **Plausible Analytics + Sentry** — M4
8. **First `make release v=0.1.0`** — M1 step 8; blocked on #2 + #3

## Risks

- **`create-next-app@latest` may pull a Next 16 preview by the time this runs.** If `next` major ≠ 15, pin to `next@15` explicitly via `--example` or post-install `npm install next@^15` and re-run `npx create-next-app` interactively. Dockerfile and CI are stack-agnostic on Next major as long as `output: 'standalone'` works.
- **Tailwind v4 changed config.** `create-next-app` will scaffold the v4 form. Do not retrofit a v3 `tailwind.config.js`; trust whatever it ships.
- **next-intl Next 15 setup changed in v3.x.** Use the official "Next 15 App Router" recipe from the docs (verify via context7 before writing the code).
- **NextAuth v5 still beta.** Pin `next-auth@beta` exact-ish; do not auto-bump minor in `package-lock.json`.
- **Migration history clash with prod DB on first deploy.** First migration is `init`, prod DB is empty — no clash. But once #2 secrets land and a real deploy happens before any further migrations, the prod DB will receive `init` cleanly.
- **`@t3-oss/env-nextjs` may break the build if a required env is missing in CI.** CI sets `SKIP_ENV_VALIDATION=true`; t3-env honours it. Verify locally before pushing.
- **Mailhog port collision.** Existing compose uses 1026/8026 (different from MezaData/ALTEKO 1025/8025). Do not touch.

## Verification

- Manual smoke: steps 7–8 above
- CI must turn green on the commit before this issue closes
- Do not tag a release (`make release v=0.1.0`) from this issue — that depends on #2 (secrets) and #3 (DNS+Resend)
