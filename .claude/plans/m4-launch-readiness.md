## Goal

Make every public route launch-ready: real SEO metadata, alternate
language links, robots/sitemap, optional Plausible Analytics, minimal
cookie / localStorage notice, and landing CTAs that lead somewhere.

## Steps

1. **Landing CTAs** — Hero "Start learning" → `/learn`, secondary → `#how-it-works`.
2. **Per-route `generateMetadata`** for `/`, `/learn`, `/practice`,
   `/exam`, `/claim`, `/guide`, `/faq`, `/privacy`, `/terms` with
   title, description, openGraph, alternates.languages.
3. **`metadataBase`** in root layout from
   `NEXT_PUBLIC_SITE_URL` (default `https://dronelingo.eu`).
4. **`robots.ts`** + **`sitemap.ts`** at `src/app/` to enumerate the
   public routes × locales.
5. **Cookie / localStorage notice** — small client banner with
   localStorage flag `dronelingo:consent:v1`. Acceptance is the
   gate that loads Plausible.
6. **Plausible script** — env-gated via
   `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Only injected when both env is set
   AND consent is given.
7. **`og:image` placeholder** — `/public/og.svg` (static SVG) since we
   have no design pipeline. Cited as 1200×630 in metadata.
8. Verify build / lint / type-check / smoke `/robots.txt`,
   `/sitemap.xml`, every page.

## Risks

- `generateMetadata` per locale must not break Next.js static
  generation. Use `await getTranslations({ locale, namespace })` pattern.
- Plausible script must NOT load before consent — use a client
  component that mounts the `<script>` tag once.
- robots.ts has to allow the locale prefixes; sitemap must list
  every route × locale.
- `metadataBase` URL must be valid for both dev and prod — use the
  `NEXT_PUBLIC_SITE_URL` fallback so dev does not break.

## Out of scope

- Real og.png design — SVG placeholder is enough until designer pass.
- Self-hosted Plausible (uses official cloud script).
- Schema.org structured data.
