"use client";

import { useState } from "react";

// UGZ classification drill. The user is shown a card describing a real-world
// scenario; they pick which UGZ type it falls under. Immediate feedback with
// reasoning. Pedagogical purpose: the #2 student-fail topic per academy-
// vision.md §1.4 — confusion between zone types and what authorisation
// each requires.

type ZoneType = "information" | "restricted" | "prohibited";

type ZoneCard = {
  id: string;
  scenario: string;
  answer: ZoneType;
  explanation: string;
};

const CARDS: ZoneCard[] = [
  {
    id: "z1",
    scenario:
      "A bird nesting reserve on a small island. The CAA map marks it 'active during nesting season — please avoid'. No active restriction on the date you plan to fly.",
    answer: "information",
    explanation:
      "Information zones carry no legal restriction — they exist to warn the pilot of nearby sensitivity. Flying is allowed without any application.",
  },
  {
    id: "z2",
    scenario:
      "A patch of airspace adjacent to Riga airport's CTR. The map says 'flight permitted with BGKIS application — max 50 m AGL'.",
    answer: "restricted",
    explanation:
      "Restricted zones require an application and approval. Since 2025-01-01 BGKIS is the mandatory channel. The ceiling stated in the approval (50 m here) takes precedence over the general 120 m.",
  },
  {
    id: "z3",
    scenario:
      "EVR17 Border East — the full eastern border strip with Russia and Belarus, since 2025.",
    answer: "prohibited",
    explanation:
      "Prohibited zones are not flyable in Open category at all. EVR17 specifically carries criminal liability, not just an administrative fine.",
  },
  {
    id: "z4",
    scenario:
      "An active military training area marked 'No flight 08:00–18:00 weekdays during May'. The day you plan to fly is a Saturday in June.",
    answer: "information",
    explanation:
      "Outside the active window the zone is effectively information-only. Always re-check the zone status against the date and time of the planned flight, not against the season as a whole.",
  },
  {
    id: "z5",
    scenario:
      "A nuclear research facility's perimeter. The map shows a red filled polygon labelled 'no UAS flight permitted'.",
    answer: "prohibited",
    explanation:
      "Critical infrastructure with a hard no-fly designation. No application can lift the prohibition for Open category.",
  },
];

const TYPE_PALETTE: Record<
  ZoneType,
  { label: string; tone: string; chip: string }
> = {
  information: {
    label: "Information",
    tone: "border-cyan-pulse/60 bg-cyan-pulse/10 text-hud-white",
    chip: "text-cyan-pulse",
  },
  restricted: {
    label: "Restricted",
    tone: "border-amber-400/60 bg-amber-400/10 text-hud-white",
    chip: "text-amber-300",
  },
  prohibited: {
    label: "Prohibited",
    tone: "border-red-500/60 bg-red-500/10 text-hud-white",
    chip: "text-red-300",
  },
};

export function ZoneClassifier() {
  return (
    <section
      aria-label="UGZ classification drill"
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Interactive · classify the zone
      </p>
      <p className="mt-2 text-sm text-telemetry">
        Decide which UGZ type each scenario falls into. Tap to reveal.
      </p>

      <ol className="mt-4 space-y-4">
        {CARDS.map((card, i) => (
          <li key={card.id}>
            <ZoneCardRow card={card} index={i + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ZoneCardRow({ card, index }: { card: ZoneCard; index: number }) {
  const [picked, setPicked] = useState<ZoneType | null>(null);
  const revealed = picked !== null;
  const isCorrect = picked === card.answer;
  const answerStyle = TYPE_PALETTE[card.answer];

  return (
    <div className="border border-horizon bg-hull/60 p-4">
      <p className="text-sm text-hud-white">
        <span className="mr-2 font-mono text-xs text-muted">
          {String(index).padStart(2, "0")}
        </span>
        {card.scenario}
      </p>

      <div role="radiogroup" aria-label="Zone type" className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(TYPE_PALETTE) as ZoneType[]).map((t) => {
          const palette = TYPE_PALETTE[t];
          const isPicked = picked === t;
          const isAnswer = card.answer === t;
          let style =
            "border-horizon bg-hull text-telemetry hover:border-signal hover:text-hud-white";
          if (revealed && isAnswer) style = palette.tone;
          else if (revealed && isPicked && !isAnswer)
            style = "border-red-500/60 bg-red-500/10 text-hud-white";
          else if (revealed) style = "border-horizon bg-hull/40 text-muted";
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={isPicked}
              onClick={() => !revealed && setPicked(t)}
              disabled={revealed}
              className={`border px-3 py-1.5 font-mono text-sm transition-colors disabled:cursor-default ${style}`}
            >
              {palette.label}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-3 border-l-2 border-cyan-pulse/60 bg-hull/40 px-4 py-3 text-sm">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            <span className={isCorrect ? "text-cyan-pulse" : "text-amber-300"}>
              {isCorrect ? "Correct" : "Not quite"}
            </span>
            <span className="ml-2 text-muted">
              · answer: <span className={answerStyle.chip}>{answerStyle.label}</span>
            </span>
          </p>
          <p className="mt-1 text-telemetry">{card.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
