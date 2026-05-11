"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type ZoneType = "information" | "restricted" | "prohibited";
type CardId = "z1" | "z2" | "z3" | "z4" | "z5";

const CARDS: { id: CardId; answer: ZoneType }[] = [
  { id: "z1", answer: "information" },
  { id: "z2", answer: "restricted" },
  { id: "z3", answer: "prohibited" },
  { id: "z4", answer: "information" },
  { id: "z5", answer: "prohibited" },
];

const TYPE_PALETTE: Record<ZoneType, { tone: string; chip: string }> = {
  information: {
    tone: "border-cyan-pulse/60 bg-cyan-pulse/10 text-hud-white",
    chip: "text-cyan-pulse",
  },
  restricted: {
    tone: "border-amber-400/60 bg-amber-400/10 text-hud-white",
    chip: "text-amber-300",
  },
  prohibited: {
    tone: "border-red-500/60 bg-red-500/10 text-hud-white",
    chip: "text-red-300",
  },
};

export function ZoneClassifier() {
  const t = useTranslations("lessonWidgets.zoneClassifier");
  return (
    <section
      aria-label={t("heading")}
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        {t("heading")}
      </p>
      <p className="mt-2 text-sm text-telemetry">{t("intro")}</p>

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

function ZoneCardRow({
  card,
  index,
}: {
  card: { id: CardId; answer: ZoneType };
  index: number;
}) {
  const t = useTranslations("lessonWidgets.zoneClassifier");
  const [picked, setPicked] = useState<ZoneType | null>(null);
  const revealed = picked !== null;
  const isCorrect = picked === card.answer;
  const answerPalette = TYPE_PALETTE[card.answer];

  return (
    <div className="border border-horizon bg-hull/60 p-4">
      <p className="text-sm text-hud-white">
        <span className="mr-2 font-mono text-xs text-muted">
          {String(index).padStart(2, "0")}
        </span>
        {t(`cards.${card.id}.scenario`)}
      </p>

      <div
        role="radiogroup"
        aria-label={t("zoneTypeLabel")}
        className="mt-3 flex flex-wrap gap-2"
      >
        {(Object.keys(TYPE_PALETTE) as ZoneType[]).map((zoneType) => {
          const palette = TYPE_PALETTE[zoneType];
          const isPicked = picked === zoneType;
          const isAnswer = card.answer === zoneType;
          let style =
            "border-horizon bg-hull text-telemetry hover:border-signal hover:text-hud-white";
          if (revealed && isAnswer) style = palette.tone;
          else if (revealed && isPicked && !isAnswer)
            style = "border-red-500/60 bg-red-500/10 text-hud-white";
          else if (revealed) style = "border-horizon bg-hull/40 text-muted";
          return (
            <button
              key={zoneType}
              type="button"
              role="radio"
              aria-checked={isPicked}
              onClick={() => !revealed && setPicked(zoneType)}
              disabled={revealed}
              className={`border px-3 py-1.5 font-mono text-sm transition-colors disabled:cursor-default ${style}`}
            >
              {t(`types.${zoneType}`)}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-3 border-l-2 border-cyan-pulse/60 bg-hull/40 px-4 py-3 text-sm">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            <span className={isCorrect ? "text-cyan-pulse" : "text-amber-300"}>
              {isCorrect ? t("correct") : t("notQuite")}
            </span>
            <span className="ml-2 text-muted">
              · {t("answerPrefix")}{" "}
              <span className={answerPalette.chip}>
                {t(`types.${card.answer}`)}
              </span>
            </span>
          </p>
          <p className="mt-1 text-telemetry">
            {t(`cards.${card.id}.explanation`)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
