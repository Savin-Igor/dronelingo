"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const NOMINAL_V_PER_CELL = 3.7;

function classifyIATA(wh: number): {
  band: "ok" | "approval" | "forbidden";
} {
  if (wh < 100) return { band: "ok" };
  if (wh <= 160) return { band: "approval" };
  return { band: "forbidden" };
}

export function WhCalculator() {
  const t = useTranslations("lessonWidgets.whCalculator");
  const [cells, setCells] = useState(4);
  const [mAh, setMah] = useState(5000);

  const { volts, wh, band } = useMemo(() => {
    const v = cells * NOMINAL_V_PER_CELL;
    const energy = (mAh / 1000) * v;
    return { volts: v, wh: energy, band: classifyIATA(energy).band };
  }, [cells, mAh]);

  const bandStyle = {
    ok: "border-cyan-pulse/60 bg-cyan-pulse/10 text-hud-white",
    approval: "border-amber-400/60 bg-amber-400/10 text-hud-white",
    forbidden: "border-red-500/60 bg-red-500/10 text-hud-white",
  }[band];

  const bandLabel = {
    ok: t("iataOk"),
    approval: t("iataApproval"),
    forbidden: t("iataForbidden"),
  }[band];

  return (
    <section
      aria-label={t("heading")}
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        {t("heading")}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField
          label={t("cells")}
          value={cells}
          min={1}
          max={12}
          step={1}
          onChange={setCells}
          hint={t("cellsHint")}
        />
        <NumberField
          label={t("capacity")}
          value={mAh}
          min={200}
          max={30000}
          step={100}
          onChange={setMah}
          hint={t("capacityHint")}
        />
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <Row label={t("packVoltage")} value={`${volts.toFixed(1)} V`} mono />
        <Row label={t("capacityRow")} value={`${(mAh / 1000).toFixed(2)} Ah`} mono />
        <Row label={t("energy")} value={`${wh.toFixed(1)} Wh`} mono highlight />
      </dl>

      <p
        className={`mt-5 border px-4 py-3 text-sm font-mono ${bandStyle}`}
        aria-live="polite"
      >
        <span className="block text-[0.65rem] uppercase tracking-widest opacity-70">
          {t("iata")}
        </span>
        <span className="mt-1 block">{bandLabel}</span>
      </p>

      <p className="mt-3 text-xs text-muted">{t("formula")}</p>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="border border-horizon bg-hull px-3 py-2 font-mono text-base text-hud-white focus:border-cyan-pulse focus:outline-none"
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-horizon pt-2">
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd
        className={`${mono ? "font-mono" : ""} ${
          highlight ? "text-base text-cyan-pulse" : "text-sm text-hud-white"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
