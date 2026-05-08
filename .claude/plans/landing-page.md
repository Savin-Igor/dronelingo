# Landing page — lv / en / ru

Reference: GitHub issue #11. Closes `mvp-development.md` §M1 step 7.

## Goal

Replace the placeholder `[locale]/page.tsx` with a real landing page that:
- explains the Pass Guarantee thesis in one screen
- works in `lv`, `en`, `ru`
- uses cited facts from `docs/knowledge/` (no regulatory claims paraphrased from training data — per the `cite-knowledge` skill)
- ships without external dependencies (no #9 sign-in, no Stripe, no DeepL)

## Page structure

1. **Hero** — headline + sub + 2 CTAs
2. **Value prop strip** — single sentence "Free to learn, €19 only if you pass"
3. **How it works** (3 steps) — Learn → Practice → Pass → Pay
4. **Why dronelingo** (3 cards) — Latvian-first / Pass-or-pay / EU-aligned content
5. **Exam facts** (cited) — 40 questions, 40 minutes, ≥75% to pass, free at `e.caa.gov.lv`. Source: `docs/knowledge/latvia-caa/web-snapshots/02-a1-a3-online-exam.md`
6. **Footer** — placeholder links to `/guide`, `/faq`, `/privacy`, `/terms`; copyright + locale list

No images / illustrations. Plain typography on white. Tailwind only. All server components. No client-side JS.

## CTA targets

- Primary CTA «Start learning» → `#how-it-works` anchor (in-page scroll). Will swap to `/sign-in` once #9 lands. Reasoning: linking to `/sign-in` now creates a 404; linking to `mailto:` leaks intent and looks unprofessional; an anchor scroll keeps the visitor on-page and is honest about the current state.
- Secondary CTA «How it works» → `#how-it-works`

When #9 ships, only the primary CTA href changes. One-line diff.

## Translation keys

All strings under `landing.*` in `messages/{lv,en,ru}.json`. Hero/sub/CTA labels, the 3 step titles + descriptions, the 3 card titles + descriptions, exam-facts numbers labelled (numbers themselves are locale-neutral). Footer link labels.

Values come from the **product positioning** in `docs/mvp-plan.md` and `docs/plan.md` §6 (thesis B). Cited regulatory facts come from `docs/knowledge/latvia-caa/web-snapshots/02-a1-a3-online-exam.md` and `08-registracija.md`.

## Plain-content rules

- **lv**: no anglicisms ("eksāmens", not "tests"; "drons", not "kvadrokopters" without context)
- **ru**: no transliterated English ("экзамен", not "тест"; "дрон" — established loan, OK)
- **en**: short sentences, no marketing speak

## Steps

1. Add `landing.*` keys to `messages/{lv,en,ru}.json`
2. Create `src/components/landing/` with: `Hero.tsx`, `HowItWorks.tsx`, `WhyDronelingo.tsx`, `ExamFacts.tsx`, `Footer.tsx` — all server components
3. Replace `src/app/[locale]/page.tsx` body to compose those components
4. Add minimal Tailwind utility classes — no custom theme, no @apply
5. Smoke `/lv`, `/en`, `/ru` in dev; type-check / lint / build green
6. Lighthouse-style sanity (no client JS, all server-rendered)
7. Commit + push

## Acceptance

- [ ] `/lv`, `/en`, `/ru` render hero, value prop, how-it-works, why-cards, exam-facts, footer
- [ ] No console errors / no hydration warnings (verify in dev)
- [ ] type-check / lint / build green
- [ ] All regulatory facts on the page have a citation comment in the source file pointing to the knowledge-base path
- [ ] No images / no client components / no `useState`

## Out of scope

- Brand identity, custom illustrations, hero asset
- Real `/sign-in`, `/learn`, `/guide`, `/faq`, `/privacy`, `/terms` (footer links go to `#` for now)
- Plausible / analytics (M4)
- A/B testing
- Locale switcher in header (#8)
- Mobile menu / nav (no nav links to switch between yet)

## Risks

- **Wrong wording in lv** — I am not a native Latvian speaker; the lv strings will pass through plain-content guidance but may need a native review pass. Acceptance does not require native review; that is a follow-up.
- **CTA dead-end** — anchor scroll is honest but converts worse than a real sign-up. That is acceptable while #9 is open. When #9 lands, change one href.
