"use client";

import { useEffect, useState } from "react";

// IMSAFE pre-flight self-check. Six binary items. One "yes" = ground the
// flight. State is persisted to localStorage so the lesson user can revisit
// and so a future pre-flight tool (Wave 1+) can read the last check.

const STORAGE_KEY = "dronelingo:imsafe:v1";

type IMSAFEKey = "illness" | "medication" | "stress" | "alcohol" | "fatigue" | "eating";

type IMSAFEItem = {
  key: IMSAFEKey;
  letter: string;
  label: string;
  prompt: string;
};

const ITEMS: IMSAFEItem[] = [
  {
    key: "illness",
    letter: "I",
    label: "Illness",
    prompt: "Any active infection, cold, or symptoms affecting concentration?",
  },
  {
    key: "medication",
    letter: "M",
    label: "Medication",
    prompt: "Any medication that may cause drowsiness or affect alertness?",
  },
  {
    key: "stress",
    letter: "S",
    label: "Stress",
    prompt: "Acute emotional stress (argument, bad news, financial pressure)?",
  },
  {
    key: "alcohol",
    letter: "A",
    label: "Alcohol",
    prompt: "Any alcohol consumed in the last 8 hours?",
  },
  {
    key: "fatigue",
    letter: "F",
    label: "Fatigue",
    prompt: "Fewer than 6 hours of sleep last night, or sustained sleep debt?",
  },
  {
    key: "eating",
    letter: "E",
    label: "Eating",
    prompt: "No food in the last 4 hours, or feeling hypoglycaemic?",
  },
];

type State = Record<IMSAFEKey, boolean | null>;
const initial: State = {
  illness: null,
  medication: null,
  stress: null,
  alcohol: null,
  fatigue: null,
  eating: null,
};

function readState(): State {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return initial;
    return { ...initial, ...(parsed as Partial<State>) };
  } catch {
    return initial;
  }
}

export function IMSAFEChecklist() {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setHydrated(true);
  }, []);

  function set(key: IMSAFEKey, value: boolean | null) {
    const next = { ...state, [key]: value };
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("dronelingo:imsafe-changed"));
    }
  }

  function reset() {
    setState(initial);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("dronelingo:imsafe-changed"));
    }
  }

  const anyYes = Object.values(state).some((v) => v === true);
  const allAnswered = Object.values(state).every((v) => v !== null);
  const verdict = !allAnswered
    ? null
    : anyYes
      ? "no-go"
      : "go";

  return (
    <section
      aria-label="IMSAFE checklist"
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Interactive · IMSAFE self-check
      </p>

      <ol className="mt-4 space-y-3">
        {ITEMS.map((item) => (
          <li
            key={item.key}
            className="border border-horizon bg-hull/60 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-2xl leading-none text-cyan-pulse">
                {item.letter}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-hud-white">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm text-telemetry">{item.prompt}</p>
                <div
                  role="radiogroup"
                  aria-label={item.label}
                  className="mt-3 flex gap-2"
                >
                  <YesNoButton
                    pressed={state[item.key] === false}
                    onClick={() => set(item.key, false)}
                    tone="safe"
                  >
                    No
                  </YesNoButton>
                  <YesNoButton
                    pressed={state[item.key] === true}
                    onClick={() => set(item.key, true)}
                    tone="warn"
                  >
                    Yes
                  </YesNoButton>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div
        aria-live="polite"
        className={`mt-5 border px-4 py-3 ${
          verdict === "go"
            ? "border-cyan-pulse/60 bg-cyan-pulse/10"
            : verdict === "no-go"
              ? "border-amber-400/70 bg-amber-400/10"
              : "border-horizon bg-hull/40"
        }`}
      >
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
          Verdict
        </p>
        <p className="mt-1 text-base font-semibold text-hud-white">
          {!hydrated
            ? "—"
            : verdict === null
              ? "Answer all six to see the verdict"
              : verdict === "go"
                ? "GO — all six clear. Run the UAS and environment checks next."
                : "NO-GO — one or more risks active. Postpone or delegate."}
        </p>
      </div>

      {hydrated && allAnswered ? (
        <button
          type="button"
          onClick={reset}
          className="mt-3 font-mono text-xs text-muted underline-offset-2 hover:text-cyan-pulse hover:underline"
        >
          Reset checklist
        </button>
      ) : null}
    </section>
  );
}

function YesNoButton({
  pressed,
  onClick,
  tone,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  tone: "safe" | "warn";
  children: React.ReactNode;
}) {
  const palette = pressed
    ? tone === "safe"
      ? "border-cyan-pulse bg-cyan-pulse/15 text-hud-white"
      : "border-amber-400 bg-amber-400/15 text-hud-white"
    : "border-horizon bg-hull text-telemetry hover:border-signal hover:text-hud-white";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={pressed}
      onClick={onClick}
      className={`min-w-[3.5rem] border px-4 py-1.5 font-mono text-sm transition-colors ${palette}`}
    >
      {children}
    </button>
  );
}
