"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  computeReadiness,
  readExamHistory,
  type StoredExamResult,
} from "@/lib/anonymous-exam";
import { EXAM_READINESS_THRESHOLD } from "@/lib/exam";

export function ExamHistorySection() {
  const t = useTranslations("exam");
  const [history, setHistory] = useState<StoredExamResult[]>([]);

  useEffect(() => {
    setHistory(readExamHistory());
    function refresh() {
      setHistory(readExamHistory());
    }
    window.addEventListener("dronelingo:exam-history-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("dronelingo:exam-history-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const readiness = computeReadiness(history, EXAM_READINESS_THRESHOLD);
  const recent = history.slice(-5).reverse();

  if (history.length === 0) {
    return null;
  }

  const readinessTone =
    readiness === "ready"
      ? "border-l-2 border-green-clear bg-green-clear/10 text-green-clear"
      : readiness === "almost"
        ? "border-l-2 border-amber-alert bg-amber-alert/10 text-amber-alert"
        : "border-l-2 border-horizon bg-hull text-telemetry";

  const readinessLabel =
    readiness === "ready"
      ? t("history.ready")
      : readiness === "almost"
        ? t("history.almostReady")
        : t("history.notReady");

  return (
    <section className="mt-4 rounded-sm border border-horizon bg-cockpit p-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        {t("history.heading")}
      </h2>

      <div className={`mt-4 p-3 text-sm ${readinessTone}`}>
        {readinessLabel}
      </div>

      <ul className="mt-4 divide-y divide-horizon text-sm">
        {recent.map((r) => {
          const percent = Math.round((r.correct / r.total) * 100);
          return (
            <li
              key={r.id}
              className="flex items-center justify-between py-2.5"
            >
              <span className="font-mono text-xs text-muted">
                {new Date(r.takenAt).toLocaleDateString()}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${
                  r.passed ? "text-green-clear" : "text-red-danger"
                }`}
              >
                {r.correct}/{r.total} ({percent}%)
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
