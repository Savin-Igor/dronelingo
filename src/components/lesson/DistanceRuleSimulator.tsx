"use client";

import { useMemo, useState } from "react";

// Distance-rule simulator. The pilot moves an altitude slider; the component
// shows what the minimum horizontal distance from uninvolved persons must
// be for each Open sub-category. Pedagogical purpose: the #1 student-fail
// topic per academy-vision.md §1.4 — the 1:1 rule and its 30 m floor.

type SubcatId = "a1-c0" | "a1-c1" | "a2-low" | "a2-normal" | "a3";

type Subcat = {
  id: SubcatId;
  label: string;
  /** Returns the required horizontal distance to uninvolved persons in metres,
   *  given the flight altitude. `null` = forbidden / not applicable here. */
  distanceFor: (altitudeM: number) => { min: number; note: string };
};

const SUBCATS: Subcat[] = [
  {
    id: "a1-c0",
    label: "A1 — C0 (<250 g)",
    distanceFor: () => ({
      min: 0,
      note: "Overflight of individuals OK · never over assemblies",
    }),
  },
  {
    id: "a1-c1",
    label: "A1 — C1 (<900 g)",
    distanceFor: () => ({
      min: 0,
      note: "Plan around people · no expected overflight",
    }),
  },
  {
    id: "a2-low",
    label: "A2 — C2 low-speed (≤ 3 m/s)",
    distanceFor: () => ({
      min: 5,
      note: "Activate low-speed mode BEFORE closing to 5 m",
    }),
  },
  {
    id: "a2-normal",
    label: "A2 — C2 normal speed",
    distanceFor: () => ({ min: 30, note: "Flat 30 m horizontal" }),
  },
  {
    id: "a3",
    label: "A3 — C2 / C3 / C4 / legacy",
    distanceFor: (altitude) => {
      // 1:1 rule, minimum floor 30 m.
      const oneToOne = Math.max(30, altitude);
      return {
        min: oneToOne,
        note:
          altitude <= 30
            ? "30 m floor applies — 1:1 not yet binding"
            : `1:1 rule active · ${altitude} m altitude → ${altitude} m distance`,
      };
    },
  },
];

export function DistanceRuleSimulator() {
  const [altitude, setAltitude] = useState(60);

  const rows = useMemo(
    () =>
      SUBCATS.map((s) => ({
        id: s.id,
        label: s.label,
        ...s.distanceFor(altitude),
      })),
    [altitude],
  );

  return (
    <section
      aria-label="Distance rule simulator"
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Interactive · distance from uninvolved persons
      </p>

      <div className="mt-4">
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
              Flight altitude (AGL)
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
            aria-label="Altitude in metres above ground"
            className="w-full accent-cyan-pulse"
          />
          <span className="flex justify-between font-mono text-[0.65rem] text-muted">
            <span>1 m</span>
            <span>60 m</span>
            <span>120 m ceiling</span>
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

      <p className="mt-5 text-xs text-muted">
        Remember: the 1:1 rule in A3 means horizontal distance ≥ flight
        altitude, with a 30 m floor. The crowd prohibition applies in every
        sub-category regardless of altitude or distance.
      </p>
    </section>
  );
}
