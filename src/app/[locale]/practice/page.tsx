import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  MasteryMap,
  type MasteryMapTopic,
} from "@/components/practice/MasteryMap";
import {
  PracticeTopicsList,
  type PracticeTopicListItem,
} from "@/components/practice/PracticeTopicsList";
import { FREE_TOPIC_SLUG } from "@/lib/access";
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
  const t = await getTranslations({ locale, namespace: "practice" });
  return buildMetadata({
    locale,
    path: "/practice",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function PracticeIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "practice" });

  const topics = await prisma.topic.findMany({
    orderBy: { ord: "asc" },
    include: {
      _count: { select: { questions: true } },
      // One question per topic just to extract the externalId prefix
      // (e.g. "as" from "as-001"). The MasteryMap needs the prefix to
      // partition the visitor's SRS state by topic.
      questions: {
        orderBy: { externalId: "asc" },
        take: 1,
        select: { externalId: true },
      },
    },
  });

  const masteryTopics: MasteryMapTopic[] = topics
    .filter((tp) => tp._count.questions > 0)
    .map((tp) => {
      const firstId = tp.questions[0]?.externalId ?? "";
      const prefix = firstId.includes("-") ? firstId.split("-")[0] : tp.slug;
      return {
        slug: tp.slug,
        title: localize(tp.title, locale),
        prefix,
        totalQuestions: tp._count.questions,
        free: tp.slug === FREE_TOPIC_SLUG,
      };
    });

  const practiceTopics: PracticeTopicListItem[] = topics.map((topic) => ({
    id: topic.id,
    slug: topic.slug,
    title: localize(topic.title, locale),
    questionCount: topic._count.questions,
    free: topic.slug === FREE_TOPIC_SLUG,
    disabled: topic._count.questions === 0,
  }));
  const availableTopics = practiceTopics.filter((topic) => !topic.disabled).length;
  const totalQuestions = practiceTopics.reduce(
    (sum, topic) => sum + topic.questionCount,
    0,
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Drills
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      <div className="mt-8">
        <MasteryMap topics={masteryTopics} />
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-horizon bg-cockpit p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("overview.topicsLabel")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-hud-white">
            {availableTopics}
          </p>
        </div>
        <div className="rounded-sm border border-horizon bg-cockpit p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("overview.totalQuestionsLabel")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-hud-white">
            {totalQuestions}
          </p>
        </div>
        <div className="rounded-sm border border-horizon bg-cockpit p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("overview.mockExamLabel")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-hud-white">
            40
          </p>
        </div>
      </section>

      <PracticeTopicsList topics={practiceTopics} />
    </main>
  );
}
