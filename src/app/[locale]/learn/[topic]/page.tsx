import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BreadcrumbSchema } from "@/components/learn/Breadcrumb";
import {
  TopicLessonList,
  type LessonListItem,
} from "@/components/learn/TopicLessonList";
import { TopicSchema } from "@/components/learn/TopicSchema";
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
  const tPractice = await getTranslations({ locale, namespace: "practice" });

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: {
      lessons: { orderBy: { ord: "asc" } },
      _count: { select: { questions: true } },
    },
  });
  if (!topic) notFound();

  const lessons: LessonListItem[] = topic.lessons.map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: localize(lesson.title, locale),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <TopicSchema
        locale={locale}
        slug={topic.slug}
        title={localize(topic.title, locale)}
        description={localize(topic.summary, locale)}
        lessons={lessons.map((l) => ({ slug: l.slug, title: l.title }))}
      />
      <BreadcrumbSchema
        locale={locale}
        crumbs={[
          { name: t("title"), path: "/learn" },
          { name: localize(topic.title, locale), path: `/learn/${topic.slug}` },
        ]}
      />

      <Link
        href="/learn"
        className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
      >
        ← {t("title")}
      </Link>

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Sector
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {localize(topic.title, locale)}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-telemetry">
        {localize(topic.summary, locale)}
      </p>

      <TopicLessonList topicSlug={topic.slug} lessons={lessons} />

      {topic._count.questions > 0 && (
        <div className="mt-10 flex justify-center">
          <Link
            href={`/practice/${topic.slug}`}
            className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
          >
            {tPractice("ctaFromTopic")} →
          </Link>
        </div>
      )}
    </main>
  );
}
