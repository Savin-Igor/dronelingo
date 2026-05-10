import { useTranslations } from "next-intl";

// Labels are display-only constants. Full descriptive text comes from translations.
// Source: docs/knowledge/latvia-caa/web-snapshots/02-a1-a3-online-exam.md
const FACTS = [
  { metric: "40", label: "QUESTIONS" },
  { metric: "40", label: "MINUTES" },
  { metric: "≥75%", label: "PASS THRESHOLD" },
  { metric: "FREE", label: "TO STUDY" },
  { metric: "ONLINE", label: "CAA LATVIA" },
  { metric: "5 YRS", label: "EU VALIDITY" },
] as const;

export function ExamFacts() {
  const t = useTranslations("landing.facts");

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-cyan-pulse">
          The exam
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-hud-white">
          {t("heading")}
        </h2>

        <ul className="mt-14 grid grid-cols-2 divide-x divide-y divide-horizon border border-horizon sm:grid-cols-3">
          {FACTS.map((fact) => (
            <li
              key={fact.label}
              className="flex flex-col gap-1 px-6 py-5 transition-colors hover:bg-hull/50"
            >
              <span className="font-mono text-2xl font-semibold text-hud-white sm:text-3xl">
                {fact.metric}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                {fact.label}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center font-mono text-xs text-muted">
          {t("source")}
        </p>
      </div>
    </section>
  );
}
