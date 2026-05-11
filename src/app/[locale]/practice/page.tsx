import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  MasteryMap,
  type MasteryMapTopic,
} from "@/components/practice/MasteryMap";
import { FREE_TOPIC_SLUG } from "@/lib/access";
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
    include: {
      _count: { select: { questions: true } },
      // One question per topic just to extract the externalId prefix
      // (e.g. "as" from "as-001"). The MasteryMap needs the prefix to
      // partition the visitor's SRS state by topic.
      questions: {
        orderBy: { externalId: "asc" },
        take: 1,
        select: { externalId: true },
      },
    },
  });

  const masteryTopics: MasteryMapTopic[] = topics
    .filter((tp) => tp._count.questions > 0)
    .map((tp) => {
      const firstId = tp.questions[0]?.externalId ?? "";
      const prefix = firstId.includes("-") ? firstId.split("-")[0] : tp.slug;
      return {
        slug: tp.slug,
        title: localize(tp.title, locale),
        prefix,
        totalQuestions: tp._count.questions,
        free: tp.slug === FREE_TOPIC_SLUG,
      };
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

      <div className="mt-8">
        <MasteryMap topics={masteryTopics} />
      </div>

      <ul className="divide-y divide-horizon rounded-sm border border-horizon">
        {topics.map((topic, i) => {
          const count = topic._count.questions;
          const disabled = count === 0;
          const free = topic.slug === FREE_TOPIC_SLUG;
          const href = free ? `/practice/${topic.slug}` : "/pricing";

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
                  href={href}
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
                  <div className="flex items-center gap-2">
                    {free ? (
                      <span className="rounded-sm border border-green-clear/30 bg-green-clear/10 px-1.5 py-0.5 font-mono text-xs text-green-clear">
                        FREE
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-muted">🔒</span>
                    )}
                    <span className="font-mono text-xs text-muted" aria-hidden>
                      →
                    </span>
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
