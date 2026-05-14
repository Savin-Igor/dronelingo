/**
 * Diagnostic builder — short calibration test that bootstraps the SRS
 * schedule for a first-time visitor by surfacing one or two questions
 * per A1/A3 topic.
 *
 * Output is a 10-question stratified pick (see DIAGNOSTIC_TABLE):
 *   air-safety            ×2  (highest official weight, so we double up)
 *   airspace-limitations  ×1
 *   aviation-regulation   ×1
 *   human-performance     ×1
 *   operational-procedures ×1
 *   uas-general-knowledge ×1
 *   privacy               ×1
 *   insurance             ×1
 *   security              ×1
 *
 * Selection: random within each topic. Result is shuffled so topic
 * blocks don't appear in order during the session. Excludes meteorology
 * and any future-track topics by construction.
 */
import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/localize";

export const DIAGNOSTIC_TOTAL_QUESTIONS = 10;

export const DIAGNOSTIC_TABLE: Record<string, number> = {
  "air-safety": 2,
  "airspace-limitations": 1,
  "aviation-regulation": 1,
  "human-performance": 1,
  "operational-procedures": 1,
  "uas-general-knowledge": 1,
  privacy: 1,
  insurance: 1,
  security: 1,
};

export type DiagnosticQuestion = {
  id: string;
  externalId: string;
  topicSlug: string;
  topicTitle: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  sourceRef: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

type RawOption = { id: string; text: Record<string, string> };

function localizeOptions(value: unknown, locale: string) {
  if (!Array.isArray(value)) return [] as DiagnosticQuestion["options"];
  return (value as RawOption[]).map((opt) => ({
    id: opt.id,
    text: localize(opt.text, locale),
  }));
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function buildDiagnostic(
  locale: string,
): Promise<DiagnosticQuestion[]> {
  const targetSlugs = Object.keys(DIAGNOSTIC_TABLE);
  const topics = await prisma.topic.findMany({
    where: { slug: { in: targetSlugs } },
    orderBy: { ord: "asc" },
    include: { questions: true },
  });

  const picked: DiagnosticQuestion[] = [];
  for (const topic of topics) {
    const want = DIAGNOSTIC_TABLE[topic.slug] ?? 0;
    if (want === 0 || topic.questions.length === 0) continue;
    const topicTitle = localize(topic.title, locale);
    const all = topic.questions.map<DiagnosticQuestion>((q) => ({
      id: q.id,
      externalId: q.externalId,
      topicSlug: topic.slug,
      topicTitle,
      stem: localize(q.stem, locale),
      options: localizeOptions(q.options, locale),
      correctOptionId: q.correctOptionId,
      explanation: localize(q.explanation, locale),
      sourceRef: q.sourceRef,
      imageUrl: q.imageUrl,
      imageAlt: q.imageAlt ? localize(q.imageAlt, locale) : null,
    }));
    shuffleInPlace(all);
    picked.push(...all.slice(0, Math.min(want, all.length)));
  }

  return shuffleInPlace(picked);
}
