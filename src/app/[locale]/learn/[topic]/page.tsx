import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AccessGate } from "@/components/access/AccessGate";
import { BreadcrumbSchema } from "@/components/learn/Breadcrumb";
import {
  TopicLessonList,
  type LessonListItem,
} from "@/components/learn/TopicLessonList";
import { TopicSchema } from "@/components/learn/TopicSchema";
import { isFreeTopic } from "@/lib/access";
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
  const tExam = await getTranslations({ locale, namespace: "exam" });

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: {
      lessons: { orderBy: { ord: "asc" } },
      _count: { select: { questions: true } },
    },
  });
  if (!topic) notFound();

  const free = isFreeTopic(topicSlug);

  const lessons: LessonListItem[] = topic.lessons.map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: localize(lesson.title, locale),
  }));
  const firstLesson = topic.lessons[0];

  const content = (
    <>
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
        {t("topicKicker")}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {localize(topic.title, locale)}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-telemetry">
        {localize(topic.summary, locale)}
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-horizon bg-cockpit p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("topicStats.lessons")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-hud-white">
            {topic.lessons.length}
          </p>
        </div>
        <div className="rounded-sm border border-horizon bg-cockpit p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("topicStats.questions")}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-hud-white">
            {topic._count.questions}
          </p>
        </div>
        <div className="rounded-sm border border-horizon bg-cockpit p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("topicStats.access")}
          </p>
          <p className="mt-2 text-sm font-medium text-hud-white">
            {free ? t("topicStats.free") : t("topicStats.fullAccess")}
          </p>
        </div>
      </section>

      {firstLesson ? (
        <section className="mt-6 flex flex-col gap-4 rounded-sm border border-horizon bg-cockpit p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
              ◇ {t("topicActions.kicker")}
            </p>
            <p className="mt-1 text-sm text-telemetry">{t("topicActions.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/learn/${topic.slug}/${firstLesson.slug}`}
              className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
            >
              {t("topicActions.startLesson")} →
            </Link>
            {topic._count.questions > 0 ? (
              <Link
                href={`/exam/${topic.slug}`}
                className="inline-flex items-center justify-center rounded-sm border border-horizon bg-hull/50 px-5 py-2.5 text-sm font-medium text-telemetry transition-colors hover:border-signal hover:text-hud-white"
              >
                {tExam("coverage.drillCta", {
                  topic: localize(topic.title, locale),
                })}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

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
    </>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {free ? content : <AccessGate>{content}</AccessGate>}
    </main>
  );
}
