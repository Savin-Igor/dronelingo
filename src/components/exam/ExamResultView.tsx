"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  readLatestExamResult,
  type StoredExamResult,
} from "@/lib/anonymous-exam";
import { EXAM_PASS_THRESHOLD } from "@/lib/exam";

export function ExamResultView() {
  const t = useTranslations("exam");
  const [result, setResult] = useState<StoredExamResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setResult(readLatestExamResult());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!result) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">{t("noResult")}</p>
        <Link
          href="/exam"
          className="mt-6 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {t("retake")}
        </Link>
      </section>
    );
  }

  const percent = Math.round((result.correct / result.total) * 100);
  const headline = result.passed
    ? t("passed", { percent })
    : t("failed", { percent });
  const minutes = Math.max(1, Math.round(result.durationSec / 60));
  const perTopic = Object.values(result.perTopic);

  return (
    <>
      <section
        className={`rounded-xl border p-8 text-center ${
          result.passed
            ? "border-green-300 bg-green-50"
            : "border-red-300 bg-red-50"
        }`}
      >
        <p
          className={`text-2xl font-semibold ${
            result.passed ? "text-green-900" : "text-red-900"
          }`}
        >
          {headline}
        </p>
        <p className="mt-3 text-sm text-gray-700">
          {t("score", { correct: result.correct, total: result.total })} ·{" "}
          {t("thresholdLabel", { threshold: EXAM_PASS_THRESHOLD })} ·{" "}
          {t("durationLabel", { minutes })}
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t("perTopic")}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {perTopic.map((row) => {
            const ratio =
              row.total === 0 ? 0 : Math.round((row.correct / row.total) * 100);
            return (
              <li
                key={row.topicSlug}
                className="flex items-center justify-between gap-4"
              >
                <span className="flex-1 text-gray-700">{row.topicTitle}</span>
                <span className="text-gray-500">
                  {t("perTopicScore", {
                    correct: row.correct,
                    total: row.total,
                  })}
                </span>
                <div
                  className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100"
                  aria-hidden
                >
                  <div
                    className={`h-full ${
                      ratio >= EXAM_PASS_THRESHOLD
                        ? "bg-green-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t("missed")}</h2>
        {result.missed.length === 0 ? (
          <p className="mt-3 text-sm text-green-700">{t("noMisses")}</p>
        ) : (
          <ul className="mt-4 space-y-6 text-sm">
            {result.missed.map((m) => {
              const correctOpt = m.options.find(
                (o) => o.id === m.correctOptionId,
              );
              const selectedOpt = m.options.find(
                (o) => o.id === m.selectedOptionId,
              );
              return (
                <li
                  key={m.questionId}
                  className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {m.topicTitle}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">{m.stem}</p>
                  <div className="mt-3 space-y-1.5">
                    <p className="rounded-md bg-green-50 p-2 text-green-900">
                      ✓ {correctOpt ? correctOpt.text : m.correctOptionId}
                    </p>
                    {selectedOpt && (
                      <p className="rounded-md bg-red-50 p-2 text-red-900">
                        ✗ {selectedOpt.text}
                      </p>
                    )}
                  </div>
                  <p className="mt-3 text-gray-700">{m.explanation}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {t("source")}: {m.sourceRef}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {result.passed && (
          <Link
            href="/claim"
            className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-500"
          >
            {t("claimCta")} →
          </Link>
        )}
        <Link
          href="/exam"
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {t("retake")}
        </Link>
      </div>
    </>
  );
}
