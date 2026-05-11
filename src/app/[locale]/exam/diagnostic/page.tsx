import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { DiagnosticSession } from "@/components/exam/DiagnosticSession";
import {
  buildDiagnostic,
  DIAGNOSTIC_TOTAL_QUESTIONS,
} from "@/lib/diagnostic";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "diagnostic" });
  return buildMetadata({
    locale,
    path: "/exam/diagnostic",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "diagnostic" });

  const questions = await buildDiagnostic(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/exam"
        className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
      >
        ← {t("backToExam")}
      </Link>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-amber-300">
        ◇ {t("kicker")}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      <ul className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: t("stats.questions"), value: DIAGNOSTIC_TOTAL_QUESTIONS },
          { label: t("stats.noTimer"), value: "—" },
          { label: t("stats.feedback"), value: "✓" },
        ].map((row) => (
          <li
            key={row.label}
            className="flex flex-col items-center rounded-sm border border-horizon bg-hull py-3"
          >
            <span className="font-mono text-xl font-semibold text-hud-white">
              {row.value}
            </span>
            <span className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-muted">
              {row.label}
            </span>
          </li>
        ))}
      </ul>

      <DiagnosticSession questions={questions} />
    </main>
  );
}
