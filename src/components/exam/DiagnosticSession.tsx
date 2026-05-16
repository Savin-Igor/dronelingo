"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SourceCitationList } from "@/components/content/SourceCitationList";
import { type DiagnosticQuestion } from "@/lib/diagnostic";
import { recordAnswer } from "@/lib/srs";

type Outcome = {
  questionId: string;
  externalId: string;
  topicSlug: string;
  topicTitle: string;
  correct: boolean;
};

/**
 * Diagnostic session — sequential, one question at a time, instant
 * reveal-after-answer. No timer, no submit-and-grade. Designed as a
 * gentle first-touch calibration that produces an SRS schedule the
 * daily warm-up can start working on right away.
 *
 * On finish:
 *  - every missed question is auto-pushed to SRS as "wrong" (no opt-in
 *    button — the whole value of a diagnostic is that the schedule
 *    bootstraps without the user having to opt into anything).
 *  - the result card shows a per-topic radar of strengths / weaknesses
 *    and a single CTA to start the daily warm-up.
 */
export function DiagnosticSession({
  questions,
}: {
  questions: DiagnosticQuestion[];
}) {
  const t = useTranslations("diagnostic");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const current = questions[index];

  // On finish: push every missed externalId into SRS so the warm-up
  // surfaces them in the next session. Idempotent — wrapped in an
  // effect that runs once when `finished` flips.
  useEffect(() => {
    if (!finished) return;
    for (const o of outcomes) {
      if (!o.correct) recordAnswer(o.externalId, "wrong");
    }
  }, [finished, outcomes]);

  if (total === 0) {
    return (
      <p className="mt-8 rounded-sm border border-horizon bg-cockpit p-6 text-center text-sm text-telemetry">
        {t("emptyPool")}
      </p>
    );
  }

  if (finished) {
    return <DiagnosticResult outcomes={outcomes} total={total} />;
  }

  const isCorrect = selected !== null && selected === current.correctOptionId;

  function check() {
    if (selected === null || revealed) return;
    setRevealed(true);
    setOutcomes((prev) => [
      ...prev,
      {
        questionId: current.id,
        externalId: current.externalId,
        topicSlug: current.topicSlug,
        topicTitle: current.topicTitle,
        correct: selected === current.correctOptionId,
      },
    ]);
  }

  function next() {
    if (!revealed) return;
    if (index >= total - 1) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <section className="mt-6">
      {/* Progress + topic chip */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted">
          {t("questionOf", { current: index + 1, total })}
        </span>
        <span className="rounded-sm border border-horizon bg-hull/60 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-cyan-pulse">
          {current.topicTitle}
        </span>
      </div>

      {/* Thin progress bar */}
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-grid">
        <div
          className="h-full rounded-full bg-cyan-pulse transition-all"
          style={{ width: `${(index / total) * 100}%` }}
          aria-hidden
        />
      </div>

      {/* Question card */}
      <article className="mt-4 rounded-sm border border-cyan-pulse/15 bg-cockpit p-6">
        {current.imageUrl && (
          <div className="mb-4 overflow-hidden rounded-sm border border-horizon bg-hull">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.imageAlt ?? ""}
              className="block h-auto w-full"
              loading="lazy"
            />
          </div>
        )}
        <h2 className="text-base font-medium leading-relaxed text-hud-white">
          {current.stem}
        </h2>

        <ul className="mt-5 space-y-2">
          {current.options.map((opt) => {
            const isSelected = selected === opt.id;
            const isRight = revealed && opt.id === current.correctOptionId;
            const isWrong =
              revealed && isSelected && opt.id !== current.correctOptionId;
            const stateClasses = isRight
              ? "border-green-clear bg-green-clear/10 text-green-clear"
              : isWrong
                ? "border-red-danger bg-red-danger/10 text-red-danger"
                : isSelected
                  ? "border-cyan-pulse/60 bg-signal/20 text-hud-white"
                  : "border-horizon bg-cockpit text-telemetry hover:border-cyan-pulse/30 hover:text-hud-white";
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(opt.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-start gap-3 rounded-sm border p-4 text-left text-sm transition-colors ${stateClasses} ${
                    revealed ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-current font-mono text-xs font-semibold"
                    aria-hidden
                  >
                    {opt.id.toUpperCase()}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div
            className={`mt-5 rounded-sm border-l-2 p-4 text-sm ${
              isCorrect
                ? "border-green-clear bg-green-clear/10"
                : "border-red-danger bg-red-danger/10"
            }`}
            role="status"
          >
            <p
              className={`font-mono text-xs font-semibold uppercase tracking-wider ${
                isCorrect ? "text-green-clear" : "text-red-danger"
              }`}
            >
              {isCorrect ? t("correct") : t("incorrect")}
            </p>
            <p className="mt-2 leading-relaxed text-telemetry">
              {current.explanation}
            </p>
            <SourceCitationList
              sourceRef={current.sourceRef}
              label={`${t("source")}:`}
              className="mt-3 font-mono text-xs text-muted"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          {revealed ? (
            <button
              type="button"
              onClick={next}
              className="rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
            >
              {index >= total - 1 ? t("finish") : t("next")} →
            </button>
          ) : (
            <button
              type="button"
              onClick={check}
              disabled={selected === null}
              className="rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void disabled:cursor-not-allowed disabled:opacity-30"
            >
              {t("check")}
            </button>
          )}
        </div>
      </article>
    </section>
  );
}

function DiagnosticResult({
  outcomes,
  total,
}: {
  outcomes: Outcome[];
  total: number;
}) {
  const t = useTranslations("diagnostic");

  // Aggregate per-topic strength: ratio of correct answers in that topic.
  const perTopic = useMemo(() => {
    const map = new Map<
      string,
      { topicSlug: string; topicTitle: string; correct: number; total: number }
    >();
    for (const o of outcomes) {
      const slot = map.get(o.topicSlug) ?? {
        topicSlug: o.topicSlug,
        topicTitle: o.topicTitle,
        correct: 0,
        total: 0,
      };
      slot.total += 1;
      if (o.correct) slot.correct += 1;
      map.set(o.topicSlug, slot);
    }
    return Array.from(map.values());
  }, [outcomes]);

  const correctCount = outcomes.filter((o) => o.correct).length;
  const missedCount = outcomes.length - correctCount;
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return (
    <section className="mt-6 space-y-4">
      {/* Headline card */}
      <div className="rounded-sm border border-cyan-pulse/50 bg-cockpit p-6 text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
          ◇ {t("result.kicker")}
        </p>
        <p className="mt-3 font-display text-4xl font-semibold text-hud-white">
          {correctCount} / {total}
        </p>
        <p className="mt-1 font-mono text-xs text-muted">
          {t("result.percent", { percent })}
        </p>
      </div>

      {/* Per-topic strength radar (list-style for clarity over fancy SVG) */}
      <section
        className="rounded-sm border border-horizon bg-cockpit p-6"
        aria-label={t("result.perTopicLabel")}
      >
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("result.perTopicHeading")}
        </h2>
        <ul className="mt-4 space-y-3">
          {perTopic.map((row) => {
            const ratio = row.total === 0 ? 0 : row.correct / row.total;
            const tone =
              ratio >= 1
                ? "border-green-clear/60 text-green-clear"
                : ratio >= 0.5
                  ? "border-amber-400/60 text-amber-300"
                  : "border-red-danger/60 text-red-danger";
            return (
              <li
                key={row.topicSlug}
                className="grid grid-cols-[1fr_3rem] items-center gap-3"
              >
                <span className="text-sm text-telemetry">{row.topicTitle}</span>
                <span
                  className={`inline-flex h-7 items-center justify-center rounded-sm border font-mono text-xs ${tone}`}
                  aria-label={t("result.scoreAria", {
                    correct: row.correct,
                    total: row.total,
                  })}
                >
                  {row.correct}/{row.total}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Auto-queued banner + CTAs */}
      {missedCount > 0 ? (
        <div className="rounded-sm border border-amber-400/40 bg-amber-400/5 px-5 py-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-300">
            ◇ {t("result.queuedKicker")}
          </p>
          <p className="mt-1 text-sm text-hud-white">
            {t("result.queuedTitle", { count: missedCount })}
          </p>
          <p className="mt-1 text-xs text-telemetry">
            {t("result.queuedBody")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/practice/warmup"
              className="inline-flex items-center justify-center rounded-sm border border-amber-400 bg-amber-400/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-200 transition-colors hover:bg-amber-400 hover:text-void"
            >
              {t("result.ctaWarmup")} →
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-sm border border-horizon px-4 py-2 font-mono text-xs uppercase tracking-widest text-telemetry transition-colors hover:border-signal hover:text-hud-white"
            >
              {t("result.ctaLessons")} →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-sm border border-green-clear/40 bg-green-clear/5 px-5 py-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-green-clear">
            ◇ {t("result.allClearKicker")}
          </p>
          <p className="mt-1 text-sm text-hud-white">
            {t("result.allClearBody")}
          </p>
          <div className="mt-3">
            <Link
              href="/exam"
              className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
            >
              {t("result.ctaMockExam")} →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
