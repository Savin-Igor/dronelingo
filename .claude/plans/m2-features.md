## Goal

Ship M2 (lessons + practice trainer) without auth blocker — anonymous mode for trainer and lesson progress.

## Context

- M2 milestone from `docs/mvp-plan.md` and umbrella issue #5.
- NextAuth not wired (#9 blocked on #3) → use anonymous mode (localStorage) for attempts/progress.
- Importer + schema already in place (commits f80bf77 / db628f4).
- Air-safety topic + 1 lesson + 2 questions already seeded.
- 9 topics total per syllabus; 8 remaining.

## Steps

1. **Seed 8 remaining topics + 1 lesson per topic** (`content/topics/*.yml`, `content/lessons/*/`)
   - Topics: airspace-limitations, aviation-regulation, human-performance, operational-procedures, uas-general-knowledge, privacy, insurance, security
   - Each topic: 1 starter lesson with `lv/en/ru` MDX + `sourceRef`
   - Cite knowledge base on every claim
2. **Extend question bank** to ~25–30 questions across topics
   - Keep `id` namespacing per topic prefix (`as-`, `al-`, `ar-`, `hp-`, `op-`, `ug-`, `pr-`, `in-`, `se-`)
3. **Lesson polish** — prev/next navigation + topic TOC sidebar at lesson page
4. **`/practice` trainer (anonymous mode)**
   - `/[locale]/practice` index → topic picker (server component)
   - `/[locale]/practice/[topic]` → client trainer pulls questions via Server Action
   - One question at a time, A/B/C/D, instant feedback + explanation
   - Attempts kept in `localStorage` keyed by `dronelingo:attempts:v1` until auth lands
   - Per-session accuracy counter
5. **Lesson progress tracking (anonymous)**
   - `localStorage` key `dronelingo:lesson-progress:v1`
   - Mark visited on lesson view (client component effect)
   - Render checkmark in topic page + percent on `/learn` index
6. Verify build + lint + type-check

## Risks

- Anonymous-only state means data lost when user clears storage. Acceptable for MVP. When auth lands, we sync localStorage → DB on first login.
- Adding client components to lesson page risks losing SSR benefits. Keep MDX render server-side, only progress marker client-side.
- Question coverage thin per topic → trainer demos breadth, not depth. Acceptable for milestone.
- next-mdx-remote scope: server components only — fine for current MDX (no interactive blocks yet).

## Out of scope

- DB-backed `LessonProgress`/`Attempt` (waits for #9 NextAuth).
- Mock exam timer / `ExamResult` (M3).
- Stripe stub (M3).
- DeepL Tier 2 translation of new content (#12).
