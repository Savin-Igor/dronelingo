# Repository Guidelines

## Project Structure

- `src/app/`: Next.js App Router routes (incl. `src/app/api/health`).
- `src/components/`, `src/lib/`, `src/types/`, `src/i18n/`: UI, shared logic, types, and locale utilities. Use `@/…` imports (alias to `src/`).
- `prisma/`: Prisma schema and migrations.
- `content/`: YAML/MDX-like learning content imported into Postgres via the importer.
- `docs/`: product/docs and deployment docs (see `docs/DEPLOY.md`).
- Tests: `src/__tests__/` (unit, Vitest), `e2e/` (Playwright).

## Build, Test, and Development Commands

Prefer `make` targets (see `make help`):

- `make dev-setup`: first-time bootstrap (starts Postgres, `prisma db push`, runs dev server).
- `make dev`: daily dev (DB up + schema sync + `npm run dev`).
- `make import-content`: imports `content/` into the local DB (requires `.env.local`).
- `make check`: `npm run type-check` + `npm run lint`.
- `make test`: unit tests (Vitest).
- `make test-e2e`: Playwright e2e (starts/reuses dev server).
- `make build`: builds production Docker image `dronelingo:local`.

## Coding Style & Naming Conventions

- TypeScript/React (Next.js 15). Keep `strict` TypeScript passing.
- Formatting style follows the existing code: 2-space indentation, double quotes, semicolons.
- Linting: ESLint (`eslint.config.mjs`) with `next/core-web-vitals` + TypeScript rules.
- Naming: components in `PascalCase`, helpers in `camelCase`, tests as `*.test.ts` / `*.spec.ts`.

## Testing Guidelines

- Unit: Vitest (`vitest.config.ts`, `jsdom`). Place tests under `src/__tests__/` and import via `@/`.
- E2E: Playwright (`playwright.config.ts`). Add specs under `e2e/` as `*.spec.ts`.
- Before opening a PR, run at least: `make check` and `make test` (add `make test-e2e` for UI/route changes).

## Commit & Pull Request Guidelines

- Commits follow Conventional Commits (examples in history: `feat(auth): …`, `fix(ci): …`, `chore(release): …`).
- PRs should include: a clear description, linked issue(s) when applicable, and screenshots for UI changes.
- Do not commit secrets: use `.env.local` locally and keep templates in `.env.example`.

