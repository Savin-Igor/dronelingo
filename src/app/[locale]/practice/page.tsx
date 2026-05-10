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
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Drills
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      <ul className="mt-8 divide-y divide-horizon rounded-sm border border-horizon">
        {topics.map((topic, i) => {
          const count = topic._count.questions;
          const disabled = count === 0;
          return (
            <li key={topic.id}>
              {disabled ? (
                <div className="flex items-center justify-between p-5 opacity-30">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-hud-white">
                        {localize(topic.title, locale)}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        {t("noQuestions")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/practice/${topic.slug}`}
                  className="flex items-center justify-between p-5 transition-colors hover:bg-hull/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-hud-white">
                        {localize(topic.title, locale)}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        {t("questionCount", { count })}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted" aria-hidden>
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
