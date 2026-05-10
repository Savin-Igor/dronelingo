"use client";

import { useEffect, useMemo, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
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
  window.dispatchEvent(new Event("dronelingo:attempts-changed"));
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

  if (order.length === 0) return null;

  if (finished) {
    return (
      <section className="mt-8 rounded-sm border border-horizon bg-cockpit p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          Session complete
        </p>
        <p className="mt-4 font-display text-3xl font-semibold text-hud-white">
          {accuracy}%
        </p>
        <p className="mt-2 font-mono text-xs text-muted">
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
          className="mt-8 inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
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
    writeAttempt({ questionId: current.id, isCorrect: correct, ts: Date.now() });
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <section className="mt-8">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">
          {t("questionOf", { current: index + 1, total: order.length })}
        </span>
        {sessionTotal > 0 && (
          <span
            className={`font-mono text-xs font-semibold ${
              accuracy >= 75 ? "text-green-clear" : accuracy >= 50 ? "text-amber-alert" : "text-red-danger"
            }`}
          >
            {accuracy}% {t("score", { correct: sessionCorrect, total: sessionTotal, percent: accuracy })}
          </span>
        )}
      </div>

      {/* Thin progress bar */}
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-grid">
        <div
          className="h-full rounded-full bg-cyan-pulse transition-all"
          style={{ width: `${((index) / order.length) * 100}%` }}
          aria-hidden
        />
      </div>

      {/* Question card */}
      <article className="mt-4 rounded-sm border border-cyan-pulse/15 bg-cockpit p-6">
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
                <LazyMotion features={domAnimation}>
                  <m.button
                    type="button"
                    disabled={revealed}
                    onClick={() => setSelected(opt.id)}
                    aria-pressed={isSelected}
                    animate={
                      revealed && isWrong
                        ? { x: [-4, 4, -3, 3, -2, 2, 0] }
                        : revealed && isRight
                          ? { scale: [1, 1.015, 1] }
                          : {}
                    }
                    transition={{ duration: 0.3 }}
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
                  </m.button>
                </LazyMotion>
              </li>
            );
          })}
        </ul>

        {/* Explanation */}
        {revealed && (
          <LazyMotion features={domAnimation}>
            <m.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`mt-5 rounded-sm border-l-2 p-4 text-sm ${
                isCorrect
                  ? "border-green-clear bg-green-clear/10"
                  : "border-red-danger bg-red-danger/10"
              }`}
              role="status"
            >
              <p className={`font-mono text-xs font-semibold uppercase tracking-wider ${isCorrect ? "text-green-clear" : "text-red-danger"}`}>
                {isCorrect ? t("correct") : t("incorrect")}
              </p>
              <p className="mt-2 leading-relaxed text-telemetry">
                {current.explanation}
              </p>
              <p className="mt-3 font-mono text-xs text-muted">
                {t("source")}: {current.sourceRef}
              </p>
            </m.div>
          </LazyMotion>
        )}
        <div className="mt-5 flex justify-end">
          {revealed ? (
            <button
              type="button"
              onClick={next}
              className="rounded-sm border border-horizon bg-hull px-4 py-2 text-sm font-medium text-hud-white transition-colors hover:border-signal"
            >
              {t("next")} →
            </button>
          ) : (
            <button
              type="button"
              onClick={check}
              disabled={selected === null}
              className="rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void disabled:cursor-not-allowed disabled:opacity-30"
            >
              {t("checkAnswer")}
            </button>
          )}
        </div>
      </article>
    </section>
  );
}
