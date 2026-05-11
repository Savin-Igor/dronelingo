"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type SubcatId = "a1-c0" | "a1-c1" | "a2-low" | "a2-normal" | "a3";

type Row = {
  id: SubcatId;
  label: string;
  min: number;
  note: string;
};

export function DistanceRuleSimulator() {
  const t = useTranslations("lessonWidgets.distanceRule");
  const [altitude, setAltitude] = useState(60);

  const rows: Row[] = useMemo(() => {
    const oneToOne = Math.max(30, altitude);
    return [
      {
        id: "a1-c0",
        label: t("subcats.a1-c0.label"),
        min: 0,
        note: t("subcats.a1-c0.note"),
      },
      {
        id: "a1-c1",
        label: t("subcats.a1-c1.label"),
        min: 0,
        note: t("subcats.a1-c1.note"),
      },
      {
        id: "a2-low",
        label: t("subcats.a2-low.label"),
        min: 5,
        note: t("subcats.a2-low.note"),
      },
      {
        id: "a2-normal",
        label: t("subcats.a2-normal.label"),
        min: 30,
        note: t("subcats.a2-normal.note"),
      },
      {
        id: "a3",
        label: t("subcats.a3.label"),
        min: oneToOne,
        note:
          altitude <= 30
            ? t("a3NoteFloor")
            : t("a3NoteActive", { altitude }),
      },
    ];
  }, [altitude, t]);

  return (
    <section
      aria-label={t("heading")}
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        {t("heading")}
      </p>

      <div className="mt-4">
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
              {t("altitude")}
            </span>
            <span className="font-mono text-base text-cyan-pulse">
              {altitude} m
            </span>
          </span>
          <input
            type="range"
            min={1}
            max={120}
            step={1}
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            aria-label={t("altitudeAriaLabel")}
            className="w-full accent-cyan-pulse"
          />
          <span className="flex justify-between font-mono text-[0.65rem] text-muted">
            <span>1 m</span>
            <span>60 m</span>
            <span>{t("ceilingMark")}</span>
          </span>
        </label>
      </div>

      <ul className="mt-5 space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-1 border-t border-horizon pt-3 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-pulse sm:w-56">
              {r.label}
            </span>
            <span className="flex flex-1 items-baseline gap-3">
              <span className="font-mono text-lg text-hud-white">
                {r.min === 0 ? "—" : `≥ ${r.min} m`}
              </span>
              <span className="text-xs text-telemetry">{r.note}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-muted">{t("footer")}</p>
    </section>
  );
}
