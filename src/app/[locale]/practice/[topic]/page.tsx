import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";
import { Trainer, type TrainerQuestion } from "@/components/practice/Trainer";

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

export default async function PracticeTopicPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic: topicSlug } = await params;
  const t = await getTranslations({ locale, namespace: "practice" });

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { questions: { orderBy: { externalId: "asc" } } },
  });
  if (!topic) notFound();

  const questions: TrainerQuestion[] = topic.questions.map((q) => ({
    id: q.id,
    externalId: q.externalId,
    stem: localize(q.stem, locale),
    options: localizeOptions(q.options, locale),
    correctOptionId: q.correctOptionId,
    explanation: localize(q.explanation, locale),
    sourceRef: q.sourceRef,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/practice"
        className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
      >
        ← {t("title")}
      </Link>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Drills
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-hud-white">
        {localize(topic.title, locale)}
      </h1>
      <p className="mt-2 font-mono text-xs text-muted">{t("anonymousNote")}</p>

      {questions.length === 0 ? (
        <p className="mt-8 rounded-sm border border-horizon bg-cockpit p-6 text-center text-sm text-telemetry">
          {t("noQuestions")}
        </p>
      ) : (
        <Trainer questions={questions} />
      )}
    </main>
  );
}
