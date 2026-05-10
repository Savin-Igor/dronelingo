import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ExamHistorySection } from "@/components/exam/ExamHistorySection";
import {
  EXAM_DURATION_MIN,
  EXAM_PASS_THRESHOLD,
  EXAM_TOTAL_QUESTIONS,
} from "@/lib/exam";
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Certification flight
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-telemetry">{t("subtitle")}</p>

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
            { label: "QUESTIONS", value: EXAM_TOTAL_QUESTIONS },
            { label: "MINUTES", value: EXAM_DURATION_MIN },
            { label: "THRESHOLD", value: `${EXAM_PASS_THRESHOLD}%` },
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

      <ExamHistorySection />
    </main>
  );
}
