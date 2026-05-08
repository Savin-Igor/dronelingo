import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "practice" });
  return buildMetadata({
    locale,
    path: "/practice",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function PracticeIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "practice" });

  const topics = await prisma.topic.findMany({
    orderBy: { ord: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("subtitle")}</p>

      <ul className="mt-8 space-y-3">
        {topics.map((topic) => {
          const count = topic._count.questions;
          const disabled = count === 0;
          return (
            <li
              key={topic.id}
              className="rounded-lg border border-gray-200 bg-white"
            >
              {disabled ? (
                <div className="flex items-center justify-between p-5 opacity-50">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {localize(topic.title, locale)}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("noQuestions")}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/practice/${topic.slug}`}
                  className="flex items-center justify-between p-5 hover:bg-gray-50"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {localize(topic.title, locale)}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("questionCount", { count })}
                    </p>
                  </div>
                  <span aria-hidden className="text-gray-400">
                    →
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
