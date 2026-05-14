"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAccessStatus } from "@/components/access/useAccessStatus";
import { readSRS, type SRSMap } from "@/lib/srs";
import {
  buildOverallMastery,
  buildTopicMastery,
  type MasteryTier,
  type TopicMasteryInput,
  type TopicMasteryStats,
} from "@/lib/srs/aggregate";

export type MasteryMapTopic = TopicMasteryInput & {
  /** Localised title from the server. */
  title: string;
  /** Whether the topic is accessible without payment. */
  free: boolean;
};

// Tactical mastery HUD shown on /practice index above the topic list.
// Reads SRS from localStorage and renders a per-topic mastery row + a
// global header. Renders nothing if the visitor has never practised
// (same quiet pattern as DailyWarmUp) so first-timers see the regular
// topic list without a confusing empty chart.
export function MasteryMap({ topics }: { topics: MasteryMapTopic[] }) {
  const t = useTranslations("masteryMap");
  const [srs, setSrs] = useState<SRSMap | null>(null);

  useEffect(() => {
    setSrs(readSRS());
    if (typeof window === "undefined") return;
    const handler = () => setSrs(readSRS());
    window.addEventListener("dronelingo:srs-changed", handler);
    return () =>
      window.removeEventListener("dronelingo:srs-changed", handler);
  }, []);

  const stats = useMemo<TopicMasteryStats[] | null>(() => {
    if (!srs) return null;
    const now = Date.now();
    return topics.map((tp) => buildTopicMastery(tp, srs, now));
  }, [srs, topics]);

  const overall = useMemo(() => {
    if (!stats) return null;
    return buildOverallMastery(stats);
  }, [stats]);

  // Pre-hydration: render nothing to avoid layout shift / SSR mismatch.
  if (!stats || !overall) return null;
  // Visitor with no SRS state yet — don't render an empty chart.
  if (overall.seenCount === 0) return null;

  const overallPercent = Math.round(overall.masteryRatio * 100);

  return (
    <section
      aria-label={t("ariaLabel")}
      className="mb-8 border border-horizon bg-cockpit"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-horizon px-5 py-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
            ◇ {t("title")}
          </p>
          <p className="mt-1 text-sm text-telemetry">
            {t("subtitle", {
              seen: overall.seenCount,
              total: overall.totalQuestions,
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-semibold text-hud-white">
            {overallPercent}%
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("overallMastery")}
          </p>
        </div>
      </header>

      <ul className="divide-y divide-horizon">
        {stats.map((s) => {
          const topic = topics.find((tp) => tp.slug === s.slug)!;
          return (
            <li key={s.slug}>
              <MasteryRow stats={s} topic={topic} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MasteryRow({
  stats,
  topic,
}: {
  stats: TopicMasteryStats;
  topic: MasteryMapTopic;
}) {
  const t = useTranslations("masteryMap");
  const percent = Math.round(stats.masteryRatio * 100);
  const palette = TIER_PALETTE[stats.tier];
  const hasDue = stats.dueCount > 0;
  const access = useAccessStatus();
  const accessible = topic.free || access === true;
  const href = `/practice/${topic.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-hull/50"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-hud-white">
          {topic.title}
        </span>
        <span className="flex items-center gap-2">
          {!accessible ? (
            <span className="font-mono text-xs text-muted" aria-hidden>
              🔒
            </span>
          ) : null}
          <span
            className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest ${palette.chip}`}
          >
            {t(`tier.${stats.tier}`)}
          </span>
        </span>
      </div>

      {/* Mastery bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-grid"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("ariaProgress", { topic: topic.title, percent })}
      >
        <div
          className={`h-full rounded-full transition-all ${palette.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-mono text-muted">
          {t("rowStats", {
            mastered: stats.masteredCount,
            seen: stats.seenCount,
            total: stats.totalQuestions,
          })}
        </span>
        {!accessible ? (
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {t("locked")}
          </span>
        ) : hasDue ? (
          <span
            className="inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-widest text-amber-300"
            aria-label={t("dueCount", { count: stats.dueCount })}
          >
            <span aria-hidden>◇</span>
            {t("dueCount", { count: stats.dueCount })}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

const TIER_PALETTE: Record<
  MasteryTier,
  { bar: string; chip: string }
> = {
  untouched: {
    bar: "bg-muted/50",
    chip: "border-horizon bg-hull/60 text-muted",
  },
  weak: {
    bar: "bg-red-500/70",
    chip: "border-red-500/50 bg-red-500/10 text-red-300",
  },
  learning: {
    bar: "bg-amber-400/80",
    chip: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  },
  ready: {
    bar: "bg-cyan-pulse/80",
    chip: "border-cyan-pulse/50 bg-cyan-pulse/10 text-cyan-pulse",
  },
  mastered: {
    bar: "bg-green-clear/80",
    chip: "border-green-clear/50 bg-green-clear/10 text-green-clear",
  },
};
