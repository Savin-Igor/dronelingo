import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/localize";

export const EXAM_TOTAL_QUESTIONS = 40;
export const EXAM_DURATION_MIN = 40;
export const EXAM_PASS_THRESHOLD = 75;
export const EXAM_READINESS_THRESHOLD = 80;

/**
 * Official A1/A3 mock-exam stratification.
 *
 * Mirrors the CAA Latvia online exam composition (40 questions / 40 min /
 * ≥ 75 %) captured in `.claude/plans/academy-vision.md` §4.5. Adjust this
 * table — not the function below — to retune the mock to match changes
 * in the official spec.
 *
 * Sum of weights = EXAM_TOTAL_QUESTIONS (= 40).
 *
 * Topics not in this map (currently: `meteorology`, which belongs to the
 * A2 track) are not pulled into the A1/A3 mock. A2 / STS mocks will get
 * their own tables when those tracks ship.
 */
export const A1A3_STRATIFICATION: Record<string, number> = {
  "air-safety": 7,
  "airspace-limitations": 5,
  "aviation-regulation": 5,
  "human-performance": 4,
  "operational-procedures": 5,
  "uas-general-knowledge": 5,
  privacy: 3,
  insurance: 3,
  security: 3,
};

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
 * Build a 40-question A1/A3 mock exam using the official CAA Latvia
 * stratification (see {@link A1A3_STRATIFICATION}).
 *
 * Process:
 *   1. Load the topics named in the stratification map.
 *   2. For each topic, randomly pick its weighted share of questions.
 *   3. If a topic's bank is short, the shortfall is redistributed by
 *      filling from the remaining pool of A1/A3 questions across the
 *      same map — so a small bank never returns < 40 questions.
 *   4. Final shuffle so topic blocks don't appear in order.
 *
 * The final list always has EXAM_TOTAL_QUESTIONS items as long as the
 * combined A1/A3 bank has ≥ 40 questions. Topics outside the map
 * (meteorology and future tracks) are never pulled in.
 */
export async function buildStratifiedExam(
  locale: string,
): Promise<ExamQuestion[]> {
  const targetSlugs = Object.keys(A1A3_STRATIFICATION);
  const topics = await prisma.topic.findMany({
    where: { slug: { in: targetSlugs } },
    orderBy: { ord: "asc" },
    include: { questions: true },
  });

  const picked: ExamQuestion[] = [];
  const leftovers: ExamQuestion[] = [];

  for (const topic of topics) {
    const want = A1A3_STRATIFICATION[topic.slug] ?? 0;
    if (want === 0 || topic.questions.length === 0) continue;

    const topicTitle = localize(topic.title, locale);
    const all = topic.questions.map<ExamQuestion>((q) => ({
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

    const take = Math.min(want, all.length);
    picked.push(...all.slice(0, take));
    leftovers.push(...all.slice(take));
  }

  // Redistribute any shortfall (e.g. a topic with fewer questions than its
  // target weight) by drawing from leftovers across the same A1/A3 scope.
  if (picked.length < EXAM_TOTAL_QUESTIONS) {
    const need = EXAM_TOTAL_QUESTIONS - picked.length;
    shuffleInPlace(leftovers);
    picked.push(...leftovers.slice(0, Math.min(need, leftovers.length)));
  }

  return shuffleInPlace(picked.slice(0, EXAM_TOTAL_QUESTIONS));
}
