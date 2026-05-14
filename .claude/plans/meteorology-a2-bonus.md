# Meteorology A2 Bonus Exam

## Goal

Add a bonus 30-question / 35-minute meteorology exam (A2 level), always
accessible but positioned as "after the A1/A3 mock." Reuse existing 40
text questions + add ~25 image-based ones generated via nanobanana.

## Decisions (locked)

- **Access**: always available, soft-recommended after passing A1/A3.
- **Format**: 30 Q / 35 min / 75% pass threshold.
- **Content**: existing 40 + ~25 new image-based.
- **Images**: nanobanana (Gemini), stored as PNG in `public/questions/meteorology/`.

## Steps

### 1. Schema — add image support to Question

`prisma/schema.prisma`:
```prisma
model Question {
  ...
  imageUrl   String?   // e.g. "/questions/meteorology/met-041-clouds.png"
  imageAlt   Json?     // {lv, en, ru} alt text for accessibility
}
```

Migration: `make migrate -- --name add_question_image`.

Update YAML loader (`scripts/import-content.ts` or similar) to read
optional `image:` and `imageAlt:` fields.

### 2. Question YAML — extend schema

Optional fields:
```yaml
- id: met-041
  image: clouds-cumulonimbus.png
  imageAlt:
    lv: Lielmākoņa Cumulonimbus foto ar naga formu.
    en: Cumulonimbus cloud with anvil top.
    ru: Кучево-дождевое облако с наковальней.
  stem: {...}
```

### 3. Generate ~25 image-based questions

New file: `content/questions/meteorology-images.yml` (or append).

Topic coverage:
- Cloud types (cumulus, cumulonimbus, stratus, cirrus) — 6 Q
- Weather fronts (cold, warm, occluded) — 4 Q
- METAR/TAF charts — 4 Q
- Wind/pressure diagrams (isobars, geostrophic wind) — 4 Q
- Visibility scenarios (fog, haze, precipitation) — 3 Q
- Wind effects near obstacles (rotor, turbulence) — 4 Q

Generate each image via `mcp__nanobanana__generate_image` with consistent
style: technical schematic, clean lines, labeled, light-on-dark.

### 4. Exam constants

`src/lib/exam.ts`:
```ts
export const METEO_A2_TOTAL_QUESTIONS = 30;
export const METEO_A2_DURATION_MIN = 35;
export const METEO_A2_PASS_THRESHOLD = 75;
```

Add `pickMeteorologyA2Questions()` — picks 30 from meteorology bank,
biased to include ≥10 image-based Q.

### 5. Routes

| Path | Purpose |
|------|---------|
| `/exam/meteorology-a2` | Rules page: format, image preview, "Start" button |
| `/exam/meteorology-a2/session` | Timed session (reuse `ExamSession` component) |
| `/exam/meteorology-a2/result` | Result with per-subtopic breakdown |

Reuse `ExamSession` from `/exam/session/page.tsx` — parameterize by
question list + duration + pass threshold (extract if hardcoded).

### 6. Question rendering — show image

Update `Question` rendering component to render `<img>` above stem when
`question.imageUrl` is present. Add to localStorage attempt schema (no
change — `questionId` already stable).

### 7. Entry points (UI)

- **`/exam` page**: add a "Bonus: Meteorology A2" card below main exam
  card, with "Recommended after passing A1/A3" tag.
- **`/exam/result` page**: when pass ≥75%, add CTA banner:
  "Ready for more? Try the A2 Meteorology bonus exam →"
- **`/learn/meteorology`**: link from topic page to bonus exam.

### 8. Localization

All new strings (UI + image alt) in `lv`, `en`, `ru`. Add to
`messages/{locale}.json` under `exam.meteorologyA2.*` namespace.

### 9. SEO / sitemap

Add `/exam/meteorology-a2` to `src/app/sitemap.ts` PUBLIC_PATHS.
Session and result pages stay out of sitemap (utility pages).

## File Map

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` |
| Modify | `src/lib/exam.ts` |
| Modify | `content/questions/meteorology.yml` (or new file) |
| Modify | `src/app/[locale]/exam/page.tsx` |
| Modify | `src/app/[locale]/exam/result/page.tsx` |
| Modify | `src/components/exam/ExamSession.tsx` (or wherever lives) |
| Modify | `src/app/sitemap.ts` |
| Modify | `messages/{lv,en,ru}.json` |
| New    | `src/app/[locale]/exam/meteorology-a2/page.tsx` |
| New    | `src/app/[locale]/exam/meteorology-a2/session/page.tsx` |
| New    | `src/app/[locale]/exam/meteorology-a2/result/page.tsx` |
| New    | `public/questions/meteorology/*.png` (~25 images) |
| New    | `scripts/generate-meteorology-images.ts` (helper, optional) |
| Auto   | `prisma/migrations/<timestamp>_add_question_image/` |

## Risks

1. **Image generation cost/quality**: nanobanana may produce
   inconsistent style across 25 images. Mitigation: lock a style
   prompt prefix and reuse it.

2. **Question YAML loader changes**: import script lives in
   `scripts/` — needs verification it picks up new fields.

3. **ExamSession reusability**: if it's tightly coupled to A1/A3
   constants, extraction may be wider than expected. Acceptable
   risk — extract cleanly, no shortcuts.

4. **localStorage key collision**: meteorology-a2 attempts go to the
   same `dronelingo:attempts:v1` array — fine, `questionId` is unique.
   Exam history (`dronelingo:exam-history:v1`) needs a `type` field
   to distinguish A1/A3 mock from A2 bonus.

5. **Image storage**: 25 × ~150 KB = ~4 MB in `public/`. Fine for
   Next.js, served as static. Compressed PNG.

## Verification

1. `make migrate` — applies cleanly
2. `make import-content` — loads new questions with images
3. `/exam/meteorology-a2` — rules page renders
4. Start session → images load → timer counts down → submit works
5. Result page shows pass/fail + per-subtopic breakdown
6. CTAs from `/exam` and `/exam/result` lead to bonus exam
7. `make check` — types + lint pass
8. All 3 locales render correctly
