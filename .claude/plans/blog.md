# Blog — Cornerstone SEO Launch

## Goal

Build a small, high-quality blog focused on **organic search traffic** for drone-certification intent in Latvia / EU. Launch with a complete cornerstone set of 8–10 articles (trilingual, lv/en/ru) authored as MDX in `content/blog/`. Use the blog as a top-of-funnel surface that feeds users into `/learn`, `/practice`, and ultimately the €19 access.

## Decisions (locked)

- **Purpose:** SEO / organic traffic. Not news, not updates. Every article is written to rank for a specific keyword cluster.
- **Languages:** all three (lv / en / ru), simultaneous launch — same architecture as lessons.
- **Volume:** 8–10 cornerstone articles for launch, then pause (no editorial calendar).
- **Stack:** MDX in `content/blog/<slug>/{meta.yml, lv.mdx, en.mdx, ru.mdx}` — mirrors the lessons content tree.
- **Storage:** **filesystem-read at build time**, not DB-backed. Blog has no per-user state, no attempts, no aggregation queries. Reading 8–10 directories at build is trivial and avoids a Prisma model + migration. Reuses the pattern already in `src/lib/static-page.ts` (faq, privacy, terms).

## Content strategy

10 cornerstone articles. Each is a long-form (1500–2500 words) authoritative guide on a high-intent keyword cluster, with internal links into `/learn`, `/practice`, and `/exam`.

| # | Slug (en) | Cluster / intent |
|---|-----------|------------------|
| 1 | `a1-a3-drone-licence-latvia` | "How to get the A1/A3 licence in Latvia" — main conversion driver |
| 2 | `eu-open-category-a1-a2-a3-explained` | "What's the difference between A1, A2, A3?" — category awareness |
| 3 | `drone-registration-latvia-step-by-step` | "How to register a drone in Latvia" — operator registration on e.caa.gov.lv |
| 4 | `no-fly-zones-latvia` | "Where can I fly a drone in Latvia / Rīga?" — UTM, restricted zones |
| 5 | `drone-insurance-eu-required-or-recommended` | "Do I need drone insurance?" — required (commercial) vs recommended (hobby) |
| 6 | `eu-regulation-2019-947-simplified` | "EU drone regulations 2019/947 explained" — the framework, plain language |
| 7 | `choosing-first-drone-weight-classes` | "Which drone for a beginner?" — weight classes (C0/C1/C2…) and what they mean legally |
| 8 | `pre-flight-checklist-drone` | "Drone pre-flight checklist" — weather, location, drone, paperwork |
| 9 | `drone-exam-latvia-what-to-expect` | "What is the A1/A3 exam like?" — 40 Q / 40 min / 75 % + sample questions |
| 10 | `caa-latvia-contact-fees-process` | "CAA Latvia: contacts, fees, process" — practical reference |

Each article must:
- Cite primary sources from `docs/knowledge/` (regulations / EASA / CAA Latvia snapshots)
- Carry **at least 3 internal links** to `/learn`, `/practice`, or `/exam`
- End with a soft CTA into the product
- Have a `heroImage` (generated via nanobanana or sourced from public domain)
- Be **written natively per locale** — not auto-translated. Russian and Latvian are tier-1 markets; English serves the wider EU audience.

## Technical architecture

### Content tree

```
content/blog/
  <slug>/
    meta.yml          # title, excerpt, publishedAt, tags, heroImage, alt
    lv.mdx
    en.mdx
    ru.mdx
```

`meta.yml` schema:
```yaml
slug:
  lv: drona-licence-latvija-2026
  en: a1-a3-drone-licence-latvia
  ru: a1-a3-litsenziya-na-dron-latviya
publishedAt: 2026-05-20
updatedAt: 2026-05-20
tags: [licence, latvia, getting-started]
title:
  lv: "..."
  en: "..."
  ru: "..."
excerpt:
  lv: "..."
  en: "..."
  ru: "..."
heroImage: hero.png   # under public/blog/<slug>/
heroImageAlt:
  lv: "..."
  en: "..."
  ru: "..."
sourceRef: docs/knowledge/...
```

Note: **slug is per-locale**. SEO requires each language to use its native keyword as the URL segment. `/lv/blog/drona-licence-latvija-2026` vs `/en/blog/a1-a3-drone-licence-latvia` vs `/ru/blog/a1-a3-litsenziya-na-dron-latviya`.

### Reader module

New `src/lib/blog.ts`:

```ts
export type BlogPostMeta = {
  dirSlug: string;                     // canonical directory name
  slug: Record<string, string>;        // per-locale URL slug
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  title: Record<string, string>;
  excerpt: Record<string, string>;
  heroImage: string | null;
  heroImageAlt: Record<string, string>;
  sourceRef: string | null;
};

export function listAllPosts(): BlogPostMeta[];
export function getPostByLocalisedSlug(
  locale: string,
  slug: string
): { meta: BlogPostMeta; bodyMdx: string } | null;
```

`listAllPosts()` scans `content/blog/`, reads each `meta.yml`, sorts by `publishedAt` desc. Build-time only (no runtime fs reads — wrap in `cache()` if Next.js needs it).

### Routes

| Path | Purpose |
|------|---------|
| `/blog` | Index — list of posts with hero, title, excerpt, date, tag chips |
| `/blog/[slug]` | Single post — MDX body, hero, breadcrumbs, related posts (manual via tags), CTA to `/pricing` or `/exam` |
| `/blog/tag/[tag]` | Optional for launch — defer to phase 2 if simpler |

All under `[locale]/` so `routing.locales` continues to work.

### SEO infrastructure

- **JSON-LD `Article`** schema on each post (author, publishedAt, image, etc.)
- **hreflang** tags linking the three locale variants of the same post (key for ranking translations)
- **OG image per post**: generated dynamically via Next's `ImageResponse` (same pattern as `src/app/[locale]/opengraph-image.tsx`), one route per post slug
- **Sitemap**: extend `src/app/sitemap.ts` to include every `/blog/<slug>` in every locale, with hreflang alternates
- **Canonical URLs**: each locale variant points to itself as canonical, hreflang annotates the alternates
- **RSS feed**: optional — `/blog/rss.xml` per locale. Defer unless we see actual reader demand
- **Robots**: blog is public, already covered by current `robots.ts`

### UI components

`src/components/blog/`:
- `BlogIndexCard.tsx` — single card in the listing
- `BlogPostHeader.tsx` — title, date, tags, hero image
- `BlogPostFooter.tsx` — sourceRef, related posts, CTA
- Reuse the existing MDX renderer from lessons (`next-mdx-remote/rsc`)

### Localization (UI strings)

Add `blog.*` namespace to `messages/{lv,en,ru}.json`: index heading, "Read more", "Posted", "Updated", "Related", "Back to blog", CTA copy.

### Integration with the rest of the site

- Add **"Blog" link to the top nav** (next to /learn, /exam, /pricing)
- Add a **"Latest from the blog"** strip on the landing page below `HowItWorks` — 3 most recent posts
- Footer gets a `/blog` link

## Implementation phases

Split into three PRs to keep them reviewable.

### PR1 — Infrastructure + 1 sample post (~600 lines)
- `content/blog/<slug>/` directory convention + sample `a1-a3-drone-licence-latvia` (trilingual, with real content)
- `src/lib/blog.ts` reader
- `/blog` index route + `/blog/[slug]` post route
- `BlogIndexCard`, `BlogPostHeader`, `BlogPostFooter`
- Sitemap extension (per-locale slugs + hreflang)
- JSON-LD Article schema
- OG-image dynamic route
- `messages/*.json` for `blog.*` namespace
- Nav link + footer link

**Acceptance:** `/lv/blog`, `/en/blog`, `/ru/blog` render the listing with the one sample post. Clicking through lands on the post with full MDX render, JSON-LD validates in Google Rich Results, sitemap includes hreflang alternates.

### PR2 — Cornerstone batch (~9 posts × 3 locales = 27 MDX files)
- Articles #2–#10 from the table above
- Hero images generated via nanobanana, consistent style (~5 KB–500 KB each)
- Internal cross-links between posts where natural
- `/blog/tag/[tag]` page if writing tags is cheap; otherwise drop

**Acceptance:** all 10 posts published, hreflang validated, all images render, internal links resolved (build fails on broken links — add a tiny CI check).

### PR3 — Landing integration + polish (~150 lines)
- "Latest from the blog" strip on landing
- RSS feed (optional, only if straightforward)
- Plausible event for blog read-through (already gated by consent)
- Re-crawl request to Google Search Console

**Acceptance:** Landing shows 3 latest posts, RSS validates if shipped, GSC begins indexing.

## File map

| Action | File |
|--------|------|
| New    | `content/blog/<slug>/meta.yml` × 10 |
| New    | `content/blog/<slug>/{lv,en,ru}.mdx` × 10 × 3 = 30 |
| New    | `public/blog/<slug>/hero.png` × 10 |
| New    | `src/lib/blog.ts` |
| New    | `src/app/[locale]/blog/page.tsx` (index) |
| New    | `src/app/[locale]/blog/[slug]/page.tsx` (single post) |
| New    | `src/app/[locale]/blog/[slug]/opengraph-image.tsx` (dynamic OG) |
| New    | `src/components/blog/BlogIndexCard.tsx` |
| New    | `src/components/blog/BlogPostHeader.tsx` |
| New    | `src/components/blog/BlogPostFooter.tsx` |
| Modify | `messages/{lv,en,ru}.json` (blog.* namespace + nav.blog) |
| Modify | `src/app/sitemap.ts` (per-locale slugs + hreflang) |
| Modify | `src/components/layout/Header.tsx` (nav link) |
| Modify | `src/components/layout/Footer.tsx` (footer link) |
| Modify | `src/app/[locale]/page.tsx` (landing strip — PR3) |

## Risks

1. **Slug per locale fights against next-intl's defaults.** next-intl typically expects the path segment after the locale to be the same across locales (it's a pure prefix-based localization). To support `/lv/blog/drona-licence-latvija` vs `/en/blog/a1-a3-drone-licence-latvia` we will need either (a) a dynamic `[slug]` catch-all that maps `(locale, slug) → post` by scanning all meta.yml files, or (b) next-intl's `pathnames` mapping. Option (a) is simpler given we already filesystem-scan. Verify SEO impact is worth the implementation cost during PR1.

2. **Trilingual content authoring is slow.** 10 posts × 3 locales × ~2000 words each ≈ 60,000 words of native-quality writing. PR2 is the bottleneck — it is genuinely a content project, not a code project. Either: write English first and translate Russian/Latvian later (delays full launch), or accept that PR2 takes weeks.

3. **AI-translated content is often penalised by Google.** Tier-1 promise of natively-written translations matters. Don't shortcut PR2 with machine translation — it will hurt rankings rather than help.

4. **Hero images at 10 × ~500 KB = ~5 MB in `public/`.** Same budget concern as the meteorology images. Acceptable now, but if blog grows past ~30 posts switch to image CDN or `next/image` remote loader.

5. **Internal-link rot.** If a lesson slug changes, blog links break silently. Add a build-time check that every `/learn/...` and `/practice/...` link in MDX resolves to an existing topic.

6. **Updating posts**: a published article that quotes a regulation needs to be re-checked when that regulation changes. Add a `lastVerifiedAt` field separate from `publishedAt`/`updatedAt`; surface stale dates in the UI ("Last verified: 2026-03").

## Verification

1. `make dev` — `/lv/blog`, `/en/blog`, `/ru/blog` render
2. Single post under each locale renders MDX correctly
3. View source: JSON-LD Article present, hreflang alternates pointing at the other two locales' slugs
4. `curl /sitemap.xml` — every post present in every locale with hreflang alternates
5. Lighthouse SEO ≥ 95 on a post page
6. Google Rich Results Test validates the Article schema
7. Plausible records a `blog_view` event (when consent given)
