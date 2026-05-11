"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

// UAS class C0–C6 comparator. Tabs across the classes; live readout of MTOM,
// speed, allowed subcategory, and key restriction. Pedagogical purpose: the
// #3 student-fail topic per academy-vision.md §1.4 — confusion between class
// (C0–C6) and subcategory (A1/A2/A3).

type ClassId = "C0" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

type ClassStatic = {
  id: ClassId;
  mtom: string;
  maxSpeed: string | null; // null → resolve from translations (manualOnly / dash)
  subcategory: string;
  remoteId: boolean;
  geoAwareness: boolean;
};

const CLASSES: ClassStatic[] = [
  { id: "C0", mtom: "< 250 g", maxSpeed: "19 m/s", subcategory: "A1", remoteId: false, geoAwareness: false },
  { id: "C1", mtom: "< 900 g", maxSpeed: "19 m/s", subcategory: "A1", remoteId: true, geoAwareness: true },
  { id: "C2", mtom: "< 4 kg", maxSpeed: null, subcategory: "A2 / A3", remoteId: true, geoAwareness: true },
  { id: "C3", mtom: "< 25 kg", maxSpeed: null, subcategory: "A3", remoteId: true, geoAwareness: true },
  { id: "C4", mtom: "< 25 kg", maxSpeed: "manualOnly", subcategory: "A3", remoteId: false, geoAwareness: false },
  { id: "C5", mtom: "retrofitKit", maxSpeed: null, subcategory: "STS-01", remoteId: true, geoAwareness: true },
  { id: "C6", mtom: "bvlosCapable", maxSpeed: null, subcategory: "STS-02", remoteId: true, geoAwareness: true },
];

export function ClassComparator() {
  const t = useTranslations("lessonWidgets.classComparator");
  const [active, setActive] = useState<ClassId>("C0");
  const current = CLASSES.find((c) => c.id === active)!;

  // Resolve MTOM/maxSpeed values that are translation keys
  const mtomVal =
    current.mtom === "retrofitKit"
      ? t("retrofitKit")
      : current.mtom === "bvlosCapable"
        ? t("bvlosCapable")
        : current.mtom;
  const maxSpeedVal =
    current.maxSpeed === null
      ? t("dash")
      : current.maxSpeed === "manualOnly"
        ? t("manualOnly")
        : current.maxSpeed;

  return (
    <section
      aria-label={t("heading")}
      className="not-prose my-10 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        {t("heading")}
      </p>

      <div
        role="tablist"
        aria-label={t("tabsAriaLabel")}
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
        <Row label={t("mtom")} value={mtomVal} />
        <Row label={t("maxSpeed")} value={maxSpeedVal} />
        <Row label={t("subcategory")} value={current.subcategory} accent />
        <Row
          label={t("remoteId")}
          value={current.remoteId ? t("required") : t("notRequired")}
        />
        <Row
          label={t("geoAwareness")}
          value={current.geoAwareness ? t("required") : t("notRequired")}
        />
        <Row
          label={t("keyRestriction")}
          value={t(`classes.${current.id}.restriction`)}
          wide
        />
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
