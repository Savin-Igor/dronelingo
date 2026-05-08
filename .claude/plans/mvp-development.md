# MVP development plan

## Goal

Запустить веб-MVP `dronelingo.eu` за **5 недель** (M1–M4), который проводит пользователя из Латвии от «купил дрон» до сдачи онлайн-экзамена A1/A3 на `e.caa.gov.lv`. Стратегия — **Pass Guarantee** (тезис B): учиться бесплатно, **€19 разово после подтверждения сдачи** (платёжная заглушка вместо реального Stripe в MVP).

**Локализация:** default `lv`; Tier 1 (human-translated) — `lv/en/ru`; Tier 2 (DeepL auto, fallback на `en`) — остальные 21 язык ЕС.

Полный документ: `docs/mvp-plan.md`.

## Context

- Repo: `Savin-Igor/dronelingo` (main).
- Уже сделано: бизнес-план (`docs/plan.md`), knowledge base 49 файлов (`docs/knowledge/`), CI/CD scaffold + Docker + Makefile (commits 4822ec0..2f101fa).
- Ничего фронтенд-кода нет — только инфра.
- Стек выбран: **Next.js 15 + Prisma + PostgreSQL + Tailwind + NextAuth + next-intl + Resend**, mirror MezaData/ALTEKO. Stripe — заглушка в MVP; DeepL API для Tier 2 переводов UI.
- Хостинг: shared VPS `palpalych` (Hetzner) — `/opt/dronelingo/`, `/mnt/data/dronelingo/`.
- Контент-маршрут: 9 тем экзамена A1/A3 → ~27 уроков → ~150 вопросов → mock-экзамен 40 Q / 40 min / 75 %.
- Источник тематики и вопросов — `docs/knowledge/training-guides/syllabus/A1-A3-detailed-syllabus.md` + `test-samples/A1-A3-question-bank.md`.
- Pass Guarantee: пользователь после реального экзамена загружает PDF сертификата → Stripe Checkout €29 → ручная верификация в админке.

## Steps

### M1 — Skeleton + i18n + контент-pipeline (1–2 недели)
1. `npx create-next-app .` — Next.js 15, App Router, Tailwind, TS.
2. `prisma init` + schema: `User` (default locale `lv`), `Topic`, `Lesson`, `Question`, `Attempt`, `ExamResult`, `Certificate` — multilingual поля как `Json {lv,en,ru,...}` с fallback на `en`.
3. NextAuth: email magic link + Google.
4. **next-intl** с `[locale]` segment, default `lv`; switcher на 24 ЕС языка; Accept-Language detection.
5. Translation files: `lv/en/ru` human; `de/fr/...` DeepL auto + `verified=false`.
6. `scripts/import-content.ts` — импортёр MDX (`content/lessons/<slug>/{lv,en,ru}.mdx`) + YAML вопросов в БД (UPSERT).
7. Landing на 3 языках, value prop «бесплатно учиться, €19 если сдашь», CTA.
8. `make release v=0.1.0` → palpalych. **Acceptance:** `dronelingo.eu`, `/en`, `/ru` рендерятся, switcher работает.

### M2 — Уроки + одиночный тренажёр (2 недели)
1. Маршруты `/learn`, `/learn/[topic]`, `/learn/[topic]/[lesson]` — MDX-рендер.
2. `LessonProgress` модель + middleware tracking.
3. `/practice` — выбор темы + одиночные вопросы; `<Question>` компонент с feedback.
4. Сохранение `Attempt`.
5. Контент: 9 уроков (по 1 на тему — минимум) + 150 вопросов в банке. **Acceptance:** прочитать урок, решить 10 вопросов.

### M3 — Mock-экзамен + Pass Guarantee заглушка (2 недели)
1. `/exam` — старт с правилами; сессия 40 вопросов случайно с ≥4 на тему, таймер 40 мин.
2. Стиль UI близкий к `e.caa.gov.lv`; запрет navigation back.
3. По завершении: score + объяснения ошибок; `ExamResult` в БД.
4. Readiness gauge на дашборде.
5. `/claim` — загрузка PDF сертификата ИЛИ ввод `LVA-RP-############` → **stub-checkout** на €19 → `Certificate.paidAt = now` + email.
6. **Payment abstraction** `processPayment(userId, €19)` с одной реализацией `StubProvider` (готова к замене на Stripe).
7. Админ-страница для ручной верификации сертификатов. **Acceptance:** mock → cert upload → stub-checkout → email.

### M4 — Гайд по регистрации + полировка (1–2 недели)
1. `/guide` — 8 шагов из `docs/knowledge/latvia-caa/web-snapshots/08-registracija.md`, скриншоты + deep-links.
2. FAQ, Privacy policy, ToS, cookie banner.
3. SEO + Plausible analytics.
4. Soft-launch на 5–10 знакомых пилотов. **Acceptance:** готово к публикации в r/Latvia.

### Decisions (закрыты 2026-05-08)
- ✅ Цена: **€19** (с заглушкой Stripe; реальный процессинг — после ≥10 успешных stub-checkouts)
- ✅ Default локаль: **lv**
- ✅ Tier 1 (human): **lv, en, ru**; Tier 2 (DeepL auto, fallback en): остальные 21 язык ЕС

## Risks

- **CAA меняет UI портала** — гайд устареет (Средняя/Среднее) → ежеквартальный ручной аудит.
- **Регуляция меняется** (поправки к 2019/947) → каждый вопрос имеет `sourceRef`, помечать затронутые на ревью.
- **Низкая конверсия Pass Guarantee** (Средняя/Высокое) → pivot на тезис A (Compliance Companion) с upfront €19.
- **Конкуренты** (DronuEksāmeni.lv, EU Drone Port) → дифференциация: бесплатный вход + русский язык + Pass Guarantee.
- **GDPR при хранении PDF сертификатов** → privacy policy + DPA + автоудаление через 2 года + минимальный сбор данных.
- **Stripe заморозка** → backup Lemon Squeezy.
- **Срыв сроков** → жёсткий timeboxing; если задержка — резать с 27 уроков до 9 (по 1 на тему).
