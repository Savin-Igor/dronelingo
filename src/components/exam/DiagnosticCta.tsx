"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { readExamHistory } from "@/lib/anonymous-exam";
import { readSRS } from "@/lib/srs";

/**
 * Diagnostic CTA card on /exam.
 *
 * Shown only for visitors who have no SRS data yet AND no exam history.
 * Goal: nudge first-time visitors to take the 10-Q calibration so the
 * daily warm-up has something to work with. Returning visitors are
 * never shown this card.
 *
 * Renders nothing pre-hydration so SSR markup matches and we don't
 * flash the card for known-active users.
 */
export function DiagnosticCta() {
  const t = useTranslations("diagnostic.cta");
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    function refresh() {
      const srs = readSRS();
      const examHistory = readExamHistory();
      const blank =
        Object.keys(srs).length === 0 && examHistory.length === 0;
      setShow(blank);
    }
    refresh();
    const events = [
      "dronelingo:srs-changed",
      "dronelingo:exam-history-changed",
    ];
    for (const ev of events) window.addEventListener(ev, refresh);
    return () => {
      for (const ev of events) window.removeEventListener(ev, refresh);
    };
  }, []);

  if (show !== true) return null;

  return (
    <section
      aria-label={t("ariaLabel")}
      className="mt-6 overflow-hidden rounded-sm border border-amber-400/40 bg-amber-400/5"
    >
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-300">
            ◇ {t("kicker")}
          </p>
          <p className="mt-1 text-base font-semibold text-hud-white">
            {t("title")}
          </p>
          <p className="mt-1 text-xs text-telemetry">{t("subtitle")}</p>
        </div>
        <Link
          href="/exam/diagnostic"
          className="inline-flex shrink-0 items-center justify-center border border-amber-400 bg-amber-400/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-amber-200 transition-colors hover:bg-amber-400 hover:text-void"
        >
          {t("cta")} →
        </Link>
      </div>
    </section>
  );
}
