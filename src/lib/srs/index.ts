/**
 * Anonymous SRS state — public API.
 *
 * Per-user SRS state is keyed by question externalId (e.g. "as-001"). Storage
 * is localStorage under `dronelingo:srs:v1`. Once NextAuth lands, this map
 * uploads once on first sign-in and is cleared (same migration pattern as
 * `dronelingo:attempts:v1` and `dronelingo:lesson-progress:v1`).
 *
 * Custom event: writes dispatch `dronelingo:srs-changed` so multi-tab views
 * stay in sync.
 */
import { initialState, isDue, review, type Quality, type SRSCardState } from "./sm2";

export type SRSMap = Record<string, SRSCardState>;

const STORAGE_KEY = "dronelingo:srs:v1";
const CHANGED_EVENT = "dronelingo:srs-changed";

export { initialState, isDue, review, type Quality, type SRSCardState };

function readMap(): SRSMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as SRSMap)
      : {};
  } catch {
    return {};
  }
}

function writeMap(map: SRSMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** Read the full SRS state map. */
export function readSRS(): SRSMap {
  return readMap();
}

/** Read state for a single question. Returns initial state if unseen. */
export function getCard(questionId: string): SRSCardState {
  const map = readMap();
  return map[questionId] ?? initialState();
}

/**
 * Record an answer outcome. Binary correct/wrong is mapped to SM-2 quality:
 *   correct → 4 (normal recall)
 *   wrong   → 1 (clear failure — resets repetitions, 1-day penalty)
 *
 * If a finer "easy / hard" affordance is added in the UI later, prefer
 * `recordWithQuality()` directly.
 */
export function recordAnswer(
  questionId: string,
  outcome: "correct" | "wrong",
  now: number = Date.now(),
): SRSCardState {
  const quality: Quality = outcome === "correct" ? 4 : 1;
  return recordWithQuality(questionId, quality, now);
}

export function recordWithQuality(
  questionId: string,
  quality: Quality,
  now: number = Date.now(),
): SRSCardState {
  const map = readMap();
  const prev = map[questionId] ?? initialState(now);
  const next = review(prev, quality, now);
  map[questionId] = next;
  writeMap(map);
  return next;
}

/** Question ids whose SRS state is due for review at `now`. */
export function dueQuestionIds(
  questionIds: string[],
  now: number = Date.now(),
): string[] {
  const map = readMap();
  return questionIds.filter((id) => {
    const state = map[id];
    // Unseen questions are implicitly due (fresh learners see them first).
    if (!state) return true;
    return isDue(state, now);
  });
}

/** Clear all SRS state — used after one-shot migration to the server. */
export function clearSRS(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export const SRS_STORAGE_KEY = STORAGE_KEY;
export const SRS_CHANGED_EVENT = CHANGED_EVENT;
