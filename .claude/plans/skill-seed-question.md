# Skill: seed-question

## Goal

User-invocable skill `/seed-question` that scaffolds a new EASA exam question YAML at `content/questions/<topic>/<slug>.yaml`, pre-populated with multilingual fields (`lv/en/ru`) and a `sourceRef` + `sourceFile` pair that **must resolve to a real file in `docs/knowledge/`**.

## Context

- Per `docs/mvp-plan.md` §M2: ~150 questions in the bank, each with `stems`, `options`, `rationales` as `Json {lv,en,ru,...}` and a `sourceRef` string for traceability.
- Importer: `scripts/import-content.ts` (planned, not yet written) reads YAML → UPSERTs into Prisma `Question` model.
- Knowledge base (`docs/knowledge/`) is read-only (CLAUDE.md). Every question must trace to a file there.
- 9 EASA topics, slugs in lower-kebab-case (see TOPICS.md inside the skill).

## Steps

1. `.claude/skills/seed-question/SKILL.md` — frontmatter (`disable-model-invocation: true`) + procedural instructions for Claude when invoked.
2. `.claude/skills/seed-question/template.yaml` — canonical structure with placeholder text.
3. `.claude/skills/seed-question/validate.sh` — checks `sourceFile:` value resolves to a real path under `docs/knowledge/`. Exits non-zero with a useful message on failure.
4. `.claude/skills/seed-question/TOPICS.md` — canonical topic slug list, derived from `docs/knowledge/training-guides/syllabus/A1-A3-detailed-syllabus.md`.
5. Self-test the validator against a known good and a known bad path.

## Risks

- **YAML parsing in bash** is brittle. Mitigate by keeping the validator scope narrow: it only extracts the `sourceFile:` line via `awk`, no nested parsing.
- **Topic slug drift** if syllabus is reorganized. Mitigate by keeping TOPICS.md inside the skill and noting it must be updated alongside any syllabus change.
- **Import schema not finalized** — until `scripts/import-content.ts` exists, the YAML field names are a forward-looking convention. Locked to the schema in `docs/mvp-plan.md` §6.
