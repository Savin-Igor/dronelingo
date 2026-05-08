## Goal

Ship M4 step 1 — `/guide` registration walkthrough plus FAQ, plus
minimal Privacy / Terms pages so the footer links land on real
content.

## Context

- Umbrella issue #5 §M4. Source: `docs/knowledge/latvia-caa/web-snapshots/`
  (especially `08-registracija.md`, `02-a1-a3-online-exam.md`,
  `12-insurance.md`, `11-geographical-zones.md`).
- Legal copy (Privacy / Terms) is intentionally minimal and clearly
  marked as draft until external review. It satisfies the footer-link
  requirement without blocking on lawyer turnaround.
- All four pages render in lv / en / ru via the same MDX-from-filesystem
  helper used here for the first time. Lesson MDX in DB stays as is.

## Steps

1. `content/static/{guide,faq,privacy,terms}/{lv,en,ru}.mdx` — full
   localised copy. Guide structured as 8 sequential steps.
2. `src/lib/static-page.ts` — read and serve a static MDX file
   per locale with `en` fallback.
3. Routes under `src/app/[locale]/{guide,faq,privacy,terms}/page.tsx`
   each calling `MDXRemote` on the result.
4. Footer in `src/components/landing/Footer.tsx` already references
   `guide`, `faq`, `privacy`, `terms` keys — turn them into real
   `<Link>`s.
5. Verify build / lint / type-check / smoke test all 12 new routes
   (4 pages × 3 locales).

## Risks

- MDX from filesystem at runtime requires the file to ship inside the
  Next.js standalone output. Use `outputFileTracingIncludes` or copy
  the directory in the Dockerfile next iteration. For local dev /
  CI we can rely on the `process.cwd()` filesystem.
- Privacy / Terms language is non-binding draft. Mark clearly.
- Guide steps reference live URLs (`e.caa.gov.lv`, `airspace.lv`) —
  CAA Latvia could rename pages. Quarterly audit suggested in MVP plan.

## Out of scope

- Cookie banner.
- Plausible Analytics.
- Step-level deep-linking via `[step]` segment (single-page is fine
  for MVP; anchor links cover deep-linking).
- Real lawyer-reviewed Privacy / Terms.
