import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ExamHistorySection } from "@/components/exam/ExamHistorySection";
import {
  EXAM_DURATION_MIN,
  EXAM_PASS_THRESHOLD,
  EXAM_TOTAL_QUESTIONS,
} from "@/lib/exam";

export const dynamic = "force-dynamic";

export default async function ExamStart({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "exam" });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("subtitle")}</p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("rules.heading")}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>• {t("rules.questions")}</li>
          <li>• {t("rules.duration")}</li>
          <li>• {t("rules.threshold")}</li>
          <li>• {t("rules.navigation")}</li>
          <li>• {t("rules.anonymous")}</li>
        </ul>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-md bg-gray-50 p-3">
            <dt className="text-gray-500">Q</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {EXAM_TOTAL_QUESTIONS}
            </dd>
          </div>
          <div className="rounded-md bg-gray-50 p-3">
            <dt className="text-gray-500">⏱</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {EXAM_DURATION_MIN} min
            </dd>
          </div>
          <div className="rounded-md bg-gray-50 p-3">
            <dt className="text-gray-500">≥</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">
              {EXAM_PASS_THRESHOLD}%
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-end">
          <Link
            href="/exam/session"
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            {t("start")}
          </Link>
        </div>
      </section>

      <ExamHistorySection />
    </main>
  );
}
