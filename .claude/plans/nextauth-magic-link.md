## Goal
Wire NextAuth v5 (Auth.js beta) magic-link auth with Prisma adapter + Resend SMTP.
Add /sign-in, /profile (stats, history, rank), /api/sync (localStorage → DB).

## Context
- next-auth@5.0.0-beta.31 + @auth/prisma-adapter@2.11.2 already installed
- Prisma has User, Attempt, ExamResult, Certificate — no Auth.js tables yet
- middleware.ts is next-intl only — needs auth chained
- All user state is in localStorage (progress, attempts, exam history, claim)
- EMAIL_SERVER_* env vars already in .env — Mailhog local, Resend prod
- RESEND_API_KEY GitHub secret is a placeholder — user needs to update

## Steps
1. Prisma: add Account, Session, VerificationToken to schema.prisma
2. make migrate → commit migration files
3. src/auth.ts — NextAuth({ PrismaAdapter, Email provider })
4. src/app/api/auth/[...nextauth]/route.ts — export { GET, POST } = handlers
5. src/middleware.ts — chain auth.middleware + createMiddleware(routing)
6. src/app/[locale]/sign-in/page.tsx — email form, redirect if already signed in
7. src/app/api/sync/route.ts — POST: receive localStorage payload, upsert to DB
8. src/app/[locale]/profile/page.tsx — rank badge, mastery map, exam history, lessons visited
9. Header — add Sign In / profile link
10. env.ts — restore NEXTAUTH_SECRET min(32)
11. make check + npm test → commit → deploy

## Risks
- NextAuth v5 beta API differs from v4 — use beta docs
- Middleware chaining: next-intl must run on all routes, auth only on protected ones
- First sign-in sync: client fires POST /api/sync after session established, then clears localStorage
- Resend not verified in prod until user updates RESEND_API_KEY secret
