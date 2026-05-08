import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/localize";

export const EXAM_TOTAL_QUESTIONS = 40;
export const EXAM_DURATION_MIN = 40;
export const EXAM_PASS_THRESHOLD = 75;
export const EXAM_READINESS_THRESHOLD = 80;
export const PER_TOPIC_FLOOR = 4;

export type ExamQuestion = {
  id: string;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  sourceRef: string;
};

type RawOption = { id: string; text: Record<string, string> };

function localizeOptions(value: unknown, locale: string): ExamQuestion["options"] {
  if (!Array.isArray(value)) return [];
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

/**
 * Build a 40-question exam covering every topic that has questions.
 *
 * Picks PER_TOPIC_FLOOR (4) random questions per topic, then fills the
 * remaining slots from a shared random pool. If the bank is too small
 * to satisfy the floor for every topic, returns whatever can be
 * stratified — the caller is responsible for surfacing this.
 */
export async function buildStratifiedExam(
  locale: string,
): Promise<ExamQuestion[]> {
  const topics = await prisma.topic.findMany({
    orderBy: { ord: "asc" },
    include: { questions: true },
  });

  const stratified: ExamQuestion[] = [];
  const remainingPool: ExamQuestion[] = [];

  for (const topic of topics) {
    if (topic.questions.length === 0) continue;
    const topicTitle = localize(topic.title, locale);
    const all = topic.questions.map((q) => ({
      id: q.id,
      topicId: topic.id,
      topicSlug: topic.slug,
      topicTitle,
      stem: localize(q.stem, locale),
      options: localizeOptions(q.options, locale),
      correctOptionId: q.correctOptionId,
      explanation: localize(q.explanation, locale),
      sourceRef: q.sourceRef,
    }));
    shuffleInPlace(all);
    const floor = Math.min(PER_TOPIC_FLOOR, all.length);
    stratified.push(...all.slice(0, floor));
    remainingPool.push(...all.slice(floor));
  }

  if (stratified.length >= EXAM_TOTAL_QUESTIONS) {
    return shuffleInPlace(stratified.slice(0, EXAM_TOTAL_QUESTIONS));
  }

  const need = EXAM_TOTAL_QUESTIONS - stratified.length;
  shuffleInPlace(remainingPool);
  const fill = remainingPool.slice(0, Math.min(need, remainingPool.length));
  return shuffleInPlace([...stratified, ...fill]);
}
