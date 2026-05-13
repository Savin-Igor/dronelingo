import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AttemptSchema = z.object({
  questionId: z.string(),   // externalId e.g. "as-001"
  isCorrect: z.boolean(),
  ts: z.number(),
});

const PerTopicSchema = z.record(
  z.string(),
  z.object({
    topicSlug: z.string(),
    topicTitle: z.string(),
    correct: z.number(),
    total: z.number(),
  }),
);

const ExamResultSchema = z.object({
  id: z.string(),
  takenAt: z.number(),
  durationSec: z.number(),
  total: z.number(),
  correct: z.number(),
  passed: z.boolean(),
  perTopic: PerTopicSchema,
});

const SyncPayload = z.object({
  attempts: z.array(AttemptSchema).default([]),
  examHistory: z.array(ExamResultSchema).default([]),
  lessonProgress: z.record(z.string(), z.number()).default({}),
});

/**
 * One-shot sync: client calls this once after first sign-in with
 * everything from localStorage. Idempotent — safe to call multiple times.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const parsed = SyncPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { attempts, examHistory, lessonProgress } = parsed.data;

  // Sync attempts — look up Question by externalId, skip unknown ones
  let attemptsSynced = 0;
  if (attempts.length > 0) {
    const externalIds = [...new Set(attempts.map((a) => a.questionId))];
    const questions = await prisma.question.findMany({
      where: { externalId: { in: externalIds } },
      select: { id: true, externalId: true },
    });
    const idMap = new Map(questions.map((q) => [q.externalId, q.id]));

    for (const a of attempts) {
      const questionId = idMap.get(a.questionId);
      if (!questionId) continue;
      // Upsert: skip if already exists with same user+question+ts
      const existing = await prisma.attempt.findFirst({
        where: { userId, questionId, createdAt: new Date(a.ts) },
      });
      if (!existing) {
        await prisma.attempt.create({
          data: {
            userId,
            questionId,
            selectedOptionId: a.isCorrect ? "correct" : "wrong",
            isCorrect: a.isCorrect,
            createdAt: new Date(a.ts),
          },
        });
        attemptsSynced++;
      }
    }
  }

  // Sync exam results
  let examsSynced = 0;
  for (const e of examHistory) {
    const existing = await prisma.examResult.findFirst({
      where: { userId, takenAt: new Date(e.takenAt) },
    });
    if (!existing) {
      await prisma.examResult.create({
        data: {
          userId,
          score: e.correct,
          total: e.total,
          passed: e.passed,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          perTopic: e.perTopic as any,
          durationSec: e.durationSec,
          takenAt: new Date(e.takenAt),
        },
      });
      examsSynced++;
    }
  }

  // Update user locale from lesson progress (best-effort)
  const lessonsVisited = Object.keys(lessonProgress).length;

  return NextResponse.json({
    ok: true,
    synced: { attempts: attemptsSynced, exams: examsSynced, lessonsVisited },
  });
}
