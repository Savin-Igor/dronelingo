import { useTranslations } from "next-intl";

// Cited facts. Source for all: docs/knowledge/latvia-caa/web-snapshots/02-a1-a3-online-exam.md
// (CAA Latvia, droni.caa.gov.lv, captured 2026-05-08).
const FACTS = [
  "questions",
  "duration",
  "threshold",
  "cost",
  "location",
  "validity",
] as const;

export function ExamFacts() {
  const t = useTranslations("landing.facts");

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold text-gray-900">
          {t("heading")}
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((fact) => (
            <li
              key={fact}
              className="rounded-md border border-gray-200 px-5 py-4 text-gray-700"
            >
              {t(fact)}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-gray-500">{t("source")}</p>
      </div>
    </section>
  );
}
