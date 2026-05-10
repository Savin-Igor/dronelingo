import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  LearnTopicsList,
  type TopicListItem,
} from "@/components/learn/LearnTopicsList";
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
    include: { lessons: { select: { id: true } } },
  });

  const items: TopicListItem[] = topics.map((topic) => ({
    slug: topic.slug,
    title: localize(topic.title, locale),
    summary: localize(topic.summary, locale),
    lessonIds: topic.lessons.map((l) => l.id),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Flight plan
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>
      <LearnTopicsList topics={items} />
    </main>
  );
}
