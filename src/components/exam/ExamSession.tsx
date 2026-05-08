"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const DURATION_SEC = EXAM_DURATION_MIN * 60;

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

export function ExamSession({ questions }: { questions: ExamQuestion[] }) {
  const t = useTranslations("exam");
  const router = useRouter();
  const startedAt = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [secLeft, setSecLeft] = useState(DURATION_SEC);

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
      passed: percent >= EXAM_PASS_THRESHOLD,
      perTopic,
      missed,
    };
    writeExamResult(result);
    router.replace("/exam/result");
  }, [answers, questions, router, total]);

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
      <p className="text-center text-gray-500">{t("noResult")}</p>
    );
  }

  function pick(optId: string) {
    setAnswers((prev) => ({ ...prev, [current.id]: optId }));
  }

  const timerWarning = secLeft <= 60;

  return (
    <>
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-lg font-semibold text-gray-900">{t("title")}</h1>
        <div
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            timerWarning
              ? "bg-red-100 text-red-900"
              : "bg-gray-100 text-gray-900"
          }`}
          aria-live="polite"
        >
          {t("timeLeft")}: {formatTime(secLeft)}
        </div>
      </header>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>{t("questionOf", { current: index + 1, total })}</span>
        <span>
          {unanswered === 1
            ? t("unansweredOne", { count: unanswered })
            : t("unansweredMany", { count: unanswered })}
        </span>
      </div>

      <article className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {current.topicTitle}
        </p>
        <h2 className="mt-2 text-lg font-medium text-gray-900">
          {current.stem}
        </h2>

        <ul className="mt-6 space-y-3">
          {current.options.map((opt) => {
            const isSelected = answers[current.id] === opt.id;
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => pick(opt.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition ${
                    isSelected
                      ? "border-gray-900 bg-gray-50 text-gray-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold"
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

      <nav className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← {t("prev")}
        </button>

        {index < total - 1 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            {t("next")} →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
          >
            {t("submit")}
          </button>
        )}
      </nav>

      <ol className="mt-8 grid grid-cols-10 gap-2 text-xs">
        {questions.map((q, i) => {
          const answered = Boolean(answers[q.id]);
          const isActive = i === index;
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={isActive ? "true" : undefined}
                className={`flex h-8 w-full items-center justify-center rounded-md border text-xs font-medium ${
                  isActive
                    ? "border-gray-900 bg-gray-900 text-white"
                    : answered
                      ? "border-gray-300 bg-gray-100 text-gray-900"
                      : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                }`}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("confirmSubmitTitle")}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t("confirmSubmitBody")}
            </p>
            {unanswered > 0 && (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                {unanswered === 1
                  ? t("unansweredOne", { count: unanswered })
                  : t("unansweredMany", { count: unanswered })}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("confirmNo")}
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
              >
                {t("confirmYes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
