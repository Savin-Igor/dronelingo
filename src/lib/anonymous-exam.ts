/**
 * Anonymous exam history + readiness gauge.
 *
 * Replaced by DB-backed `ExamResult` once NextAuth (#9) lands. On
 * first sign-in this list can be uploaded once and then cleared.
 */
const STORAGE_KEY = "dronelingo:exam-history:v1";

export type StoredExamResult = {
  id: string;
  takenAt: number;
  durationSec: number;
  total: number;
  correct: number;
  passed: boolean;
  perTopic: Record<
    string,
    { topicSlug: string; topicTitle: string; correct: number; total: number }
  >;
  missed: {
    questionId: string;
    /**
     * Stable per-content id (e.g. "as-001"). Optional for backward
     * compatibility with exam history written before the SRS link
     * was introduced; new exams always include it.
     */
    externalId?: string;
    topicSlug: string;
    topicTitle: string;
    stem: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    selectedOptionId: string | null;
    explanation: string;
    sourceRef: string;
  }[];
};

export function readExamHistory(): StoredExamResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredExamResult[]) : [];
  } catch {
    return [];
  }
}

export function writeExamResult(result: StoredExamResult): void {
  if (typeof window === "undefined") return;
  const all = readExamHistory();
  all.push(result);
  // Cap at 50 to keep localStorage bounded.
  const trimmed = all.slice(-50);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new Event("dronelingo:exam-history-changed"));
}

export function readLatestExamResult(): StoredExamResult | null {
  const all = readExamHistory();
  return all.length > 0 ? all[all.length - 1] : null;
}

export type Readiness = "ready" | "almost" | "not-ready" | "no-data";

export function computeReadiness(
  history: StoredExamResult[],
  threshold: number,
): Readiness {
  if (history.length === 0) return "no-data";
  const last3 = history.slice(-3);
  const percents = last3.map((h) => Math.round((h.correct / h.total) * 100));
  if (last3.length === 3 && percents.every((p) => p >= threshold)) {
    return "ready";
  }
  if (percents[percents.length - 1] >= threshold) return "almost";
  return "not-ready";
}
