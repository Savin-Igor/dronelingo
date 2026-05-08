---
name: seed-question
description: Scaffold a new EASA A1/A3 exam question YAML at content/questions/<topic>/<slug>.yaml with multilingual lv/en/ru fields and a sourceRef + sourceFile pair that resolves into docs/knowledge/. Use when the user asks to add an exam question, seed a question, or extend the question bank.
disable-model-invocation: true
---

# seed-question

Create a new exam-question YAML file that the planned `scripts/import-content.ts` will UPSERT into the `Question` table.

Every question MUST trace to a real source file in `docs/knowledge/`. Questions without a verifiable `sourceFile` are rejected.

## Inputs

The user invokes `/seed-question` with optional free-text describing the question. Gather these fields, asking only for what is missing:

1. **topic** — one of the 9 slugs in `TOPICS.md` (in this skill folder). If unclear, show the list.
2. **slug** — short kebab-case identifier, unique within the topic (e.g. `max-altitude-open-category`).
3. **sourceRef** — human-readable citation string (e.g. `Reg 2019/947 Art. UAS.OPEN.040`, `MK Nr. 248 §53`, `EASA Easy Access Rules p. 142`).
4. **sourceFile** — path **relative to `docs/knowledge/`** of the file backing this question (e.g. `eu-regulations/EU-2019-947-implementing-regulation-EN.pdf`).
5. **stem** + **4 options** + **correct option** + **rationale** — in `en` minimum; `lv` and `ru` if the user has them.

Do not invent `sourceRef` / `sourceFile` values. If the user cannot provide a citation, stop and ask — questions without provenance are not allowed.

## Procedure

1. Confirm working directory is the repo root (`Makefile` and `docs/knowledge/` present). If not, abort.
2. Read `template.yaml` from this skill folder.
3. Validate the proposed `sourceFile` by running `bash .claude/skills/seed-question/validate.sh <sourceFile>` from the repo root. If it exits non-zero, surface the message and stop — do not write the file.
4. Confirm `content/questions/<topic>/` exists; create it if missing (`mkdir -p`).
5. Confirm `content/questions/<topic>/<slug>.yaml` does **not** already exist. If it does, ask whether to overwrite.
6. Write the new file by copying the template and filling in:
   - `topic`, `slug`, `sourceRef`, `sourceFile`
   - `stems` — fill `en` (and `lv`, `ru` if provided); leave other locales unset
   - `options` — 4 entries (`A`–`D`), exactly one `isCorrect: true`, `texts` filled per the same locale rule
   - `rationales` — same locale rule as stems
   - `difficulty` — `easy` | `medium` | `hard` (default `medium`)
7. Re-run the validator on the written file as a sanity check. Report the file path and which locales are filled vs. left for Tier 2 auto-translation.

## Locale handling

- `lv` is the default locale. If the user gives only `en`, leave `lv` and `ru` unset — DeepL Tier 2 will fill them later with `verified=false`.
- Never machine-translate inside this skill. Translation is the importer's job.
- The `en` field is mandatory because it is the documented fallback (`docs/mvp-plan.md` §3 + `CLAUDE.md`).

## Output

After writing, print:

```
content/questions/<topic>/<slug>.yaml
  sourceRef: <ref>
  sourceFile: docs/knowledge/<path>  ✓ exists
  locales filled: en[, lv, ru]
  pending Tier 2 (DeepL): bg cs da de el es et fi fr ga hr hu it lt mt nl pl pt ro sk sl sv
```

Nothing else. No commit, no further edits.
