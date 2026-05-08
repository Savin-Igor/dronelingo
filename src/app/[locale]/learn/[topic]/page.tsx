import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  TopicLessonList,
  type LessonListItem,
} from "@/components/learn/TopicLessonList";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic: topicSlug } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { lessons: { orderBy: { ord: "asc" } } },
  });
  if (!topic) notFound();

  const lessons: LessonListItem[] = topic.lessons.map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: localize(lesson.title, locale),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/learn" className="text-sm text-gray-500 hover:text-gray-900">
        ← {t("title")}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-gray-900">
        {localize(topic.title, locale)}
      </h1>
      <p className="mt-2 text-gray-600">{localize(topic.summary, locale)}</p>
      <TopicLessonList topicSlug={topic.slug} lessons={lessons} />
    </main>
  );
}
