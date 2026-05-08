# План разработки MVP — dronelingo.eu

> **Версия:** 1.0 · **Дата:** 2026-05-08 · **Статус:** черновик для согласования
> **Связанные документы:** `docs/plan.md` (бизнес-план), `docs/knowledge/` (база знаний 49 файлов), `Makefile`, `Dockerfile`, `docker-compose.yml`, `docs/DEPLOY.md`

---

## 1. Goal

Запустить веб-MVP, который проводит русско- и англоязычного пользователя из Латвии (затем — из любой страны EASA) от «купил дрон, не знаю что делать» до сдачи **онлайн-экзамена A1/A3 на e.caa.gov.lv с первого раза**.

### Стратегический тезис

Из брейншторма (`docs/plan.md` §6) выбран **тезис B — Pass Guarantee**:

- Учиться **бесплатно**.
- **€19 разово** после подтверждения сдачи (загрузка PDF сертификата).
- Маркетинговая линия: «Сдашь A1/A3 с первого раза — или платишь ноль».

### Локализация

| Tier | Языки | Перевод |
|------|-------|--------|
| **Default** | **`lv`** (латышский) | основной целевой рынок — Латвия |
| **Tier 1** (human-translated, MVP) | `lv`, `en`, `ru` | UI + контент уроков + банк вопросов |
| **Tier 2** (auto-translated + human review) | остальные 21 язык ЕС: bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu, it, lt, mt, nl, pl, pt, ro, sk, sl, sv | UI через автоперевод (DeepL); контент уроков fallback на `en`; flag `verified=false` |
| **Fallback** | непереведённое | `en` |

Архитектурно: все строки UI через `next-intl` или `next-i18next`; контент (Lesson, Question) — multilingual columns с `null = fallback`.

### Платежи

**MVP — заглушка (без Stripe)**. На `/claim` после загрузки сертификата UI имитирует Stripe Checkout (статичная страница «Проверка платежа... ✅ Спасибо!»), бэкенд просто проставляет `Certificate.paidAt = now`. Реальная интеграция Stripe / Lemon Squeezy — после M4 по фидбеку.

Тезис A (Compliance Companion) и C (Operator OS) — за рамками MVP.

### Non-goals (намеренно не делаем)

- Mobile-приложение (web-only mobile-first).
- A2 / STS подготовка (post-MVP, после ≥1k выпускников).
- Drone-aware интеграции (DJI/Autel логи).
- Gamified стрики а-ля Duolingo (тоже после).
- Корпоративный B2B-дашборд.
- Live карта geo-zones (отсылаем на airspace.lv).
- Платёжные подписки (только разовый платёж).

---

## 2. Архитектура

Уже зашита в репозитории (commit `2f101fa` — scaffold mirroring ALTEKO/MezaData):

| Слой | Технология |
|------|-----------|
| Фронтенд | **Next.js 15 (App Router) + React 19 + TypeScript** |
| Стилизация | **Tailwind CSS** + shadcn/ui (минимум) |
| База данных | **PostgreSQL 16** (Docker локально, Hetzner palpalych prod) |
| ORM | **Prisma** (`make push` для dev, `migrate` для prod) |
| Аутентификация | **NextAuth.js** (email magic link + Google) |
| i18n | **next-intl** (App Router-friendly), 24 языка ЕС, default `lv` |
| Автоперевод (Tier 2) | **DeepL API** для UI; контент Tier 2 — fallback на `en` |
| Платежи | **Заглушка** в MVP (имитация Stripe Checkout, без реального процессинга). После MVP — Stripe или Lemon Squeezy |
| Email | **Resend** (transactional) |
| Хранилище | Локальная файловая система контейнера (`/mnt/data/dronelingo` на VPS) |
| CI/CD | **GitHub Actions** (готово в commit 2f101fa) |
| Деплой | `make release v=0.1.0` → tag → CI build → SSH deploy на `palpalych` |
| Мониторинг | (post-MVP) Sentry, Plausible Analytics |

### Структура директорий (которую создадим)

```
dronelingo.eu/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # лендинг, FAQ, цена
│   ├── (app)/              # обучение, требует auth
│   │   ├── learn/          # уроки
│   │   ├── practice/       # тренажёр (одиночные вопросы)
│   │   ├── exam/           # mock-экзамен
│   │   └── claim/          # верификация сдачи + платёж
│   ├── api/                # route handlers
│   └── layout.tsx
├── prisma/
│   └── schema.prisma
├── content/                # MDX-источники уроков
│   └── lessons/
├── scripts/
│   └── import-content.ts   # MDX + question banks → DB
├── docs/
│   ├── plan.md
│   ├── mvp-plan.md         # ← этот файл
│   └── knowledge/          # 49 файлов уже здесь
└── (Makefile, Dockerfile, docker-compose уже есть)
```

---

## 3. Доменная модель

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  locale        String   @default("lv")    // ISO 639-1: lv | en | ru | de | fr | ...
  createdAt     DateTime @default(now())
  attempts      Attempt[]
  examResults   ExamResult[]
  certificate   Certificate?
}

model Topic {
  id          String     @id           // "air-safety", "airspace", ...
  order       Int                      // 1..9
  slug        String     @unique       // language-neutral, e.g. "air-safety"
  titles      Json       // {lv:"...", en:"...", ru:"...", de:"...", ...}; missing keys → fallback to en
  lessons     Lesson[]
  questions   Question[]
}

model Lesson {
  id          String   @id @default(cuid())
  topicId     String
  topic       Topic    @relation(fields: [topicId], references: [id])
  order       Int
  slug        String   @unique
  titles      Json     // {lv, en, ru, ...}
  bodyMdx     Json     // {lv:"...", en:"...", ru:"...", de?:"..."}; missing → fallback en
  estMinutes  Int      @default(5)
  sources     Json     // [{title, url, page}]
}

model Question {
  id           String   @id @default(cuid())
  topicId      String
  topic        Topic    @relation(fields: [topicId], references: [id])
  bank         String                              // "A1A3" | "A2" | "STS"
  difficulty   Int      @default(1)                // 1..3
  stems        Json     // {lv, en, ru, ...}
  options      Json     // [{key:"A", texts:{lv,en,ru,...}, isCorrect}]
  rationales   Json     // {lv, en, ru, ...}
  sourceRef    String                              // "Reg 2019/947 Art. UAS.OPEN.060"
  active       Boolean  @default(true)
}

model Attempt {            // одиночный вопрос (тренажёр)
  id          String   @id @default(cuid())
  userId      String
  questionId  String
  user        User     @relation(fields: [userId], references: [id])
  question    Question @relation(fields: [questionId], references: [id])
  answerKey   String
  isCorrect   Boolean
  msSpent     Int
  createdAt   DateTime @default(now())
}

model ExamResult {         // mock-экзамен (40 вопросов / 40 мин)
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  questionsJson Json     // snapshot вопросов на момент экзамена
  answersJson  Json
  scorePercent Int
  passed       Boolean
  durationMs   Int
  createdAt    DateTime @default(now())
}

model Certificate {        // загруженный пользователем CAA-сертификат
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  fileUrl      String   // S3-like / local fs
  pilotNumber  String?  // "LVA-RP-############"
  uploadedAt   DateTime @default(now())
  verifiedAt   DateTime?
  paidAt       DateTime?
  stripePaymentId String?
}
```

---

## 4. Контент

### 4.1 Карта уроков (9 тем × ~3 урока = ~27 уроков)

Источник тематики: `docs/knowledge/training-guides/syllabus/A1-A3-detailed-syllabus.md`. Каждый урок — короткий MDX с иллюстрацией, пунктами и ссылкой на источник в knowledge base.

| # | Тема | Уроки | Источники в knowledge base |
|---|------|-------|---------------------------|
| 1 | **Aviation regulation** | EU vs LV акты · Open/Specific/Certified · MK noteikumi | `eu-regulations/`, `latvia-caa/web-snapshots/14-normativais-regulejums.md` |
| 2 | **Air safety** | Pilot vs operator · VLOS · FPV + observer · distance to people · 1:1 rule | `latvia-caa/web-snapshots/07-open-category.md`, `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf` ch.UAS.OPEN |
| 3 | **Airspace limitations** | UGZ types · airspace.lv · 120 m rule · NOTAM | `latvia-caa/web-snapshots/11-geographical-zones.md` |
| 4 | **Human performance** | IMSAFE · vision · fatigue · FPV cognitive load | `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf` AMC1 |
| 5 | **Operational procedures** | pre-flight · in-flight · post-flight · emergencies · RTH/fail-safe | `latvia-caa/web-snapshots/04-a2-practical-self-study.md` (адаптировано) |
| 6 | **UAS general knowledge** | C0/C1/C2/C3/C4 classes · CE vs C-class · components · batteries · Wh · Remote ID | `eu-regulations/EU-2019-945-...pdf` |
| 7 | **Privacy & data** | GDPR + кабины · кров. инфраструктура · Datu valsts inspekcija | `latvia-caa/web-snapshots/14-normativais-regulejums.md` |
| 8 | **Insurance** | LV minima · 50k EUR vs 750k SDR · опциональные | `latvia-caa/web-snapshots/12-insurance.md` |
| 9 | **Security & incident reporting** | cyber · обязательные/добровольные репорты · 72h | `latvia-caa/web-snapshots/17-incident-reporting.md` |

### 4.2 Банк вопросов

Стартовый объём — **150 вопросов** (~17 на тему). Источник:

- 26 готовых из `docs/knowledge/test-samples/A1-A3-question-bank.md`
- ~120 новых, написанных вручную на основе EASA AMC + Latvia CAA.

Каждый вопрос привязан к `topicId` + `sourceRef` (например, `Reg 2019/947 UAS.OPEN.060`). Mock-экзамен случайно выбирает 40 вопросов (≥4 на каждую из 9 тем для покрытия).

### 4.3 Гайд по регистрации (блок «Сдаём»)

Скрин-за-скрином (≈8 шагов) на основе `docs/knowledge/latvia-caa/web-snapshots/08-registracija.md`:

1. Регистрация на e.caa.gov.lv → получить аккаунт
2. UAS оператор → 5 EUR / 1 год → получить `LVA############`
3. Маркировка дрона
4. Регистрация как remote pilot → бесплатно → получить `LVA-RP-############`
5. Запись на A1/A3 онлайн-курс
6. Прохождение курса (на нашей платформе ↔ официальный курс)
7. Сдача официального экзамена на e.caa.gov.lv (40 Q / 40 min / 75 %)
8. Загрузка PDF-сертификата к нам → активация Pass Guarantee платежа

---

## 5. Этапы разработки

### M0 — Foundation (готово)

✅ Repo, .gitignore, README, бизнес-план
✅ Docker-compose dev/prod, Makefile, GitHub Actions CI/CD
✅ Knowledge base (49 файлов)
✅ Сервер palpalych готов (mirroring MezaData/ALTEKO)

### M1 — Skeleton + контент-pipeline + i18n (1–2 недели)

**Цель:** запустить лендинг на 3 языках на проде через `make release`. Контент-импорт работает.

- [ ] `npx create-next-app@latest .` — Next.js 15 + Tailwind + TypeScript
- [ ] `prisma init` + schema (раздел 3) — JSON-поля для multilingual
- [ ] NextAuth (email magic link через Resend)
- [ ] **i18n setup**: `next-intl` с App Router, `[locale]` segment, default `lv`
- [ ] Locale-detection: `Accept-Language` header → fallback `en` для не-Tier1
- [ ] Языковой switcher в header: dropdown с 24 флагами ЕС
- [ ] Шапка/футер/layout, mobile-first
- [ ] Translation files: `messages/lv.json`, `en.json`, `ru.json` (human); `de/fr/...` (DeepL auto, помечены `verified=false`)
- [ ] **Контент-импортёр** `scripts/import-content.ts`:
  - Парсит MDX из `content/lessons/<slug>/{lv,en,ru}.mdx`
  - Парсит вопросы из YAML в `content/questions/<topic>.yml` (multilingual fields)
  - Загружает в БД (Topic, Lesson, Question)
  - Идемпотентен (UPSERT по slug/id)
- [ ] Лендинг: hero, value prop («бесплатно учиться, €19 если сдашь»), CTA «Начать бесплатно»
- [ ] Деплой через `make release v=0.1.0` → palpalych

**Acceptance:** `dronelingo.eu`, `dronelingo.eu/en`, `dronelingo.eu/ru` рендерятся; switcher работает.

### M2 — Уроки + одиночный тренажёр (2 недели)

**Цель:** пользователь может пройти все 27 уроков и потренироваться на отдельных вопросах.

- [ ] Авторизация: email magic link, профиль, locale switcher
- [ ] Маршрут `/learn` — список 9 тем + прогресс-бары
- [ ] Маршрут `/learn/[topic]/[lesson]` — MDX-рендер с подсветкой источников
- [ ] Tracking: какие уроки прочитаны (LessonProgress модель + middleware)
- [ ] Маршрут `/practice` — выбор темы + одиночные вопросы
- [ ] Компонент `<Question>`: stem, варианты A/B/C/D, объяснение после ответа
- [ ] Сохранение `Attempt` в БД, статистика «правильно X/Y»
- [ ] Контент: 27 уроков (можно начать с 3 — `air-safety`, `airspace`, `op-procedures`)
- [ ] Контент: 150 вопросов в банке (импорт из A1-A3-question-bank.md + новые)

**Acceptance:** можно прочитать урок и решить 10 вопросов с feedback.

### M3 — Mock-экзамен + Pass Guarantee (2 недели)

**Цель:** реализовать главную фичу — реалистичный экзамен и upsell на €29.

- [ ] Маршрут `/exam` — стартовая страница (правила, кнопка Start)
- [ ] Сессия экзамена: 40 случайных вопросов с покрытием тем, таймер 40 минут, прогресс «3/40»
- [ ] UI: стиль максимально похожий на e.caa.gov.lv (референс — реальный CAA портал)
- [ ] Запрет навигации назад (как в реальном экзамене)
- [ ] По завершении: % правильных, перечень неправильных с объяснениями
- [ ] Создаём `ExamResult` в БД
- [ ] **Readiness gauge**: «ты сдал последние 3 mock с ≥80% — готов»
- [ ] Маршрут `/claim` — пользователь указывает «я сдал реальный экзамен»:
  - Загрузить PDF сертификата
  - OR ввести `LVA-RP-############` + дату сдачи
  - **Заглушка-checkout** на €19: статичная страница «Проверяем платёж...» → `Certificate.paidAt = now`
  - Отправить «спасибо» письмо
- [ ] **Payment abstraction**: `processPayment(userId, €19)` — интерфейс с одной реализацией `StubProvider`. Когда подключим Stripe — добавится `StripeProvider` без изменения вызывающего кода.
- [ ] (V0) Верификация сертификата ручная — оператор проверяет PDF в админке. Автоверификация через CAA API — post-MVP.

**Acceptance:** пользователь может пройти mock-экзамен → получить score → загрузить сертификат → пройти заглушку платежа → получить email.

### M4 — Гайд по регистрации + полировка (1–2 недели)

**Цель:** закрыть путь пользователя «не знаю с чего начать» → «сдал».

- [ ] Маршрут `/guide` — пошаговый гайд по e.caa.gov.lv (8 шагов из §4.3)
- [ ] Каждый шаг: скриншот + краткое объяснение + deep-link на нужную страницу e.caa.gov.lv
- [ ] Footer FAQ: про цены, валидность 5 лет, ЕС-признание, A2/STS
- [ ] Privacy policy + Terms of service (минимум: GDPR, обработка email и платежей)
- [ ] Cookie banner (минимально-нужный, без bloat-а)
- [ ] SEO: title/meta/og:image на лендинг и `/guide`
- [ ] Plausible analytics (privacy-friendly)
- [ ] **Soft-launch:** делимся с 5–10 знакомыми пилотами в Латвии для пилот-теста

**Acceptance:** платформа годится для запуска в r/Latvia, Latvian drone Facebook-группах.

### M5 — Sharpening (post-MVP, по фидбеку)

Возможные направления (выбираем по данным M4):

- Wallet-pass (Apple/Google) с публичной верификацией.
- Лента изменений регуляции (мониторинг EU Official Journal — JSON diff).
- Английский UI + контент → выход за пределы LV.
- A2 контент.
- Sentry + продвинутая аналитика (heatmaps, drop-off на каждом уроке).

---

## 6. Метрики успеха MVP

После M4 за 4 недели soft-launch собираем:

| Метрика | Цель MVP |
|---------|---------|
| Регистраций (email magic link) | ≥ 100 |
| Завершили хотя бы 1 mock-экзамен | ≥ 30 |
| Pass-rate последнего mock у платящих | ≥ 80 % |
| Загрузок реального сертификата | ≥ 10 |
| Прохождение заглушки checkout (€19) | ≥ 60 % загрузивших |
| Сигнал готовности к реальной выручке | 10 × €19 = ~€190 → имеет смысл подключать Stripe |
| NPS (анкета после оплаты) | ≥ 40 |

Если pass-rate < 60 % или конверсия < 30 % — пересматриваем тезис.

---

## 7. Out-of-scope для MVP (явно)

- Мобильное приложение
- A2 / STS контент (только тизер «скоро»)
- Drone-aware интеграции
- Wallet pass / QR публичная верификация
- Корпоративные дашборды
- Live geo-zone карта (ссылка на airspace.lv)
- Партнёрства со страховщиками / ритейлерами (после ≥100 платящих)
- Реферальная программа
- Голосовой режим / аудио-уроки
- Cooperative ATC сценарии
- Сценарный симулятор (post-MVP, идея #5 из brainstorm)
- Программный SEO-генератор страниц «нужна ли мне лицензия на Mavic в Польше»

---

## 8. Риски и митигации

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| **CAA Latvia меняет UI** e.caa.gov.lv → гайд устареет | Средняя | Среднее | Гайд в MDX, обновляется при изменении; раз в квартал ручной аудит |
| **Регуляция меняется** (поправки к 2019/947) | Средняя | Высокое | Каждый вопрос имеет `sourceRef`; при изменении параграфа — помечаем затронутые на ревью (M5+) |
| **Низкая конверсия в Pass Guarantee** | Средняя | Высокое | Pivot на тезис A (Compliance Companion) с разовым платежом upfront за €19 |
| **Дублирующие платформы** (DronuEksāmeni.lv, EU Drone Port) | Высокая | Среднее | Дифференциация: бесплатный вход + Pass Guarantee + русский язык |
| **CAA публикует свой бесплатный курс** | Низкая | Очень высокое | Уже опубликован — `e.caa.gov.lv` сам по себе бесплатен. Наша ценность не в курсе, а в ясности и удобном UX |
| **GDPR-комплаенс ошибка** (хранение PDF сертификатов) | Средняя | Высокое | Сразу: privacy policy + DPA + минимальный сбор данных; через 2 года автоудаление; не индексируем сертификаты публично |
| **Реальный Stripe не подключён в MVP** | — | — | Намеренно: валидируем что пользователи готовы платить (доходят до checkout-заглушки) **до** интеграции |
| **Хостинг palpalych упадёт** | Низкая | Среднее | Бэкапы Postgres ежедневно, GitHub Actions может задеплоить на любой VPS |
| **Я не дойду до M3 за 5 недель** | Средняя | Среднее | Жёсткий timeboxing: M2 за 2 нед, M3 за 2 нед; если задержка — режем уроки до 9 (по 1 на тему) |

---

## 9. Решения (зафиксированы 2026-05-08)

| # | Вопрос | Решение |
|---|--------|---------|
| 1 | Стратегия | ✅ **тезис B — Pass Guarantee** |
| 2 | Цена | **€19** разово (после сдачи) |
| 3 | Платежи | **Заглушка** в MVP, без реального процессинга |
| 4 | Default локаль | **`lv`** (латышский) |
| 5 | Tier 1 (human) | **lv, en, ru** |
| 6 | Tier 2 (auto + fallback) | **остальные 21 язык ЕС** через DeepL, fallback на en |
| 7 | Mock-экзамен реплика | стиль приближен к `e.caa.gov.lv`, но не piксel-perfect 1:1 |

## 10. Открытые вопросы (для M4+)

1. **Domain:** `dronelingo.eu` уже куплен? Если нет — DNS на M1.
2. **Sentry / Plausible** — подключаем сразу в M1 или после M3?
3. **Реальный платёжный провайдер** — Stripe или Lemon Squeezy? (после ≥10 прохождений заглушки)
4. **Tier 2 переводов** — перевод пользовательского контента (Lesson MDX) на 21 язык авто = ~€100–500 разово через DeepL API; делать сразу в M2 или ждать спроса?
5. **Лицензия проекта** (в README — TBD).

## 11. Бюджет M1

- домен `dronelingo.eu` (~€20/год)
- Resend (free tier до 3k emails/мес)
- VPS palpalych (уже оплачен, shared с MezaData/ALTEKO)
- DeepL API free tier (500k символов/мес — хватает на UI всех 24 языков)
- **Итого: ~€20 на старт**
