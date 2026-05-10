import { Fragment } from "react";
import { useTranslations } from "next-intl";

const PHASES = [
  { key: "learn", number: "01", metric: "9 sectors" },
  { key: "practice", number: "02", metric: "45+ drills" },
  { key: "pass", number: "03", metric: "40 Q · 75%" },
] as const;

function ArrowRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 10h12M10 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section id="how-it-works" className="tactical-grid px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-cyan-pulse">
          The process
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-hud-white">
          {t("heading")}
        </h2>

        <ol className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-0">
          {PHASES.map((phase, i) => (
            <Fragment key={phase.key}>
              <li className="flex flex-1 flex-col">
                <span className="font-mono text-xs font-semibold tracking-widest text-cyan-pulse">
                  PHASE {phase.number}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-hud-white">
                  {t(`${phase.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-telemetry">
                  {t(`${phase.key}.body`)}
                </p>
                <p className="mt-4 font-mono text-xs text-muted">
                  {phase.metric}
                </p>
              </li>

              {i < PHASES.length - 1 && (
                <div
                  className="hidden items-center justify-center self-start px-6 pt-8 text-horizon sm:flex"
                  aria-hidden
                >
                  <ArrowRight />
                </div>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  );
}
