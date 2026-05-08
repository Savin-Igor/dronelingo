# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

**Pre-development.** No application code exists yet — only infrastructure (Dockerfile, compose, Makefile, CI/Deploy workflows) and the knowledge base. CI/deploy jobs auto-skip via `if: hashFiles('package.json') != ''` until the first Node.js code lands.

The product is `dronelingo.eu` — an EASA A1/A3 drone certification prep platform (initial market: Latvia).

## Common commands

All work goes through `make` (see `make help`).

| Command | Purpose |
|---------|---------|
| `make dev-setup` | First-time: starts Postgres in Docker, syncs schema, runs `npm run dev` |
| `make dev` | Daily: db up + `prisma db push` + `npm run dev` |
| `make stop` | Stop dev containers (data preserved) |
| `make push` | `prisma generate && prisma db push` (dev schema sync, no migrations) |
| `make migrate` | `prisma migrate dev` — interactive, creates migration files |
| `make studio` | Open Prisma Studio |
| `make backup` | `pg_dump` local DB to `./backups/` |
| `make check` | `npm run type-check && npm run lint` |
| `make build` | Build production Docker image locally (`dronelingo:local`) |
| `make release v=0.1.0` | Tag + push → triggers GitHub Actions deploy |

Local Postgres runs on host port **5434** (5432/5433 reserved for other projects on the same dev box). Mailhog on **1026** (SMTP) and **8026** (UI).

## Deploy

Tag-driven only. `git tag v0.1.0 && git push origin v0.1.0` → GitHub Actions builds image to GHCR, SSHes to Hetzner VPS `palpalych`, writes `.env` from GitHub Secrets, takes a pre-deploy `pg_dump` (rotated, 10 latest), pulls + restarts, and gates on `/api/health` returning 200 within 90 s. Pushing to `main` only runs CI.

Full details in `docs/DEPLOY.md`.

## Architecture

### Shared-VPS multi-tenancy

This project lives on the same Hetzner VPS as **MezaData** and **ALTEKO**. The host nginx terminates TLS and proxies each project to a dedicated loopback port:

| Port | Project |
|------|---------|
| 3010 | MezaData |
| 3020 | ALTEKO |
| **3030** | **dronelingo** |
| 3040+ | future |

Persistent state lives on a Hetzner Volume mounted at `/mnt/data/<project>/` (Postgres data, uploads, backups) so it survives server rebuilds. App code lives in `/opt/<project>/`. Always preserve this isolation when editing compose files or deploy scripts.

### Container topology

`docker-compose.yml` (production) runs two services:

- `app` — Next.js standalone (`node server.js`), entrypoint runs `prisma migrate deploy` first.
- `db` — `postgres:16-alpine`, no exposed port, bind-mounted to `/mnt/data/dronelingo/postgres`.

Health is centralized in `/api/health` — it must `SELECT 1` on Postgres and return 503 on failure (used by both Docker healthcheck and deploy gate). When the app code is added, this route is mandatory.

### Planned stack (per `docs/mvp-plan.md`)

Next.js 15 (App Router) + Prisma + PostgreSQL + Tailwind + NextAuth + **next-intl** + Resend (Email). Stripe is **stubbed** in MVP — payment flow is `processPayment(userId, €19)` with a `StubProvider` implementation, ready to swap for real Stripe after ≥10 successful stub-checkouts.

## Localization (load-bearing for schema design)

- **Default locale: `lv`** (Latvian) — primary market.
- **Tier 1** (human-translated): `lv`, `en`, `ru` — UI + lesson content + question bank.
- **Tier 2** (DeepL auto-translation, fallback to `en`): the remaining 21 EU languages (bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu, it, lt, mt, nl, pl, pt, ro, sk, sl, sv).

Multilingual content fields are `Json` columns (e.g. `Lesson.bodyMdx: Json` = `{lv, en, ru, ...}`) with **`en` as the fallback** when a key is missing. Do not add separate per-locale tables.

## Knowledge base

`docs/knowledge/` (49 files, ~33 MB) is the **source of truth for content**. Always cite from here rather than from training data when working on lessons, questions, or regulatory wording. See `docs/knowledge/README.md` for the index. Key subtrees:

- `eu-regulations/` — Reg (EU) 2019/947 + 2019/945 + amendments
- `easa/` — Easy Access Rules consolidated (`EASA-Easy-Access-Rules-UAS-2024-07.pdf` is the primary single reference)
- `latvia-caa/web-snapshots/` — markdown snapshots of `droni.caa.gov.lv` pages, captured 2026-05-08; use these to answer operational questions ("where do exams happen?", "what's the A2 fee?") without re-fetching
- `test-samples/` — sample question banks (the official CAA Latvia bank is **not** public)
- `training-guides/syllabus/` — detailed A1/A3, A2, STS study syllabi

When generating exam questions, every `Question` must carry a `sourceRef` pointing back into this knowledge base (e.g. `"Reg 2019/947 Art. UAS.OPEN.060"`).

## Plans and session context

Per the global instructions in `~/.claude/CLAUDE.md`:

- Non-trivial implementation plans live in `.claude/plans/<task-name>.md` with sections `## Goal / ## Context / ## Steps / ## Risks`. Current canonical plan: `.claude/plans/mvp-development.md` (mirrors the longer `docs/mvp-plan.md`).
- The umbrella GitHub issue tracking the MVP is **#5** at `Savin-Igor/dronelingo`. Sub-tasks #1–#4 cover server bootstrap, secrets, DNS, Next.js skeleton.

## Notes for future work

- The `Dockerfile` already assumes `next.config.{mjs,ts,js}` with `output: 'standalone'` — preserve this when initializing Next.js.
- The deploy workflow expects `prisma/schema.prisma` and runs `prisma migrate deploy` on every container start. New schema work must produce committed migration files (use `make migrate`, not `db push`, once code lands).
- `.env.example` documents required env vars — keep it in sync with `deploy.yml`'s `.env` heredoc.
