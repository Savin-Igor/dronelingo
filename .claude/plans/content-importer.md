# Content importer — MDX lessons + YAML questions → Postgres

Reference: GitHub issue #13. Closes `mvp-development.md` §M1 step 6.

## Goal

Stand up the content pipeline so M2 routes can read real Topic / Lesson / Question rows from Postgres. Idempotent CLI script callable from `make`.

## Directory layout

```
content/
  topics/
    <slug>.yml                   # Topic metadata
  lessons/
    <topic-slug>/
      <lesson-slug>/
        meta.yml                 # title (Json), ord, sourceRef?
        lv.mdx
        en.mdx
        ru.mdx
  questions/
    <topic-slug>.yml             # array of questions for this topic
```

**Slugs** are kebab-case ASCII. Topic slugs match the 9 EASA syllabus headings (e.g. `air-safety`, `airspace`, `regulation`, `human-performance`, `operations`, `uas-knowledge`, `privacy`, `insurance`, `security`).

## YAML shapes

`content/topics/<slug>.yml`:

```yaml
slug: air-safety
ord: 1
title:
  lv: Aviācijas drošums
  en: Air safety
  ru: Авиационная безопасность
summary:
  lv: ...
  en: ...
  ru: ...
```

`content/lessons/<topic-slug>/<lesson-slug>/meta.yml`:

```yaml
slug: vlos
ord: 1
title:
  lv: Tieša redzamība (VLOS)
  en: Visual line of sight (VLOS)
  ru: Прямая видимость (VLOS)
sourceRef: "Reg 2019/947 Art. UAS.OPEN.060"
```

Lesson body lives in three sibling MDX files (`lv.mdx`, `en.mdx`, `ru.mdx`). The importer reads each as a string and stores them as `bodyMdx: { lv, en, ru }` in the `Lesson.bodyMdx` Json column.

`content/questions/<topic-slug>.yml`:

```yaml
- id: as-001
  stem:
    lv: Cik metru attālumā ...
    en: How far ...
    ru: На каком расстоянии ...
  options:
    - id: a
      text: { lv: "...", en: "...", ru: "..." }
    - id: b
      text: { lv: "...", en: "...", ru: "..." }
    - id: c
      text: { lv: "...", en: "...", ru: "..." }
  correctOptionId: a
  explanation:
    lv: ...
    en: ...
    ru: ...
  sourceRef: "Reg 2019/947 Art. UAS.OPEN.040(1)"
  difficulty: 1
```

Question `id` is a stable, human-readable identifier scoped to the topic (`<topic-prefix>-NNN`). It maps to a new `externalId` column on `Question` (see schema change below).

## Schema change

Add `externalId String @unique` to `Question` so the importer has a stable upsert key. Migration: `add_question_external_id`.

`Question.id` (cuid) stays as the internal PK. `externalId` is the import key.

## Validation

Use `zod` (already a dep) at the script boundary:

- All multilingual fields must include `en` (the fallback) — abort with a list of missing keys
- Tier 1 keys (`lv`, `en`, `ru`) recommended but only `en` is hard-required
- `Question.sourceRef` must be non-empty (per CLAUDE.md)
- `Question.correctOptionId` must match one of the `options[].id`
- `Lesson` MDX files must exist for every locale present in `meta.yml.title`

Failures print a clear "what file, what key" message and exit non-zero.

## Importer flow

1. Walk `content/topics/*.yml`, parse YAML, validate, UPSERT `Topic` by `slug`
2. For each topic dir under `content/lessons/<topic-slug>/`:
   1. Read `meta.yml` for each lesson
   2. Read `lv.mdx` / `en.mdx` / `ru.mdx` as raw strings
   3. UPSERT `Lesson` by `(topicId, slug)` — Prisma compound unique
3. Walk `content/questions/*.yml`, parse, validate, UPSERT `Question` by `externalId`
4. Print summary table:

   ```
   topics:    9 total · 0 created · 0 updated · 9 unchanged
   lessons:   1 total · 1 created · 0 updated · 0 unchanged
   questions: 2 total · 2 created · 0 updated · 0 unchanged
   ```

Idempotency: a "no-op" run is detected by deep-equal on the deserialized data vs. what's in DB. Simpler approach for first version: rely on Prisma's `upsert` with `update` set to the same fields — if the row exists with identical content, it's a no-op write but still visible as `updated` in the summary. Mark this as a known limitation for v1; optimize later if it bites.

## Tooling

- `yaml` package (smaller, ESM-friendly than `js-yaml`)
- `tsx` to run the script directly — no compile step
- npm script: `"content:import": "tsx scripts/import-content.ts"`
- `make import-content` Makefile target

## Steps

1. `npm install -D yaml tsx`
2. Edit `prisma/schema.prisma` — add `externalId String @unique` to `Question`
3. `prisma migrate dev --name add_question_external_id`
4. Write `scripts/import-content.ts`
5. Add `make import-content` target
6. Add seed: `content/topics/air-safety.yml` + `content/lessons/air-safety/vlos/{meta.yml, lv.mdx, en.mdx, ru.mdx}` + `content/questions/air-safety.yml` (2 questions)
7. Run on local DB; run again → unchanged
8. Test validation by deleting `en` from one file → script aborts with clear error → restore
9. `npm run type-check / lint / build` green
10. Commit + push

## Acceptance

- [ ] `make import-content` writes to DB without errors
- [ ] Re-run prints all "unchanged" (or all "0 created, 0 updated" once we get there)
- [ ] At least 1 Topic, 1 Lesson, 2 Questions present
- [ ] Removing `en` from any multilingual field → abort with named-key error
- [ ] type-check / lint / build green

## Out of scope

- Full 9-topic seed (separate issue)
- Hot-reload / watch mode
- Admin UI
- MDX rendering (that's M2 lesson route)
- Content versioning / diff display

## Risks

- **Locale set drift:** content authors will inevitably forget keys. The validator catches missing `en`; for missing `lv`/`ru` we warn but don't fail (so partial translations can ship). Mark this as policy in the importer's README.
- **`externalId` collisions across topics:** scoped naming convention (`as-001` for Air Safety) is by-convention, not enforced. If we ever hit a collision, schema change would be `@@unique([topicId, externalId])` instead of global `@unique`. Note in code.
- **Big lesson MDX in JSON column:** Postgres JSONB compresses well; should not be a real issue at MVP scale (~9 lessons × 3 locales × ~10 KB = trivial).
