"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { readClaim } from "@/lib/anonymous-claim";
import { readExamHistory } from "@/lib/anonymous-exam";
import { readProgress } from "@/lib/anonymous-progress";
import {
  computeRank,
  type CriterionId,
  type RankId,
  type RankSnapshot,
} from "@/lib/rank";
import { readSRS } from "@/lib/srs";
import { buildTopicMastery } from "@/lib/srs/aggregate";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type RankBadgeTopic = {
  slug: string;
  /** Externalid prefix, e.g. "as" → "as-001". Used to partition SRS. */
  prefix: string;
  totalQuestions: number;
};

/**
 * Rank progression HUD shown on /learn (and reusable elsewhere).
 *
 * Reads every relevant localStorage source, computes the rank, and
 * renders a compact tactical card with the rank name + a progress bar
 * + the criteria for the next tier. Self-contained: no props beyond
 * the topic shape used to derive per-topic mastery.
 *
 * Hydration-safe: renders nothing until the client read completes, so
 * SSR markup never disagrees with the post-mount state.
 */
export function RankBadge({ topics }: { topics: RankBadgeTopic[] }) {
  const t = useTranslations("rank");
  const [snapshot, setSnapshot] = useState<RankSnapshot | null>(null);

  useEffect(() => {
    function refresh() {
      const now = Date.now();
      const lessonsVisitedCount = Object.keys(readProgress()).length;
      const examHistory = readExamHistory();
      const recentMockScores = examHistory
        .filter((e) => now - e.takenAt <= ONE_WEEK_MS)
        .map((e) => (e.total === 0 ? 0 : Math.round((e.correct / e.total) * 100)));
      const srs = readSRS();
      const topicMastery = topics.map((tp) =>
        buildTopicMastery(
          { slug: tp.slug, prefix: tp.prefix, totalQuestions: tp.totalQuestions },
          srs,
          now,
        ).masteryRatio,
      );
      const claim = readClaim();
      setSnapshot(
        computeRank({
          lessonsVisitedCount,
          recentMockScores,
          topicMastery,
          hasCertificate: claim !== null,
          totalTopics: topics.length,
        }),
      );
    }

    refresh();
    const events = [
      "dronelingo:progress-changed",
      "dronelingo:exam-history-changed",
      "dronelingo:srs-changed",
      "dronelingo:claim-changed",
    ];
    for (const ev of events) window.addEventListener(ev, refresh);
    return () => {
      for (const ev of events) window.removeEventListener(ev, refresh);
    };
  }, [topics]);

  // Pre-hydration: render nothing (no SSR mismatch + no flash for new
  // visitors who would otherwise see "Rank: Recruit" before any data).
  if (!snapshot) return null;

  const rankPalette = RANK_PALETTE[snapshot.current];
  const percent = Math.round(snapshot.progressToNext * 100);

  return (
    <section
      aria-label={t("ariaLabel")}
      className={`my-6 overflow-hidden rounded-sm border bg-cockpit ${rankPalette.border}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-horizon px-5 py-3">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
          ◇ {t("kicker")}
        </p>
        <p className={`font-mono text-xs uppercase tracking-widest ${rankPalette.chip}`}>
          {t(`tiers.${snapshot.current}.name`)}
        </p>
      </header>

      <div className="px-5 py-4">
        {snapshot.next ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-telemetry">
                {t("nextLabel")}{" "}
                <span className="font-medium text-hud-white">
                  {t(`tiers.${snapshot.next}.name`)}
                </span>
              </p>
              <span className="font-mono text-xs text-muted">{percent}%</span>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-grid">
              <div
                className={`h-full rounded-full transition-all ${rankPalette.bar}`}
                style={{ width: `${percent}%` }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              />
            </div>

            <ul className="mt-4 space-y-1.5 text-xs">
              {snapshot.criteria.map((c) => (
                <li key={c.id} className="flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className={`shrink-0 font-mono ${c.met ? "text-green-clear" : "text-muted"}`}
                  >
                    {c.met ? "✓" : "·"}
                  </span>
                  <span className={c.met ? "text-telemetry" : "text-hud-white"}>
                    {t(`criteria.${c.id}.label`, {
                      current: c.current,
                      target: c.target,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-telemetry">
            {t("certifiedHint")}
          </p>
        )}
      </div>
    </section>
  );
}

const RANK_PALETTE: Record<
  RankId,
  { border: string; chip: string; bar: string }
> = {
  recruit: {
    border: "border-horizon",
    chip: "text-muted",
    bar: "bg-muted/60",
  },
  cadet: {
    border: "border-amber-400/40",
    chip: "text-amber-300",
    bar: "bg-amber-400/70",
  },
  pilotReady: {
    border: "border-cyan-pulse/50",
    chip: "text-cyan-pulse",
    bar: "bg-cyan-pulse/80",
  },
  certified: {
    border: "border-green-clear/50",
    chip: "text-green-clear",
    bar: "bg-green-clear/80",
  },
};

// Help future contributors: every CriterionId must have an i18n label.
// Surface a compile-time check so adding a criterion fails fast if the
// translation is missing in en/lv/ru.
const _CRITERION_KEYS_EXIST: Record<CriterionId, true> = {
  lessonsVisited: true,
  recentMockPasses: true,
  topicsAt70: true,
  hasCertificate: true,
};
void _CRITERION_KEYS_EXIST;
