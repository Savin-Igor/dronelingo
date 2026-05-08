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

  const readinessLabel =
    readiness === "ready"
      ? t("history.ready")
      : readiness === "almost"
        ? t("history.almostReady")
        : t("history.notReady");
  const readinessTone =
    readiness === "ready"
      ? "bg-green-50 text-green-900"
      : readiness === "almost"
        ? "bg-amber-50 text-amber-900"
        : "bg-gray-50 text-gray-700";

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {t("history.heading")}
      </h2>
      <p className={`mt-3 rounded-md p-3 text-sm ${readinessTone}`}>
        {readinessLabel}
      </p>
      <ul className="mt-4 divide-y divide-gray-100 text-sm">
        {recent.map((r) => {
          const percent = Math.round((r.correct / r.total) * 100);
          return (
            <li
              key={r.id}
              className="flex items-center justify-between py-2"
            >
              <span className="text-gray-500">
                {new Date(r.takenAt).toLocaleString()}
              </span>
              <span
                className={
                  r.passed
                    ? "font-medium text-green-700"
                    : "font-medium text-red-700"
                }
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
