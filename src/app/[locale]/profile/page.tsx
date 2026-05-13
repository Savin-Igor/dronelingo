import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/auth/ProfileView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile — dronelingo",
  robots: { index: false },
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/sign-in`);

  const userId = session.user.id;

  const [examResults, attempts, user] = await Promise.all([
    prisma.examResult.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      take: 20,
    }),
    prisma.attempt.findMany({
      where: { userId },
      include: { question: { select: { topicId: true, topic: { select: { slug: true, title: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, createdAt: true },
    }),
  ]);

  // Per-topic accuracy from attempts
  const topicStats: Record<string, { correct: number; total: number; title: string }> = {};
  for (const a of attempts) {
    const slug = a.question.topic.slug;
    const title = (a.question.topic.title as Record<string, string>)[locale] ??
      (a.question.topic.title as Record<string, string>).en ?? slug;
    if (!topicStats[slug]) topicStats[slug] = { correct: 0, total: 0, title };
    topicStats[slug].total++;
    if (a.isCorrect) topicStats[slug].correct++;
  }

  const t = await getTranslations("profile");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
      <ProfileView
        examResults={examResults.map((r) => ({
          id: r.id,
          takenAt: r.takenAt.toISOString(),
          score: r.score,
          total: r.total,
          passed: r.passed,
          durationSec: r.durationSec,
        }))}
        topicStats={Object.entries(topicStats).map(([slug, s]) => ({
          slug,
          title: s.title,
          correct: s.correct,
          total: s.total,
        }))}
        totalAttempts={attempts.length}
        memberSince={user?.createdAt?.toISOString() ?? ""}
      />
    </main>
  );
}
