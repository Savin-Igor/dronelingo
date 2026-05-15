import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DiagnosticCta } from "@/components/exam/DiagnosticCta";
import { ExamHistorySection } from "@/components/exam/ExamHistorySection";
import {
  A1A3_STRATIFICATION,
  EXAM_DURATION_MIN,
  EXAM_PASS_THRESHOLD,
  EXAM_TOTAL_QUESTIONS,
} from "@/lib/exam";
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
  const t = await getTranslations({ locale, namespace: "exam" });
  return buildMetadata({
    locale,
    path: "/exam",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function ExamStart({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "exam" });

  // Resolve localised topic titles for the question-distribution breakdown.
  const targetSlugs = Object.keys(A1A3_STRATIFICATION);
  const topics = await prisma.topic.findMany({
    where: { slug: { in: targetSlugs } },
    orderBy: { ord: "asc" },
    select: { slug: true, title: true },
  });
  const coverage = topics
    .map((tp) => ({
      slug: tp.slug,
      title: localize(tp.title, locale),
      count: A1A3_STRATIFICATION[tp.slug] ?? 0,
    }))
    .filter((row) => row.count > 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        {t("kicker")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-telemetry">{t("subtitle")}</p>

      <DiagnosticCta />

      <section className="mt-6 rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("rules.heading")}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-telemetry">
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.questions")}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.duration")}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.threshold")}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.navigation")}
          </li>
          <li className="flex gap-2">
            <span className="text-muted">·</span>
            {t("rules.anonymous")}
          </li>
        </ul>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: t("stats.questions"), value: EXAM_TOTAL_QUESTIONS },
            { label: t("stats.minutes"), value: EXAM_DURATION_MIN },
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
            href="/exam/session"
            className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
          >
            {t("start")} →
          </Link>
        </div>
      </section>

      <section
        aria-label={t("coverage.heading")}
        className="mt-6 rounded-sm border border-horizon bg-cockpit p-6"
      >
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("coverage.heading")}
        </h2>
        <p className="mt-2 text-xs text-muted">{t("coverage.subtitle")}</p>
        <p className="mt-1 text-xs text-telemetry">{t("coverage.drillHint")}</p>

        <ul className="mt-5 divide-y divide-horizon border-y border-horizon">
          {coverage.map((row) => {
            const percent = (row.count / EXAM_TOTAL_QUESTIONS) * 100;
            return (
              <li key={row.slug}>
                <Link
                  href={`/exam/${row.slug}`}
                  className="group grid grid-cols-[1fr_3rem_3rem_1.25rem] items-center gap-3 py-2.5 transition-colors hover:bg-hull/50"
                  aria-label={t("coverage.drillCta", {
                    topic: row.title,
                  })}
                >
                  <span className="text-sm text-hud-white">{row.title}</span>
                  <div
                    className="relative h-1 overflow-hidden rounded-full bg-grid"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-cyan-pulse/70"
                      style={{ width: `${percent}%` }}
                      aria-hidden
                    />
                  </div>
                  <span className="text-right font-mono text-sm text-hud-white">
                    {row.count}
                  </span>
                  <span
                    aria-hidden
                    className="text-right font-mono text-xs text-muted transition-colors group-hover:text-cyan-pulse"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
          <span>{t("coverage.totalLabel")}</span>
          <span className="text-hud-white">
            {EXAM_TOTAL_QUESTIONS} {t("coverage.questionsLabel")}
          </span>
        </div>
      </section>

      <section
        aria-label={t("bonus.heading")}
        className="mt-6 rounded-sm border border-amber-alert/30 bg-cockpit p-6"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-amber-alert">
          ◇ {t("bonus.kicker")}
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-hud-white">
          {t("bonus.heading")}
        </h2>
        <p className="mt-2 text-sm text-telemetry">{t("bonus.subtitle")}</p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">{t("bonus.hint")}</p>
          <Link
            href="/exam/meteorology-a2"
            className="inline-flex shrink-0 items-center justify-center rounded-sm border border-amber-alert/60 bg-amber-alert/10 px-4 py-2 text-sm font-medium text-amber-alert transition-colors hover:bg-amber-alert hover:text-void"
          >
            {t("bonus.cta")} →
          </Link>
        </div>
      </section>

      <ExamHistorySection />
    </main>
  );
}
