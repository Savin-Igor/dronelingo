import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { WarmUpClient } from "@/components/practice/WarmUpClient";
import { type TrainerQuestion } from "@/components/practice/Trainer";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type RawOption = { id: string; text: Record<string, string> };

function localizeOptions(
  value: unknown,
  locale: string,
): TrainerQuestion["options"] {
  if (!Array.isArray(value)) return [];
  return (value as RawOption[]).map((opt) => ({
    id: opt.id,
    text: localize(opt.text, locale),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warmUp" });
  return buildMetadata({
    locale,
    path: "/practice/warmup",
    title: `${t("pageTitle")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default async function WarmUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warmUp" });
  const tPractice = await getTranslations({
    locale,
    namespace: "practice",
  });

  // Load every question across every topic. Access filtering happens
  // client-side in WarmUpClient (paid → all, free → air-safety only).
  const questions = await prisma.question.findMany({
    orderBy: { externalId: "asc" },
    include: { topic: { select: { slug: true } } },
  });

  const pool = questions.map((q) => ({
    id: q.id,
    externalId: q.externalId,
    stem: localize(q.stem, locale),
    options: localizeOptions(q.options, locale),
    correctOptionId: q.correctOptionId,
    explanation: localize(q.explanation, locale),
    sourceRef: q.sourceRef,
    topicSlug: q.topic.slug,
    imageUrl: q.imageUrl,
    imageAlt: q.imageAlt ? localize(q.imageAlt, locale) : null,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/practice"
        className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
      >
        ← {tPractice("title")}
      </Link>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-amber-300">
        ◇ {t("kicker")}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {t("pageTitle")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      <WarmUpClient pool={pool} />
    </main>
  );
}
