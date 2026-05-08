# Translations

## Tier 1 — human-translated (shipped with skeleton)

- `lv.json` — default locale (Latvia is primary market)
- `en.json` — fallback for any missing key in any other locale
- `ru.json`

## Tier 2 — DeepL auto-translated (deferred to follow-up issue)

The remaining 21 EU languages will be added by a DeepL pipeline together with
a `verified=false` flag: `bg cs da de el es et fi fr ga hr hu it lt mt nl pl
pt ro sk sl sv`.

Until that lands, requests for non-Tier-1 locales fall back to `en` via the
next-intl middleware. Adding empty stub files now would cause stale fallbacks
in production, so we deliberately do not.
