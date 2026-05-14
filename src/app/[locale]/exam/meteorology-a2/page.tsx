import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import {
  METEO_A2_DURATION_MIN,
  METEO_A2_PASS_THRESHOLD,
  METEO_A2_TOPIC_SLUG,
  METEO_A2_TOTAL_QUESTIONS,
} from "@/lib/exam";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meteorologyA2Exam" });
  return buildMetadata({
    locale,
    path: "/exam/meteorology-a2",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function MeteorologyA2ExamIntro({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const topic = await prisma.topic.findUnique({
    where: { slug: METEO_A2_TOPIC_SLUG },
    include: { _count: { select: { questions: true } } },
  });
  if (!topic || topic._count.questions === 0) notFound();

  const t = await getTranslations({ locale, namespace: "meteorologyA2Exam" });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/exam"
        className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
      >
        ← {t("backToExam")}
      </Link>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-amber-alert">
        ◇ {t("kicker")}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      <section className="mt-6 rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("rules.heading")}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-telemetry">
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.questions", { count: METEO_A2_TOTAL_QUESTIONS })}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.duration", { minutes: METEO_A2_DURATION_MIN })}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.threshold", { threshold: METEO_A2_PASS_THRESHOLD })}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.imageHint")}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.bonusNotice")}
          </li>
        </ul>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: t("stats.questions"), value: METEO_A2_TOTAL_QUESTIONS },
            { label: t("stats.minutes"), value: METEO_A2_DURATION_MIN },
            {
              label: t("stats.threshold"),
              value: `${METEO_A2_PASS_THRESHOLD}%`,
            },
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
            href="/exam/meteorology-a2/session"
            className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
          >
            {t("start")} →
          </Link>
        </div>
      </section>
    </main>
  );
}
