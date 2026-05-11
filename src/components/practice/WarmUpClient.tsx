"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  Trainer,
  type TrainerQuestion,
  type WeightFn,
} from "@/components/practice/Trainer";
import { FREE_TOPIC_SLUG, hasAccess } from "@/lib/access";
import { readSRS, type SRSMap } from "@/lib/srs";
import { buildTopicMastery } from "@/lib/srs/aggregate";

/**
 * Daily warm-up client wrapper.
 *
 * Server hands us the full question pool annotated with the topic slug.
 * We filter to the user's accessible scope (client-side because access
 * state lives in localStorage until NextAuth #3 lands):
 *   - Has paid access → all questions.
 *   - No paid access → free topic only.
 *
 * Then we render the Trainer in dueOnly mode with an adaptive weight
 * function: each question's weight is the current topic's mastery ratio
 * (0..1). Lower mastery = weaker topic = front of the due queue. That
 * makes the daily warm-up automatically prioritise the topics the user
 * needs most, instead of just oldest-overdue first.
 *
 * Hydration guard: render a small skeleton while we read localStorage so
 * the UI doesn't flash from paywall → free → full.
 */
export function WarmUpClient({
  pool,
}: {
  pool: (TrainerQuestion & { topicSlug: string })[];
}) {
  const t = useTranslations("warmUp");
  const [access, setAccess] = useState<boolean | null>(null);
  const [srs, setSrs] = useState<SRSMap | null>(null);

  useEffect(() => {
    setAccess(hasAccess());
    setSrs(readSRS());
    function refreshAccess() {
      setAccess(hasAccess());
    }
    function refreshSrs() {
      setSrs(readSRS());
    }
    window.addEventListener("dronelingo:access-changed", refreshAccess);
    window.addEventListener("dronelingo:srs-changed", refreshSrs);
    return () => {
      window.removeEventListener("dronelingo:access-changed", refreshAccess);
      window.removeEventListener("dronelingo:srs-changed", refreshSrs);
    };
  }, []);

  // Accessible scope of the pool — filtered by paid/free.
  const accessible = useMemo(() => {
    if (access === null) return [];
    return access ? pool : pool.filter((q) => q.topicSlug === FREE_TOPIC_SLUG);
  }, [access, pool]);

  // Adaptive weight function: per-question mastery ratio derived from SRS.
  // Topics with no SRS history yet weight at 0 (lowest) — they surface first
  // so the user actually starts seeing them.
  const weightOf = useMemo<WeightFn | undefined>(() => {
    if (!srs || accessible.length === 0) return undefined;

    // Group accessible questions by externalId prefix (e.g. "as-001" → "as").
    const prefixCounts = new Map<string, number>();
    for (const q of accessible) {
      const prefix = q.externalId.includes("-")
        ? q.externalId.split("-")[0]
        : q.topicSlug;
      prefixCounts.set(prefix, (prefixCounts.get(prefix) ?? 0) + 1);
    }

    const now = Date.now();
    const masteryByPrefix = new Map<string, number>();
    for (const [prefix, total] of prefixCounts.entries()) {
      const stats = buildTopicMastery(
        { slug: prefix, prefix, totalQuestions: total },
        srs,
        now,
      );
      masteryByPrefix.set(prefix, stats.masteryRatio);
    }

    return (externalId: string) => {
      const prefix = externalId.includes("-")
        ? externalId.split("-")[0]
        : "";
      return masteryByPrefix.get(prefix) ?? 0;
    };
  }, [srs, accessible]);

  // Whether at least one topic in scope already has SRS data — if so, the
  // weight signal is meaningful and we surface the adaptive banner.
  const hasAdaptiveSignal = useMemo(() => {
    if (!srs) return false;
    return accessible.some((q) => srs[q.externalId] !== undefined);
  }, [srs, accessible]);

  if (access === null) {
    return (
      <div
        className="mt-8 animate-pulse rounded-sm border border-horizon bg-cockpit p-8 space-y-4"
        aria-hidden
      >
        <div className="h-3 w-24 rounded bg-hull" />
        <div className="h-6 w-2/3 rounded bg-hull" />
        <div className="h-32 w-full rounded bg-hull" />
      </div>
    );
  }

  // Strip the topicSlug field before passing to Trainer (its props don't
  // know about it — keeps the existing API clean).
  const trainerQuestions: TrainerQuestion[] = accessible.map((q) => ({
    id: q.id,
    externalId: q.externalId,
    stem: q.stem,
    options: q.options,
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
    sourceRef: q.sourceRef,
  }));

  return (
    <>
      {!access && (
        <p className="mt-4 rounded-sm border border-cyan-pulse/20 bg-cyan-pulse/5 px-4 py-3 text-xs text-telemetry">
          {t("freeOnlyNote")}{" "}
          <Link
            href="/pricing"
            className="font-medium text-cyan-pulse underline-offset-2 hover:underline"
          >
            {t("unlockAll")} →
          </Link>
        </p>
      )}
      {hasAdaptiveSignal && (
        <p
          className="mt-4 inline-flex items-center gap-2 rounded-sm border border-amber-400/40 bg-amber-400/5 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-300"
          aria-live="polite"
        >
          <span aria-hidden>◇</span>
          {t("adaptive")}
        </p>
      )}
      <Trainer
        questions={trainerQuestions}
        initialDueOnly
        weightOf={weightOf}
      />
    </>
  );
}
