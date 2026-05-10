## Goal
Pivot from "pay after passing" to "pay upfront for access" freemium model.

## Context
Old model: everything free, pay €19 only after passing official CAA Latvia exam.
New model: Air Safety topic (topic 1) fully free, everything else requires €19 one-time purchase.
Decision: /claim removed entirely, /pricing replaces it as the revenue entry point.

## Steps
1. src/lib/access.ts — localStorage access token utility
2. src/components/access/AccessGate.tsx — client paywall component
3. src/components/lesson/index.tsx — MDX components map (user added lessonComponents import)
4. src/components/pricing/PricingFlow.tsx — new payment form (replaces ClaimFlow)
5. src/app/[locale]/pricing/page.tsx — new pricing page
6. messages/{en,lv,ru}.json — update landing copy, remove claim namespace, add access/pricing
7. NavLinks.tsx — remove "claim" link
8. LearnTopicsList.tsx — lock icon on paid topics
9. learn/[topic]/page.tsx — AccessGate for non-free topics
10. practice/page.tsx — lock icon on paid topics
11. practice/[topic]/page.tsx — AccessGate for non-free topics
12. exam/page.tsx — ExamStartGate: replace Start button with Get Access if no access
13. exam/session/page.tsx — full AccessGate
14. ExamResultView.tsx — replace /claim CTA with external e.caa.gov.lv link
15. Delete src/app/[locale]/claim/ and src/components/claim/
16. sitemap.ts — /claim → /pricing
17. Footer.tsx — remove claim from any footer refs

## Free tier
FREE_TOPIC_SLUG = "air-safety" (first topic, all lessons, practice drills)
Everything else requires access token in localStorage: dronelingo:access:v1

## Risks
- Flash of content before gate renders (mitigated: return null while checking)
- localStorage cleared = lost access (known, acceptable until NextAuth lands)
- Exam session loads 40 questions server-side even for gated users (acceptable data)
