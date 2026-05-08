## Goal

Ship M3 (mock exam + readiness gauge + Pass-Guarantee claim flow stub)
without auth blocker — same anonymous-mode pattern as M2.

## Context

- Umbrella issue #5 §M3.
- Current question bank: 26 (≈3 per topic). 40-question exam needs
  ≥4 per topic across 9 topics → expand to ≥45 first.
- ExamResult, Certificate, CertificateKind models exist in schema —
  unused until #9 NextAuth lands. Until then, exam history is held in
  localStorage just like attempts/progress.
- Real Stripe is out of scope per `mvp-development.md` — payment goes
  through `StubProvider` (Stripe-shaped interface, immediate success).

## Steps

1. **Expand question bank to ≥45 questions** (`content/questions/*.yml`).
   Aim for ≥5 per topic; keep prefix namespacing.
2. **`/exam` start screen** (server) — explain rules (40 q / 40 min /
   ≥75 % to pass), CTA to begin.
3. **`/exam/session` client trainer** — picks 40 questions
   stratified ≥4 per topic, runs 40-min countdown, prevents back-nav
   via `beforeunload`, lets user navigate prev/next within session,
   shows progress badge "Q 7 / 40".
4. **`/exam/result/[id]` page** — score, per-topic breakdown, list of
   missed questions with explanations + sourceRef.
5. **Anonymous exam history** — `dronelingo:exam-history:v1` array of
   `{id, ts, score, total, perTopic, durationSec}`. ExamResult model
   waits for auth.
6. **Readiness gauge** — derived from last 3 mocks; surface on
   `/practice` and on the post-exam result screen.
7. **`/claim` stub** — single screen with two inputs (PDF upload OR
   `LVA-RP-############`) + €19 stub-checkout button. On success
   stores `dronelingo:claim:v1 = {kind, ref, paidAt}`.
8. **Payment abstraction** — `src/lib/payment/{provider.ts,stub.ts}` with
   `processPayment({ amount, userRef })` returning `{ ok: true,
   reference: stub_<uuid> }` after a 600 ms delay.
9. Verify build / lint / type-check / smoke routes.

## Risks

- Anonymous storage means exam history is lost on cache wipe. OK for
  MVP; auth migration handles it later.
- Disabling back navigation in browsers is best-effort —
  `beforeunload` only triggers a confirm dialog, not a hard block.
  Document the limit instead of fighting the browser.
- Readiness gauge uses localStorage shape that must round-trip
  cleanly when DB-backed history arrives.
- Stratified random selection assumes all 9 topics have ≥4 questions.
  Importer should reject the dataset earlier if not.

## Out of scope

- DB-backed ExamResult / Certificate (waits for #9).
- Real Stripe (stays stubbed until ≥10 successful stub flows).
- Admin verification view for PDF certificates (deferred).
- Email sending after claim (waits for Resend / #3).
