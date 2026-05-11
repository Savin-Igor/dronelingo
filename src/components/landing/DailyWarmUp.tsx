"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { isDue, readSRS } from "@/lib/srs";

// Reads the visitor's SRS state from localStorage, counts how many questions
// are due right now, and renders a "Daily warm-up" card if there are any.
//
// Designed to be a quiet, returning-visitor affordance:
//   - Hidden until hydrated (no SSR mismatch, no flash for first-timers).
//   - Hidden when there is nothing due — we never invent fake "tasks".
//   - Renders only the count + a single CTA → /practice/warmup.
//
// The component is self-contained: it does not depend on knowing the list
// of question externalIds at build time — it just walks whatever's in
// dronelingo:srs:v1. This means it adapts automatically as the question
// bank grows.
export function DailyWarmUp() {
  const t = useTranslations("warmUp");
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [totalSeen, setTotalSeen] = useState(0);

  function refresh() {
    const map = readSRS();
    const now = Date.now();
    const ids = Object.keys(map);
    let due = 0;
    for (const id of ids) {
      if (isDue(map[id], now)) due++;
    }
    setTotalSeen(ids.length);
    setDueCount(due);
  }

  useEffect(() => {
    refresh();
    if (typeof window === "undefined") return;
    const handler = () => refresh();
    window.addEventListener("dronelingo:srs-changed", handler);
    return () =>
      window.removeEventListener("dronelingo:srs-changed", handler);
  }, []);

  // Pre-hydration or visitor with no SRS state yet → render nothing.
  // First-time visitors should see the Hero, not a prompt about "your" reviews.
  if (dueCount === null || totalSeen === 0) return null;

  // Returning visitor, fully caught up — render nothing for now. (We can
  // surface a quieter "you're up to date" state in a follow-up if data
  // suggests users want the affirmation.)
  if (dueCount === 0) return null;

  return (
    <section
      aria-label={t("ariaLabel")}
      className="mx-auto mt-8 max-w-3xl px-6"
    >
      <div className="relative overflow-hidden border border-amber-400/40 bg-amber-400/5 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-amber-400"
        />
        <div className="pl-3">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-300">
            ◇ {t("kicker")}
          </p>
          <p className="mt-1 text-base font-semibold text-hud-white">
            {t("title", { count: dueCount })}
          </p>
          <p className="mt-1 text-xs text-telemetry">{t("subtitle")}</p>
        </div>
        <div className="mt-3 pl-3 sm:mt-0 sm:shrink-0 sm:pl-0">
          <Link
            href="/practice/warmup"
            className="inline-flex items-center justify-center border border-amber-400 bg-amber-400/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-200 transition-colors hover:bg-amber-400 hover:text-void"
          >
            {t("cta")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
