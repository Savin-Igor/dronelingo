import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";
import { Trainer, type TrainerQuestion } from "@/components/practice/Trainer";

export const dynamic = "force-dynamic";

type RawOption = { id: string; text: Record<string, string> };

function localizeOptions(value: unknown, locale: string): TrainerQuestion["options"] {
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
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← {t("title")}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-gray-900">
        {localize(topic.title, locale)}
      </h1>
      <p className="mt-2 text-sm text-gray-500">{t("anonymousNote")}</p>

      {questions.length === 0 ? (
        <p className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
          {t("noQuestions")}
        </p>
      ) : (
        <Trainer questions={questions} />
      )}
    </main>
  );
}
