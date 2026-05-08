# MVP development plan

## Goal

Запустить веб-MVP `dronelingo.eu` за **5 недель** (M1–M4), который проводит пользователя из Латвии от «купил дрон» до сдачи онлайн-экзамена A1/A3 на `e.caa.gov.lv`. Стратегия — **Pass Guarantee** (тезис B): учиться бесплатно, **€19–29 разово после подтверждения сдачи**.

Полный документ: `docs/mvp-plan.md`.

## Context

- Repo: `Savin-Igor/dronelingo` (main).
- Уже сделано: бизнес-план (`docs/plan.md`), knowledge base 49 файлов (`docs/knowledge/`), CI/CD scaffold + Docker + Makefile (commits 4822ec0..2f101fa).
- Ничего фронтенд-кода нет — только инфра.
- Стек выбран: **Next.js 15 + Prisma + PostgreSQL + Tailwind + NextAuth + Stripe + Resend**, mirror MezaData/ALTEKO.
- Хостинг: shared VPS `palpalych` (Hetzner) — `/opt/dronelingo/`, `/mnt/data/dronelingo/`.
- Контент-маршрут: 9 тем экзамена A1/A3 → ~27 уроков → ~150 вопросов → mock-экзамен 40 Q / 40 min / 75 %.
- Источник тематики и вопросов — `docs/knowledge/training-guides/syllabus/A1-A3-detailed-syllabus.md` + `test-samples/A1-A3-question-bank.md`.
- Pass Guarantee: пользователь после реального экзамена загружает PDF сертификата → Stripe Checkout €29 → ручная верификация в админке.

## Steps

### M1 — Skeleton + контент-pipeline (1–2 недели)
1. `npx create-next-app .` — Next.js 15, App Router, Tailwind, TS.
2. `prisma init` + schema: `User`, `Topic`, `Lesson`, `Question`, `Attempt`, `ExamResult`, `Certificate` (поля — в `docs/mvp-plan.md` §3).
3. NextAuth: email magic link + Google, locale в `User.locale`.
4. Layout: header/footer, RU/EN switcher, mobile-first.
5. `scripts/import-content.ts` — идемпотентный импортёр MDX + YAML вопросов в БД.
6. Landing page: hero, value prop, CTA «Начать бесплатно».
7. `make release v=0.1.0` → деплой на palpalych. **Acceptance:** домен открывается.

### M2 — Уроки + одиночный тренажёр (2 недели)
1. Маршруты `/learn`, `/learn/[topic]`, `/learn/[topic]/[lesson]` — MDX-рендер.
2. `LessonProgress` модель + middleware tracking.
3. `/practice` — выбор темы + одиночные вопросы; `<Question>` компонент с feedback.
4. Сохранение `Attempt`.
5. Контент: 9 уроков (по 1 на тему — минимум) + 150 вопросов в банке. **Acceptance:** прочитать урок, решить 10 вопросов.

### M3 — Mock-экзамен + Pass Guarantee (2 недели)
1. `/exam` — старт с правилами; сессия 40 вопросов случайно с ≥4 на тему, таймер 40 мин.
2. Стиль UI близкий к `e.caa.gov.lv`; запрет navigation back.
3. По завершении: score + объяснения ошибок; `ExamResult` в БД.
4. Readiness gauge на дашборде.
5. `/claim` — загрузка PDF сертификата ИЛИ ввод `LVA-RP-############` → Stripe Checkout €29 → `Certificate.paidAt` + email-благодарность.
6. Админ-страница для ручной верификации сертификатов. **Acceptance:** пройти mock → загрузить сертификат → оплатить.

### M4 — Гайд по регистрации + полировка (1–2 недели)
1. `/guide` — 8 шагов из `docs/knowledge/latvia-caa/web-snapshots/08-registracija.md`, скриншоты + deep-links.
2. FAQ, Privacy policy, ToS, cookie banner.
3. SEO + Plausible analytics.
4. Soft-launch на 5–10 знакомых пилотов. **Acceptance:** готово к публикации в r/Latvia.

### Open decisions (требуются от владельца до M2)
- Цена: €19 vs €29?
- Язык MVP: RU only vs RU + EN?
- Stripe vs Lemon Squeezy?

## Risks

- **CAA меняет UI портала** — гайд устареет (Средняя/Среднее) → ежеквартальный ручной аудит.
- **Регуляция меняется** (поправки к 2019/947) → каждый вопрос имеет `sourceRef`, помечать затронутые на ревью.
- **Низкая конверсия Pass Guarantee** (Средняя/Высокое) → pivot на тезис A (Compliance Companion) с upfront €19.
- **Конкуренты** (DronuEksāmeni.lv, EU Drone Port) → дифференциация: бесплатный вход + русский язык + Pass Guarantee.
- **GDPR при хранении PDF сертификатов** → privacy policy + DPA + автоудаление через 2 года + минимальный сбор данных.
- **Stripe заморозка** → backup Lemon Squeezy.
- **Срыв сроков** → жёсткий timeboxing; если задержка — резать с 27 уроков до 9 (по 1 на тему).
