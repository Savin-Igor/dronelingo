"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SourceCitationList } from "@/components/content/SourceCitationList";
import {
  readLatestExamResult,
  type StoredExamResult,
} from "@/lib/anonymous-exam";
import { EXAM_PASS_THRESHOLD } from "@/lib/exam";
import { recordAnswer } from "@/lib/srs";
import { ProgressRing } from "@/components/ui/ProgressRing";

export function ExamResultView() {
  const t = useTranslations("exam");
  const [result, setResult] = useState<StoredExamResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sentToReview, setSentToReview] = useState(false);

  useEffect(() => {
    setResult(readLatestExamResult());
    setLoaded(true);
  }, []);

  // Missed items that carry an externalId — only these can be pushed
  // into SRS. Old exam history (pre-SRS-link) may have undefined ids
  // and is silently skipped.
  const reviewableMissed = useMemo(() => {
    if (!result) return [] as { externalId: string }[];
    return result.missed.filter(
      (m): m is typeof m & { externalId: string } =>
        typeof m.externalId === "string" && m.externalId.length > 0,
    );
  }, [result]);

  function sendMissedToReview() {
    if (reviewableMissed.length === 0 || sentToReview) return;
    for (const m of reviewableMissed) {
      // recordAnswer with "wrong" → SRS resets repetitions to 0 and sets
      // dueAt to a 1-day penalty interval; the warm-up adaptive sort
      // surfaces the question on the next session.
      recordAnswer(m.externalId, "wrong");
    }
    setSentToReview(true);
  }

  if (!loaded) return null;

  if (!result) {
    return (
      <section className="rounded-sm border border-horizon bg-cockpit p-8 text-center">
        <p className="text-telemetry">{t("noResult")}</p>
        <Link
          href="/exam"
          className="mt-6 inline-flex rounded-sm border border-horizon px-4 py-2 text-sm font-medium text-telemetry transition-colors hover:border-signal hover:text-hud-white"
        >
          {t("retake")}
        </Link>
      </section>
    );
  }

  const percent = Math.round((result.correct / result.total) * 100);
  const minutes = Math.max(1, Math.round(result.durationSec / 60));
  const perTopic = Object.values(result.perTopic);

  return (
    <>
      {/* ── Pass / Fail hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-sm border border-horizon">
        {result.passed && (
          <>
            <Image
              src="/cert-ascend.jpg"
              alt=""
              fill
              className="object-cover object-top opacity-[0.08]"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-void/30 to-cockpit/95"
              aria-hidden
            />
          </>
        )}

        <div className="relative z-10 flex flex-col items-center py-10">
          <ProgressRing percent={percent} passed={result.passed} size={144} />

          <p
            className={`mt-5 font-mono text-lg font-semibold uppercase tracking-widest ${
              result.passed ? "text-green-clear" : "text-amber-alert"
            }`}
          >
            {result.passed ? "PASS" : "NOT PASSED"}
          </p>

          <p className="mt-2 font-mono text-xs text-muted">
            {t("score", { correct: result.correct, total: result.total })}
            &nbsp;·&nbsp;
            {t("thresholdLabel", { threshold: EXAM_PASS_THRESHOLD })}
            &nbsp;·&nbsp;
            {t("durationLabel", { minutes })}
          </p>
        </div>
      </section>

      {/* ── Per-sector breakdown ──────────────────────────────────────── */}
      <section className="mt-4 rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("perTopic")}
        </h2>
        <ul className="mt-5 space-y-4">
          {perTopic.map((row) => {
            const ratio =
              row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100);
            const barColor =
              ratio >= EXAM_PASS_THRESHOLD
                ? "bg-green-clear"
                : ratio >= 50
                  ? "bg-amber-alert"
                  : "bg-red-danger";
            return (
              <li key={row.topicSlug}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-telemetry">{row.topicTitle}</span>
                  <span className="font-mono text-xs text-muted">
                    {t("perTopicScore", {
                      correct: row.correct,
                      total: row.total,
                    })}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-grid">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Missed questions ──────────────────────────────────────────── */}
      <section className="mt-4 rounded-sm border border-horizon bg-cockpit p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
            {t("missed")}
          </h2>
          {reviewableMissed.length > 0 &&
            (sentToReview ? (
              <Link
                href="/practice/warmup"
                className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
                aria-live="polite"
              >
                ◇{" "}
                {t("review.queued", { count: reviewableMissed.length })}
                <span className="ml-2 opacity-70" aria-hidden>
                  →
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={sendMissedToReview}
                className="inline-flex items-center gap-1.5 rounded-sm border border-amber-400/60 bg-amber-400/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-amber-200 transition-colors hover:bg-amber-400 hover:text-void"
              >
                <span aria-hidden>◇</span>
                {t("review.send", { count: reviewableMissed.length })}
              </button>
            ))}
        </div>

        {result.missed.length === 0 ? (
          <p className="mt-4 text-sm text-green-clear">{t("noMisses")}</p>
        ) : (
          <ul className="mt-4 space-y-1">
            {result.missed.map((m) => {
              const correctOpt = m.options.find(
                (o) => o.id === m.correctOptionId,
              );
              const selectedOpt = m.options.find(
                (o) => o.id === m.selectedOptionId,
              );
              return (
                <li key={m.questionId}>
                  <details className="group rounded-sm border border-horizon bg-hull/50">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-muted">
                          {m.topicTitle}
                        </p>
                        <p className="mt-1 text-sm font-medium text-telemetry group-open:text-hud-white">
                          {m.stem}
                        </p>
                      </div>
                      <span
                        className="mt-1 shrink-0 font-mono text-xs text-muted transition-transform group-open:rotate-90"
                        aria-hidden
                      >
                        ▸
                      </span>
                    </summary>

                    <div className="border-t border-horizon px-4 pb-4 pt-3">
                      <div className="space-y-2 text-sm">
                        <p className="border-l-2 border-green-clear bg-green-clear/10 py-2 pl-3 text-green-clear">
                          ✓ {correctOpt ? correctOpt.text : m.correctOptionId}
                        </p>
                        {selectedOpt && (
                          <p className="border-l-2 border-red-danger bg-red-danger/10 py-2 pl-3 text-red-danger">
                            ✗ {selectedOpt.text}
                          </p>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-telemetry">
                        {m.explanation}
                      </p>
                      <SourceCitationList
                        sourceRef={m.sourceRef}
                        label={`${t("source")}:`}
                        className="mt-2 font-mono text-xs text-muted"
                      />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── CTAs ─────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {result.passed && (
          <a
            href="https://e.caa.gov.lv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
          >
            {t("claimCta")}
          </a>
        )}
        <Link
          href="/exam"
          className="inline-flex items-center justify-center rounded-sm border border-horizon px-5 py-2.5 text-sm font-medium text-telemetry transition-colors hover:border-signal hover:text-hud-white"
        >
          {result.passed ? t("retake") : t("retake")}
        </Link>
      </div>
    </>
  );
}
