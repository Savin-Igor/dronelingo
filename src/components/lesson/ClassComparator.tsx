"use client";

import { useState } from "react";

// UAS class C0–C6 comparator. Tabs across the classes; live readout of MTOM,
// speed, allowed subcategory, and key restriction. Pedagogical purpose: the
// #3 student-fail topic per academy-vision.md §1.4 — confusion between class
// (C0–C6) and subcategory (A1/A2/A3).

type UASClass = {
  id: "C0" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  mtom: string;
  maxSpeed: string;
  subcategory: string;
  restriction: string;
  remoteId: boolean;
  geoAwareness: boolean;
};

const CLASSES: UASClass[] = [
  {
    id: "C0",
    mtom: "< 250 g",
    maxSpeed: "19 m/s",
    subcategory: "A1",
    restriction: "Over individuals OK · never over assemblies",
    remoteId: false,
    geoAwareness: false,
  },
  {
    id: "C1",
    mtom: "< 900 g",
    maxSpeed: "19 m/s",
    subcategory: "A1",
    restriction: "No expected overflight of uninvolved persons",
    remoteId: true,
    geoAwareness: true,
  },
  {
    id: "C2",
    mtom: "< 4 kg",
    maxSpeed: "—",
    subcategory: "A2 or A3",
    restriction: "Low-speed mode (≤ 3 m/s) → 5 m · normal → 30 m",
    remoteId: true,
    geoAwareness: true,
  },
  {
    id: "C3",
    mtom: "< 25 kg",
    maxSpeed: "—",
    subcategory: "A3",
    restriction: "≥ 150 m from inhabited areas · ≥ 30 m or 1:1 from people",
    remoteId: true,
    geoAwareness: true,
  },
  {
    id: "C4",
    mtom: "< 25 kg",
    maxSpeed: "manual only",
    subcategory: "A3",
    restriction: "No autonomous modes — manual control only",
    remoteId: false,
    geoAwareness: false,
  },
  {
    id: "C5",
    mtom: "retrofit kit",
    maxSpeed: "—",
    subcategory: "STS-01",
    restriction: "VLOS, controlled ground area, airspace observers",
    remoteId: true,
    geoAwareness: true,
  },
  {
    id: "C6",
    mtom: "BVLOS-capable",
    maxSpeed: "—",
    subcategory: "STS-02",
    restriction: "BVLOS over sparsely populated · observer chain required",
    remoteId: true,
    geoAwareness: true,
  },
];

export function ClassComparator() {
  const [active, setActive] = useState<UASClass["id"]>("C0");
  const current = CLASSES.find((c) => c.id === active)!;

  return (
    <section
      aria-label="UAS class comparator"
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Interactive · UAS class comparator
      </p>

      <div
        role="tablist"
        aria-label="UAS classes"
        className="mt-4 flex flex-wrap gap-1.5"
      >
        {CLASSES.map((c) => {
          const isActive = c.id === active;
          return (
            <button
              key={c.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(c.id)}
              className={`min-w-[3.5rem] border px-3 py-1.5 font-mono text-sm transition-colors ${
                isActive
                  ? "border-cyan-pulse bg-cyan-pulse/10 text-hud-white"
                  : "border-horizon bg-hull/60 text-telemetry hover:border-signal hover:text-hud-white"
              }`}
            >
              {c.id}
            </button>
          );
        })}
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Row label="MTOM" value={current.mtom} />
        <Row label="Max speed" value={current.maxSpeed} />
        <Row label="Subcategory" value={current.subcategory} accent />
        <Row
          label="Remote ID"
          value={current.remoteId ? "Required" : "Not required"}
        />
        <Row
          label="Geo-awareness"
          value={current.geoAwareness ? "Required" : "Not required"}
        />
        <Row label="Key restriction" value={current.restriction} wide />
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  accent,
  wide,
}: {
  label: string;
  value: string;
  accent?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 border-t border-horizon pt-2 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        {label}
      </dt>
      <dd
        className={`text-sm ${accent ? "font-semibold text-cyan-pulse" : "text-hud-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}
