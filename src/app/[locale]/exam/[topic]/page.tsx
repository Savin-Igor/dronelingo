import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  A1A3_STRATIFICATION,
  EXAM_PASS_THRESHOLD,
  TOPIC_EXAM_MAX_QUESTIONS,
  TOPIC_EXAM_SEC_PER_QUESTION,
} from "@/lib/exam";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}): Promise<Metadata> {
  const { locale, topic: topicSlug } = await params;
  if (!(topicSlug in A1A3_STRATIFICATION)) {
    return buildMetadata({
      locale,
      path: `/exam/${topicSlug}`,
      title: "—",
      description: "",
    });
  }
  const t = await getTranslations({ locale, namespace: "topicExam" });
  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    select: { title: true },
  });
  const topicTitle = topic ? localize(topic.title, locale) : topicSlug;
  return buildMetadata({
    locale,
    path: `/exam/${topicSlug}`,
    title: `${topicTitle} · ${t("title")} — dronelingo`,
    description: t("subtitle", { topic: topicTitle }),
  });
}

export default async function TopicExamIntro({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic: topicSlug } = await params;
  // Topic slugs are restricted to A1/A3 — meteorology and future tracks
  // get their own routes when those ship.
  if (!(topicSlug in A1A3_STRATIFICATION)) notFound();

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { _count: { select: { questions: true } } },
  });
  if (!topic || topic._count.questions === 0) notFound();

  const t = await getTranslations({ locale, namespace: "topicExam" });
  const topicTitle = localize(topic.title, locale);
  const questionCount = Math.min(
    TOPIC_EXAM_MAX_QUESTIONS,
    topic._count.questions,
  );
  const durationMin = Math.max(
    1,
    Math.round((questionCount * TOPIC_EXAM_SEC_PER_QUESTION) / 60),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/exam"
        className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
      >
        ← {t("backToExam")}
      </Link>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        ◇ {t("kicker")}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {topicTitle}
      </h1>
      <p className="mt-2 text-sm text-telemetry">
        {t("subtitle", { topic: topicTitle })}
      </p>

      <section className="mt-6 rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("rules.heading")}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-telemetry">
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.questions", { count: questionCount })}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.duration", { minutes: durationMin })}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.threshold", { threshold: EXAM_PASS_THRESHOLD })}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.notFullMock")}
          </li>
        </ul>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: t("stats.questions"), value: questionCount },
            { label: t("stats.minutes"), value: durationMin },
            { label: t("stats.threshold"), value: `${EXAM_PASS_THRESHOLD}%` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-sm border border-horizon bg-hull py-4"
            >
              <span className="font-mono text-2xl font-semibold text-hud-white">
                {value}
              </span>
              <span className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
                {label}
              </span>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/exam/${topicSlug}/session`}
            className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
          >
            {t("start")} →
          </Link>
        </div>
      </section>
    </main>
  );
}
