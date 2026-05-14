"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  EXAM_DURATION_MIN,
  EXAM_PASS_THRESHOLD,
  type ExamQuestion,
} from "@/lib/exam";
import {
  writeExamResult,
  type StoredExamResult,
} from "@/lib/anonymous-exam";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(secLeft: number): string {
  const m = Math.max(0, Math.floor(secLeft / 60));
  const s = Math.max(0, secLeft % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamSession({
  questions,
  durationMin = EXAM_DURATION_MIN,
  examType = "full",
  topicSlug,
  passThreshold = EXAM_PASS_THRESHOLD,
}: {
  questions: ExamQuestion[];
  /** Override the timer length — used by per-topic drills and the
   *  meteorology A2 bonus (35 min / 30 Q). */
  durationMin?: number;
  /** Persisted on StoredExamResult so the readiness gauge can filter. */
  examType?: "full" | "topic" | "meteorology-a2";
  /** Topic slug for per-topic drills (only set when examType === "topic"). */
  topicSlug?: string;
  /** Override pass threshold (default 75 % for the A1/A3 mock). */
  passThreshold?: number;
}) {
  const t = useTranslations("exam");
  const router = useRouter();
  const startedAt = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  const durationSec = durationMin * 60;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [secLeft, setSecLeft] = useState(durationSec);

  const total = questions.length;
  const current = questions[index];
  const unanswered = useMemo(
    () => questions.filter((q) => !answers[q.id]).length,
    [questions, answers],
  );

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finishedAt = Date.now();
    const durationSec = Math.round((finishedAt - startedAt.current) / 1000);

    const perTopic: StoredExamResult["perTopic"] = {};
    const missed: StoredExamResult["missed"] = [];
    let correctCount = 0;

    for (const q of questions) {
      const slot = (perTopic[q.topicId] ??= {
        topicSlug: q.topicSlug,
        topicTitle: q.topicTitle,
        correct: 0,
        total: 0,
      });
      slot.total += 1;
      const selected = answers[q.id] ?? null;
      const isCorrect = selected !== null && selected === q.correctOptionId;
      if (isCorrect) {
        correctCount += 1;
        slot.correct += 1;
      } else {
        missed.push({
          questionId: q.id,
          externalId: q.externalId,
          topicSlug: q.topicSlug,
          topicTitle: q.topicTitle,
          stem: q.stem,
          options: q.options,
          correctOptionId: q.correctOptionId,
          selectedOptionId: selected,
          explanation: q.explanation,
          sourceRef: q.sourceRef,
        });
      }
    }

    const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const result: StoredExamResult = {
      id: newId(),
      takenAt: finishedAt,
      durationSec,
      total,
      correct: correctCount,
      passed: percent >= passThreshold,
      type: examType,
      topicSlug: examType === "topic" ? topicSlug : undefined,
      perTopic,
      missed,
    };
    writeExamResult(result);
    router.replace("/exam/result");
  }, [answers, questions, router, total, examType, topicSlug, passThreshold]);

  useEffect(() => {
    const tick = setInterval(() => {
      setSecLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (secLeft === 0 && !submittedRef.current) {
      submit();
    }
  }, [secLeft, submit]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  if (questions.length === 0) {
    return (
      <p className="text-center text-telemetry">{t("noResult")}</p>
    );
  }

  function pick(optId: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: optId }));
  }

  const timerCritical = secLeft <= 60;
  const timerWarning = secLeft <= 300 && !timerCritical;

  const timerClass = timerCritical
    ? "animate-timer-crit rounded-sm bg-red-danger/10 px-3 py-1 font-mono text-sm font-semibold text-red-danger"
    : timerWarning
      ? "animate-timer-warn rounded-sm bg-amber-alert/10 px-3 py-1 font-mono text-sm font-semibold text-amber-alert"
      : "rounded-sm bg-hull px-3 py-1 font-mono text-sm font-semibold text-telemetry";

  return (
    <>
      {/* ── Sticky exam sub-header ───────────────────────────────────── */}
      <div className="sticky top-14 z-20 -mx-6 mb-6 border-b border-horizon bg-cockpit/95 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              {t("title")}
            </span>
            <span className="font-mono text-xs text-muted">
              {t("questionOf", { current: index + 1, total })}
            </span>
          </div>
          <div className={timerClass} aria-live="polite">
            {formatTime(secLeft)}
          </div>
        </div>
      </div>

      {/* ── Unanswered counter ────────────────────────────────────────── */}
      <div className="mb-4 flex justify-end">
        <span className="font-mono text-xs text-muted">
          {unanswered === 0
            ? t("allAnswered")
            : unanswered === 1
              ? t("unansweredOne", { count: unanswered })
              : t("unansweredMany", { count: unanswered })}
        </span>
      </div>

      {/* ── Question card ─────────────────────────────────────────────── */}
      <article className="rounded-sm border border-cyan-pulse/15 bg-cockpit p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {current.topicTitle}
        </p>
        {current.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-sm border border-horizon bg-hull">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.imageAlt ?? ""}
              className="block h-auto w-full"
              loading="lazy"
            />
          </div>
        )}
        <h2 className="mt-3 text-base font-medium leading-relaxed text-hud-white">
          {current.stem}
        </h2>

        <ul className="mt-6 space-y-2">
          {current.options.map((opt) => {
            const isSelected = answers[current.id] === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => pick(opt.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-start gap-3 rounded-sm border p-4 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-cyan-pulse/60 bg-signal/20 text-hud-white"
                      : "border-horizon bg-cockpit text-telemetry hover:border-cyan-pulse/30 hover:text-hud-white"
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
      </article>

      {/* ── Prev / Next navigation ────────────────────────────────────── */}
      <nav className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-sm border border-horizon px-4 py-2 text-sm font-medium text-telemetry transition-colors hover:border-signal hover:text-hud-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← {t("prev")}
        </button>

        {index < total - 1 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            className="rounded-sm border border-horizon bg-hull px-4 py-2 text-sm font-medium text-hud-white transition-colors hover:border-signal"
          >
            {t("next")} →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-sm border border-green-clear/40 bg-green-clear/10 px-4 py-2 text-sm font-medium text-green-clear transition-colors hover:bg-green-clear/20"
          >
            {t("submit")}
          </button>
        )}
      </nav>

      {/* ── Question navigation grid ──────────────────────────────────── */}
      <div className="mt-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
          Navigation
        </p>
        <ol className="grid grid-cols-10 gap-1.5">
          {questions.map((q, i) => {
            const answered = Boolean(answers[q.id]);
            const isActive = i === index;
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex h-8 w-full items-center justify-center rounded-sm border font-mono text-xs font-medium transition-colors ${
                    isActive
                      ? "border-cyan-pulse bg-cyan-pulse text-void"
                      : answered
                        ? "border-cyan-pulse/30 bg-signal/30 text-cyan-pulse"
                        : "border-horizon bg-cockpit text-muted hover:border-signal"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── Submit confirmation modal ─────────────────────────────────── */}
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {showConfirm && (
            <m.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
          <m.div
            className="w-full max-w-md rounded-sm border border-horizon bg-hull p-6 shadow-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <h2 className="font-display text-lg font-semibold text-hud-white">
              {t("confirmSubmitTitle")}
            </h2>
            <p className="mt-2 text-sm text-telemetry">
              {t("confirmSubmitBody")}
            </p>
            {unanswered > 0 && (
              <div className="mt-4 border-l-2 border-amber-alert bg-amber-alert/10 p-3">
                <p className="text-sm text-amber-alert">
                  {unanswered === 1
                    ? t("unansweredOne", { count: unanswered })
                    : t("unansweredMany", { count: unanswered })}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  Unanswered questions count as wrong.
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-sm border border-horizon px-4 py-2 text-sm font-medium text-telemetry transition-colors hover:border-signal hover:text-hud-white"
              >
                {t("confirmNo")}
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-sm border border-green-clear/40 bg-green-clear/10 px-4 py-2 text-sm font-medium text-green-clear transition-colors hover:bg-green-clear/20"
              >
                {t("confirmYes")}
              </button>
            </div>
          </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </>
  );
}
