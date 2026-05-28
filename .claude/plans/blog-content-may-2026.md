## Goal

Publish 5 timely blog posts on dronelingo.eu that match May 2026 news
(Latvia drone incursions, EU regulatory shifts). Each post must exist
natively in `lv`, `en`, `ru` with cross-language reconciliation, a
generated hero image, validated meta/seo, and a `sourceRef` chain that
ties every regulatory claim back to verifiable sources.

## Context

- Today is 2026-05-28. Latvia is in a fresh political/security cycle
  after the May 7 Rezekne incident (Ukrainian drones crossed from RU
  airspace, hit empty oil-depot tanks) → defence-minister resignation
  (May 10) → government collapse (May 14) → mobile intercept teams
  deployed (May 27).
- New NBS alert hierarchy (Yellow/Orange) went live 23 May 2026.
- 50 km border zone has been closed 20:00–07:00 since Sept 2025.
- EU is preparing the Drone Security Package (Q3 2026) that would drop
  the Remote ID threshold from 250 g → 100 g.
- 2025 Cabinet decision: drone-violation fines for legal entities
  switched from flat 300 € to up to 10 % of annual turnover.

User decisions (locked):
- Scope: top-5 only (`#1 incident-impact`, `#2 yellow-orange-alerts`,
  `#3 50km-border-permit`, `#4 turnover-fines`, `#5 remote-id-2026`).
- Languages: native-first via localization skill (`lv` / `en` / `ru`
  in parallel from a shared claims map, not translation).
- Hero image: generated via `image-gen` skill per post.
- Delivery: commits to `main` per post (no PR, no tag → no deploy).
  User will tag manually when ready.

## Steps

1. Pilot post `#2 Yellow/Orange alerts` end-to-end:
   - Research + sources (LSM article, NBS announcement)
   - Build claims map (numbers, names, dates, actions)
   - Native write `lv.mdx`, `en.mdx`, `ru.mdx`
   - Editor pass per language (anti-AI markers, register check,
     Latvian diacritics)
   - Cross-language reconciliation
   - Generate hero image + localized alt-text triple
   - Write `meta.yml` + `seo.yml`
   - Validate (`make check`, YAML safe-load, source-ref validator)
   - Commit
2. Repeat for `#1`, `#5`, `#4`, `#3` (in this order — most-fresh news first).
3. After all five land, mark umbrella issue done.

For each post:
- `sourceRef` in `meta.yml` follows the established `citation | URL`
  pattern (validator enforces it).
- All regulatory claims must point at `docs/knowledge/` or a published
  CAA/EASA/news URL. No paraphrasing from training data.
- Slug per language must be SEO-natural (LV uses Latvian transliteration,
  not anglicism — see existing posts for tone).

## Risks

- **Source drift**: news stories are still moving (post #1). Lock the
  cut-off date in each post (`lastVerifiedAt`) so future updates are
  obvious. Use only sources visible on 2026-05-28.
- **Translationese leak**: easiest failure mode for multilingual
  content. Mitigate by writing claims map *first*, then producing each
  language independently. Editor pass per language catches what slips.
- **Latvian diacritics**: biggest AI failure for `lv`. Editor pass with
  `writing-lv` pack is mandatory before commit.
- **Anonymous-mode contract**: posts should not assume the user is
  authenticated. CTAs should route to `/practice` / `/learn`, not to
  any auth-only state.
- **Image asset routing**: existing post
  `bee-inspired-drone-navigation-without-gps` had hero at
  `content/blog/.../hero.png` but loader expects `public/blog/...`.
  Mirror what the loader needs — verify before committing.
- **Scope creep**: stop at 5 unless user reopens scope. The other 5
  ideas live in this plan but are not in flight.
