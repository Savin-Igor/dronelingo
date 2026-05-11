"use client";

import { useMemo, useState } from "react";

// LiPo Wh calculator. Inputs: cell count (S) and capacity (mAh). Outputs:
// pack voltage, energy in Wh, IATA air-travel band. Built specifically for
// the batteries-and-storage lesson — the Wh formula is one of the most-
// failed numeric items per academy-vision.md §1.4.

const NOMINAL_V_PER_CELL = 3.7;

function classifyIATA(wh: number): {
  band: "ok" | "approval" | "forbidden";
  label: string;
} {
  if (wh < 100) return { band: "ok", label: "Carry-on or checked baggage" };
  if (wh <= 160)
    return { band: "approval", label: "Carry-on only · airline approval" };
  return { band: "forbidden", label: "Forbidden on passenger aircraft" };
}

export function WhCalculator() {
  const [cells, setCells] = useState(4);
  const [mAh, setMah] = useState(5000);

  const { volts, wh, classification } = useMemo(() => {
    const v = cells * NOMINAL_V_PER_CELL;
    const energy = (mAh / 1000) * v;
    return { volts: v, wh: energy, classification: classifyIATA(energy) };
  }, [cells, mAh]);

  const bandStyle = {
    ok: "border-cyan-pulse/60 bg-cyan-pulse/10 text-hud-white",
    approval: "border-amber-400/60 bg-amber-400/10 text-hud-white",
    forbidden: "border-red-500/60 bg-red-500/10 text-hud-white",
  }[classification.band];

  return (
    <section
      aria-label="LiPo Wh calculator"
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Interactive · Wh calculator
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Cell count (S)"
          value={cells}
          min={1}
          max={12}
          step={1}
          onChange={setCells}
          hint="DJI Mavic 3 = 4S"
        />
        <NumberField
          label="Capacity (mAh)"
          value={mAh}
          min={200}
          max={30000}
          step={100}
          onChange={setMah}
          hint="Per cell pack — read from the battery label"
        />
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <Row label="Pack voltage" value={`${volts.toFixed(1)} V`} mono />
        <Row label="Capacity" value={`${(mAh / 1000).toFixed(2)} Ah`} mono />
        <Row
          label="Energy"
          value={`${wh.toFixed(1)} Wh`}
          mono
          highlight
        />
      </dl>

      <p
        className={`mt-5 border px-4 py-3 text-sm font-mono ${bandStyle}`}
        aria-live="polite"
      >
        <span className="block text-[0.65rem] uppercase tracking-widest opacity-70">
          IATA air travel
        </span>
        <span className="mt-1 block">{classification.label}</span>
      </p>

      <p className="mt-3 text-xs text-muted">
        Formula: Wh = (mAh ÷ 1000) × cells × {NOMINAL_V_PER_CELL} V nominal.
        Below 100 Wh: free. 100–160 Wh: airline approval. Above 160 Wh:
        forbidden in passenger cabin.
      </p>
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
