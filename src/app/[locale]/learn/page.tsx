import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  LearnTopicsList,
  type TopicListItem,
} from "@/components/learn/LearnTopicsList";
import {
  RankBadge,
  type RankBadgeTopic,
} from "@/components/learn/RankBadge";
import { A1A3_STRATIFICATION } from "@/lib/exam";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });
  return buildMetadata({
    locale,
    path: "/learn",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function LearnIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });
  const topics = await prisma.topic.findMany({
    orderBy: { ord: "asc" },
    include: {
      lessons: { select: { id: true } },
      // Single question per topic just to extract the externalId prefix
      // (e.g. "as" from "as-001") — the RankBadge needs the prefix to
      // partition SRS by topic.
      questions: {
        orderBy: { externalId: "asc" },
        take: 1,
        select: { externalId: true },
      },
      _count: { select: { questions: true } },
    },
  });

  const items: TopicListItem[] = topics.map((topic) => ({
    slug: topic.slug,
    title: localize(topic.title, locale),
    summary: localize(topic.summary, locale),
    lessonIds: topic.lessons.map((l) => l.id),
  }));

  // Restrict the rank's topic-mastery gate to A1/A3 scope — meteorology
  // (A2 track) is not part of A1/A3 readiness yet.
  const a1a3Slugs = new Set(Object.keys(A1A3_STRATIFICATION));
  const rankTopics: RankBadgeTopic[] = topics
    .filter((tp) => a1a3Slugs.has(tp.slug) && tp._count.questions > 0)
    .map((tp) => {
      const firstId = tp.questions[0]?.externalId ?? "";
      const prefix = firstId.includes("-") ? firstId.split("-")[0] : tp.slug;
      return {
        slug: tp.slug,
        prefix,
        totalQuestions: tp._count.questions,
      };
    });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Flight plan
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      <RankBadge topics={rankTopics} />

      <LearnTopicsList topics={items} />
    </main>
  );
}
