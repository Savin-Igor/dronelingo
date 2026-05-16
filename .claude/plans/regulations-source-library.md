## Goal

Phase 1 of issue #75: replace the static `/regulations` MDX page with a
first-party source library — a generated catalog and per-source detail pages
with stable internal anchors.

## Context

- Issue #75 proposes 4 phases; this plan covers Phase 1 only.
- `yaml` package already available (`yaml ^2.8.4`); pattern mirrors `src/lib/blog.ts`.
- `content/static/regulations/{lv,en,ru}.mdx` exists but is a flat link list.
  It will be replaced; the static files will be deleted.
- `src/lib/source-citations.ts` + `SourceCitationList` stay untouched (Phase 2).
- Sources to include: reg-eu-2019-947, reg-eu-2019-945, easa-easy-access-rules,
  caa-lv-qualifications, caa-lv-registration, caa-lv-geozones, caa-lv-insurance.

## Steps

1. `content/sources/{source-id}/meta.yml` for 7 sources.
   Fields: id, kind, officialTitle (lv/en/ru), shortTitle (lv/en/ru),
   canonicalUrl, lastVerifiedAt.
   Kinds: eu-regulation | easa-guidance | caa-operational.

2. `content/sources/{source-id}/{lv,en,ru}.mdx` — body content per locale.
   Each file: short intro paragraph, then H2 sections with id anchors
   (`## Title {#anchor-id}`) for 3-5 key provisions.

3. `src/lib/sources.ts` — reader following blog.ts pattern.
   Exports: `listAllSources()`, `getSource(id)`, `getSourceBody(id, locale)`.
   Uses React `cache()`, `yaml` parser, locale fallback to `en`.

4. `src/app/[locale]/regulations/page.tsx` — replace static MDX with catalog.
   Groups sources by kind. Each card shows: localised title, short description,
   last verified date, "Official source →" link.

5. `src/app/[locale]/regulations/[source]/page.tsx` — detail page.
   Header: full title, last verified, prominent official-source CTA button.
   Body: MDXRemote on `getSourceBody(source, locale)`.
   Uses `generateStaticParams` listing all source ids.

6. `src/app/sitemap.ts` — add `/regulations/[source-id]` entries.

7. Delete `content/static/regulations/{lv,en,ru}.mdx`.

## Risks

- Static MDX files are currently live at /regulations — delete only after
  the new generated page is confirmed to build.
- The `content/sources/` directory must be included in the Docker standalone
  output (same Dockerfile `COPY content/` already handles this).
- `generateStaticParams` for [source] must enumerate source ids at build time.
