"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccessStatus } from "@/components/access/useAccessStatus";

export type PracticeTopicListItem = {
  id: string;
  slug: string;
  title: string;
  questionCount: number;
  free: boolean;
  disabled: boolean;
};

export function PracticeTopicsList({
  topics,
}: {
  topics: PracticeTopicListItem[];
}) {
  const t = useTranslations("practice");
  const access = useAccessStatus();
  const hasPaidAccess = access === true;

  return (
    <>
      <ul className="divide-y divide-horizon rounded-sm border border-horizon">
        {topics.map((topic, index) => {
          const accessible = topic.free || hasPaidAccess;

          if (topic.disabled) {
            return (
              <li key={topic.id}>
                <div className="flex items-center justify-between p-5 opacity-30">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-hud-white">
                        {topic.title}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        {t("noQuestions")}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          }

          return (
            <li key={topic.id}>
              <Link
                href={`/practice/${topic.slug}`}
                className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-hull/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-hud-white">
                      {topic.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {accessible
                        ? t("questionCount", { count: topic.questionCount })
                        : t("lockedHint", { count: topic.questionCount })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {topic.free ? (
                    <span className="rounded-sm border border-green-clear/30 bg-green-clear/10 px-1.5 py-0.5 font-mono text-xs text-green-clear">
                      FREE
                    </span>
                  ) : accessible ? (
                    <span className="rounded-sm border border-cyan-pulse/30 bg-cyan-pulse/10 px-1.5 py-0.5 font-mono text-xs text-cyan-pulse">
                      {t("includedBadge")}
                    </span>
                  ) : (
                    <span className="rounded-sm border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-xs text-amber-300">
                      {t("lockedBadge")}
                    </span>
                  )}
                  <span className="font-mono text-xs text-muted transition-colors group-hover:text-cyan-pulse">
                    →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mt-6 rounded-sm border border-horizon bg-cockpit p-5">
        {hasPaidAccess ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
                ◇ {t("nextStep.kicker")}
              </p>
              <p className="mt-1 text-sm text-telemetry">{t("nextStep.body")}</p>
            </div>
            <Link
              href="/exam"
              className="inline-flex shrink-0 items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
            >
              {t("nextStep.cta")} →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-300">
                ◇ {t("upgrade.kicker")}
              </p>
              <p className="mt-1 text-sm text-telemetry">{t("upgrade.body")}</p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex shrink-0 items-center justify-center rounded-sm border border-amber-400/60 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-400 hover:text-void"
            >
              {t("upgrade.cta")} →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
