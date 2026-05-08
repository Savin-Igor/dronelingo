import { getTranslations } from "next-intl/server";
import {
  LearnTopicsList,
  type TopicListItem,
} from "@/components/learn/LearnTopicsList";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      <h1 className="text-3xl font-semibold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("subtitle")}</p>
      <LearnTopicsList topics={items} />
    </main>
  );
}
