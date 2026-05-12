# dronelingo.eu

An online preparation platform for the EASA drone pilot certificate
(category A1/A3) in Europe — Latvia first.

## Overview

Getting a drone licence in Europe is unnecessarily hard. Official portals
use aviation jargon, documentation runs to dozens of pages, and
commercial training schools charge 700–800 EUR or more — even though the
baseline A1/A3 certificate requires only an online theory test, at no
cost.

dronelingo is a guided, multilingual, step-by-step preparation platform
that takes a complete beginner from zero to passing the official exam at
[`e.caa.gov.lv`](https://e.caa.gov.lv/).

**Pricing model — Pass Guarantee.** Free to learn and practise. €19
charged only after a verified pass on the official exam. Don't pass —
don't pay.

## Status

MVP development in progress (M1–M4 mostly delivered).

| Layer | State |
|-------|-------|
| Skeleton (Next.js 15 + Prisma + next-intl + Postgres) | ✅ |
| Schema (User, Topic, Lesson, Question, Attempt, ExamResult, Certificate) | ✅ |
| Content importer (`make import-content`) | ✅ |
| Tier 1 i18n (lv / en / ru) | ✅ |
| Landing + `/learn` (9 topics × 2 lessons, 18 lessons) | ✅ |
| `/practice` trainer (45 questions, anonymous mode) | ✅ |
| `/exam` mock (40 stratified, timer, anonymous history) | ✅ |
| `/claim` Pass-Guarantee with stub Stripe-shaped checkout | ✅ |
| `/guide` 8-step CAA Latvia walkthrough | ✅ |
| `/faq`, `/privacy`, `/terms` (privacy/terms marked draft) | ✅ |
| SEO: per-route metadata, robots, sitemap, JSON-LD, hreflang | ✅ |
| NextAuth Resend magic-link | ⏳ blocked on DNS + Resend (#3) |
| Tier 2 (21 EU langs via DeepL) | ⏳ separate issue (#12) |
| Real Stripe | ⏳ swaps in after ≥10 stub completions |

Auth-gated state (lesson progress, attempts, exam history, claim record)
is held in `localStorage` until NextAuth lands, after which the
front-end migration is a one-shot upload of those keys.

## Development

All work goes through `make` (see `make help`).

| Command | Purpose |
|---------|---------|
| `make dev-setup` | First-time bootstrap: Postgres in Docker, schema sync, dev server |
| `make dev` | Daily: db up + `prisma db push` + `npm run dev` |
| `make stop` | Stop dev containers (data preserved) |
| `make import-content` | Import `content/` (topics, lessons, questions) into local DB |
| `make migrate` | `prisma migrate dev` — interactive |
| `make studio` | Open Prisma Studio |
| `make backup` | `pg_dump` local DB to `./backups/` |
| `make check` | `npm run type-check && npm run lint` |
| `make build` | Build production Docker image locally (`dronelingo:local`) |
| `make release v=0.1.0` | Tag + push → GitHub Actions deploy |

Local Postgres is on host port **5434**; Mailhog SMTP **1026** / UI
**8026**.

## Stack

Next.js 15 (App Router, standalone) · Prisma 6 · PostgreSQL 16 · Tailwind
v4 · next-intl v4 · next-mdx-remote · `@t3-oss/env-nextjs` · zod · tsx +
yaml + zod for the importer.

Multilingual fields are `Json` columns shaped `{lv, en, ru, ...}` with
`en` fallback.

## Routes

| Path | What |
|------|------|
| `/` (`/lv`, `/en`, `/ru`) | Landing |
| `/learn` | 9 topics, anonymous progress bars |
| `/learn/[topic]` | Topic detail + sticky lesson TOC |
| `/learn/[topic]/[lesson]` | MDX lesson, prev/next, ✓ on visited |
| `/practice` | Topic picker by question count |
| `/practice/[topic]` | Trainer (shuffle, instant feedback, accuracy) |
| `/exam` | Rules screen + recent-history + readiness gauge |
| `/exam/session` | 40 stratified questions, 40-min timer |
| `/exam/result` | Pass / fail, per-topic, missed Q + sourceRef |
| `/claim` | PDF / LVA-RP-############ + €19 stub checkout |
| `/guide` | 8-step e.caa.gov.lv walkthrough |
| `/faq`, `/privacy`, `/terms` | Static MDX |
| `/api/health` | `SELECT 1` healthcheck |
| `/robots.txt`, `/sitemap.xml` | SEO infra |

## Knowledge base

`docs/knowledge/` (49 files, ~33 MB) is the **source of truth for
content**. Lessons and questions cite from it via `sourceRef`. See
`docs/knowledge/README.md`.

## Deploy

Tag-driven only. `git tag v0.1.0 && git push origin v0.1.0` triggers the
GitHub Actions build → GHCR → SSH deploy onto the shared Hetzner VPS
`palpalych`. Health gate on `/api/health` within 90 s.

Full pipeline: `docs/DEPLOY.md`.

## License

[AGPL-3.0-or-later](LICENSE) — modifications to the deployed code must be shared back under the same terms.
