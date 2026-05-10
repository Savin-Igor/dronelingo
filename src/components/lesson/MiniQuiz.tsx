"use client";

import { useState } from "react";

export type MiniQuizQuestion = {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  distractorRationales?: Record<string, string>;
};

// In-lesson mini quiz. Instant feedback, no scoring, no persistence.
// Designed to follow a concept immediately — not as exam practice.
// (Practice and exam pages own those flows.)
export function MiniQuiz({ questions }: { questions: MiniQuizQuestion[] }) {
  return (
    <section
      aria-label="Mini quiz"
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Quick check
      </p>
      <ol className="mt-4 space-y-6">
        {questions.map((q, i) => (
          <li key={q.id}>
            <MiniQuizItem question={q} index={i + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function MiniQuizItem({
  question,
  index,
}: {
  question: MiniQuizQuestion;
  index: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const revealed = selected !== null;
  const isCorrect = selected === question.correctOptionId;

  return (
    <div>
      <p className="text-sm font-medium text-hud-white">
        <span className="mr-2 font-mono text-xs text-muted">
          Q{String(index).padStart(2, "0")}
        </span>
        {question.stem}
      </p>
      <ul className="mt-3 space-y-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isAnswer = opt.id === question.correctOptionId;
          let style =
            "border-horizon bg-hull/60 text-telemetry hover:border-signal";
          if (revealed && isAnswer) {
            style = "border-cyan-pulse/70 bg-cyan-pulse/10 text-hud-white";
          } else if (revealed && isSelected && !isAnswer) {
            style = "border-amber-400/60 bg-amber-400/10 text-hud-white";
          } else if (revealed) {
            style = "border-horizon bg-hull/40 text-muted";
          }
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => !revealed && setSelected(opt.id)}
                disabled={revealed}
                aria-pressed={isSelected}
                className={`w-full border px-4 py-2.5 text-left text-sm transition-colors ${style} disabled:cursor-default`}
              >
                <span className="mr-3 font-mono text-xs text-muted">
                  {opt.id.toUpperCase()}
                </span>
                {opt.text}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed ? (
        <div className="mt-3 border-l-2 border-cyan-pulse/60 bg-hull/40 px-4 py-3 text-sm">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
            {isCorrect ? "Correct" : "Not quite"}
          </p>
          <p className="mt-1 text-telemetry">{question.explanation}</p>
          {!isCorrect && question.distractorRationales?.[selected!] ? (
            <p className="mt-2 text-xs text-muted">
              <span className="text-amber-300">Why your answer is wrong: </span>
              {question.distractorRationales[selected!]}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
