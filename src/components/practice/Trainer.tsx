"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export type TrainerQuestion = {
  id: string;
  externalId: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  sourceRef: string;
};

const STORAGE_KEY = "dronelingo:attempts:v1";

type StoredAttempt = {
  questionId: string;
  isCorrect: boolean;
  ts: number;
};

function readAttempts(): StoredAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredAttempt[]) : [];
  } catch {
    return [];
  }
}

function writeAttempt(attempt: StoredAttempt) {
  if (typeof window === "undefined") return;
  const all = readAttempts();
  all.push(attempt);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Trainer({ questions }: { questions: TrainerQuestion[] }) {
  const t = useTranslations("practice");
  const [order, setOrder] = useState<TrainerQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  useEffect(() => {
    setOrder(shuffle(questions));
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setSessionCorrect(0);
    setSessionTotal(0);
  }, [questions]);

  const current = order[index];
  const finished = order.length > 0 && index >= order.length;

  const accuracy = useMemo(() => {
    if (sessionTotal === 0) return 0;
    return Math.round((sessionCorrect / sessionTotal) * 100);
  }, [sessionCorrect, sessionTotal]);

  if (order.length === 0) {
    return null;
  }

  if (finished) {
    return (
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-lg font-medium text-gray-900">{t("allDone")}</p>
        <p className="mt-3 text-sm text-gray-600">
          {t("score", {
            correct: sessionCorrect,
            total: sessionTotal,
            percent: accuracy,
          })}
        </p>
        <button
          type="button"
          onClick={() => {
            setOrder(shuffle(questions));
            setIndex(0);
            setSelected(null);
            setRevealed(false);
            setSessionCorrect(0);
            setSessionTotal(0);
          }}
          className="mt-6 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {t("restart")}
        </button>
      </section>
    );
  }

  const isCorrect = selected !== null && selected === current.correctOptionId;

  function check() {
    if (selected === null || revealed) return;
    const correct = selected === current.correctOptionId;
    setRevealed(true);
    setSessionCorrect((c) => c + (correct ? 1 : 0));
    setSessionTotal((tot) => tot + 1);
    writeAttempt({
      questionId: current.id,
      isCorrect: correct,
      ts: Date.now(),
    });
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {t("questionOf", { current: index + 1, total: order.length })}
        </span>
        {sessionTotal > 0 && (
          <span>
            {t("score", {
              correct: sessionCorrect,
              total: sessionTotal,
              percent: accuracy,
            })}
          </span>
        )}
      </div>

      <article className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">{current.stem}</h2>

        <ul className="mt-6 space-y-3">
          {current.options.map((opt) => {
            const isSelected = selected === opt.id;
            const isRight = revealed && opt.id === current.correctOptionId;
            const isWrong =
              revealed && isSelected && opt.id !== current.correctOptionId;
            const baseClasses =
              "flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition";
            const stateClasses = isRight
              ? "border-green-400 bg-green-50 text-green-900"
              : isWrong
                ? "border-red-400 bg-red-50 text-red-900"
                : isSelected
                  ? "border-gray-900 bg-gray-50 text-gray-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300";
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(opt.id)}
                  aria-pressed={isSelected}
                  className={`${baseClasses} ${stateClasses} ${
                    revealed ? "cursor-default" : "cursor-pointer"
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

        {revealed && (
          <div
            className={`mt-6 rounded-lg p-4 text-sm ${
              isCorrect
                ? "bg-green-50 text-green-900"
                : "bg-red-50 text-red-900"
            }`}
            role="status"
          >
            <p className="font-semibold">
              {isCorrect ? t("correct") : t("incorrect")}
            </p>
            <p className="mt-2 whitespace-pre-line text-gray-800">
              {current.explanation}
            </p>
            <p className="mt-3 text-xs text-gray-500">
              {t("source")}: {current.sourceRef}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {revealed ? (
            <button
              type="button"
              onClick={next}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              {t("next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={check}
              disabled={selected === null}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("checkAnswer")}
            </button>
          )}
        </div>
      </article>
    </section>
  );
}
