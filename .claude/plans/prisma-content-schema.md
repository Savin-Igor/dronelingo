# Prisma content schema — Topic / Lesson / Question / Attempt / ExamResult / Certificate

Reference: GitHub issue #7. Closes the rest of `mvp-development.md` §M1 step 2.

## Goal

Add the six content/exam models to `prisma/schema.prisma` with multilingual `Json` fields (`{lv, en, ru, ...}` with `en` fallback). One migration. No app code consumes these yet — pure schema PR. Unlocks #9 (NextAuth tables piggyback on top), the content importer, and all of M2/M3.

## Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | One migration `add_content_schema` covering all six models | Atomic, fewer prod-DB churn cycles. |
| 2 | Multilingual content as `Json` (per CLAUDE.md), no per-locale tables | CLAUDE.md mandate. |
| 3 | `Question.options` as `Json` array of `{id, text:Json}` (per `mvp-development.md`) | Faster than separate `Option` table; never queried as relational. |
| 4 | `Question.sourceRef` is **mandatory** (`String`, not `String?`) | CLAUDE.md: every exam question must cite back into `docs/knowledge/`. |
| 5 | `Lesson.sourceRef` is **optional** | A lesson may cite multiple sources inline in MDX; the field is a primary anchor. |
| 6 | Postgres enum for `Certificate.kind` ("PDF" / "CAA_ID") | Type-safe; only 2 values; will not churn. |
| 7 | `LessonProgress` is **deferred** (M2 step 2 in `mvp-development.md`) | Issue #7 explicitly scopes 6 models. Will add when M2 starts. Filed as part of M2 work, not this PR. |
| 8 | Auth.js tables (`Account`, `Session`, `VerificationToken`) are **deferred to #9** | Cleaner blast radius. NextAuth v5 may still iterate its adapter shape; better to land alongside the working route handler. |
| 9 | `User` gets new back-relations (`attempts`, `examResults`, `certificates`) | Required for FK integrity. Non-breaking — additive only. |
| 10 | No soft-delete columns | YAGNI. GDPR auto-delete (`Certificate` after 2y) is a future cron, not a column. |

## Schema sketch

```prisma
model Topic {
  id        String   @id @default(cuid())
  slug      String   @unique
  ord       Int
  title     Json
  summary   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lessons   Lesson[]
  questions Question[]

  @@index([ord])
}

model Lesson {
  id        String   @id @default(cuid())
  topicId   String
  topic     Topic    @relation(fields: [topicId], references: [id], onDelete: Cascade)
  slug      String
  ord       Int
  title     Json
  bodyMdx   Json
  sourceRef String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([topicId, slug])
  @@index([topicId, ord])
}

model Question {
  id              String    @id @default(cuid())
  topicId         String
  topic           Topic     @relation(fields: [topicId], references: [id], onDelete: Restrict)
  stem            Json
  options         Json      // [{ id: "a", text: {lv,en,ru,...} }, ...]
  correctOptionId String
  explanation     Json
  sourceRef       String    // mandatory
  difficulty      Int?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  attempts        Attempt[]

  @@index([topicId])
}

model Attempt {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  questionId       String
  question         Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedOptionId String
  isCorrect        Boolean
  createdAt        DateTime @default(now())

  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, questionId])
}

model ExamResult {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  score       Int
  total       Int
  passed      Boolean
  perTopic    Json
  durationSec Int
  takenAt     DateTime @default(now())

  @@index([userId, takenAt(sort: Desc)])
}

enum CertificateKind {
  PDF
  CAA_ID
}

model Certificate {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  kind        CertificateKind
  fileUrl     String?
  caaIdRef    String?
  verifiedAt  DateTime?
  paidAt      DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId])
}
```

## Steps

1. Edit `prisma/schema.prisma` — add the six models + enum + back-relations on `User`
2. `DATABASE_URL=... npx prisma migrate dev --name add_content_schema --skip-seed`
3. Verify Prisma Client regenerates and exposes new models (`npx prisma generate`)
4. `npm run type-check && npm run lint && npm run build` — must stay green
5. Smoke `make studio` (optional)
6. Commit schema + migration

## Acceptance

- [ ] `make migrate` runs cleanly on a dev DB
- [ ] `npm run type-check / lint / build` green
- [ ] Generated `@prisma/client` exports `Topic`, `Lesson`, `Question`, `Attempt`, `ExamResult`, `Certificate`, `CertificateKind`
- [ ] `User` has `attempts`, `examResults`, `certificates` back-relations
- [ ] No app-code consumers in this PR

## Out of scope

- `LessonProgress` model (M2)
- Auth.js tables (#9)
- Content seed / importer (separate follow-up)
- API routes / UI (M2/M3)

## Risks

- **`onDelete` choices:** `Cascade` for user-owned rows (Attempt/ExamResult/Certificate), `Cascade` for Topic→Lesson, `Restrict` for Question→Topic to keep historical attempts valid. If wrong, fix in a small follow-up migration.
- **Json shape drift:** TypeScript can't enforce the `{lv, en, ru, ...}` contract. The content importer (separate issue) will validate at write time; runtime reads must use a typed `localize(value, locale)` helper (lands with the importer).
- **Enum migration cost:** Postgres enum changes require ALTER TYPE, which can be slow. Two values are stable, low risk.
