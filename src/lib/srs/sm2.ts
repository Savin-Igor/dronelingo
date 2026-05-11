/**
 * SM-2 spaced repetition algorithm.
 *
 * Pure functions only — no I/O, no storage. The algorithm decides the next
 * review interval for a question given the user's most recent quality of
 * recall.
 *
 * Reference: Wozniak, P. A. (1990). SuperMemo algorithm SM-2.
 *
 * Quality scale (0–5):
 *   5 — perfect, easy recall
 *   4 — correct, normal recall
 *   3 — correct, hard recall
 *   2 — incorrect, but felt close
 *   1 — incorrect, clearly wrong
 *   0 — complete blackout
 *
 * For the practice trainer (binary correct/wrong) we map:
 *   correct  → quality 4
 *   wrong    → quality 1
 *
 * If a lesson mini-quiz or "I knew this" affordance is added later, it can
 * supply quality 5 / 3 directly.
 */

export type SRSCardState = {
  /** Ease factor — controls how aggressively intervals grow. Starts at 2.5. */
  ef: number;
  /** Next-review interval in days. */
  interval: number;
  /** Successive correct repetitions. Reset to 0 on failure. */
  repetitions: number;
  /** Unix epoch ms — when this card is next due for review. */
  dueAt: number;
  /** Unix epoch ms — when this card was last reviewed. */
  lastReviewedAt: number;
};

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

const MIN_EF = 1.3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function initialState(now: number = Date.now()): SRSCardState {
  return {
    ef: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: now,
    lastReviewedAt: 0,
  };
}

/**
 * Apply an answer to a card and return the new state.
 *
 * The standard SM-2 update:
 *   - quality < 3 (failure):
 *       repetitions := 0
 *       interval := 1 (one-day penalty before next attempt)
 *   - quality ≥ 3 (success):
 *       repetitions == 0 → interval := 1
 *       repetitions == 1 → interval := 6
 *       repetitions ≥ 2 → interval := round(prevInterval × ef)
 *
 * Ease factor update (applied in both success and failure):
 *   ef := ef + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))
 *   clamped to MIN_EF.
 */
export function review(
  prev: SRSCardState,
  quality: Quality,
  now: number = Date.now(),
): SRSCardState {
  // Ease factor update.
  const q = quality;
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const nextEf = Math.max(MIN_EF, prev.ef + efDelta);

  let nextRepetitions: number;
  let nextIntervalDays: number;

  if (quality < 3) {
    nextRepetitions = 0;
    nextIntervalDays = 1;
  } else {
    nextRepetitions = prev.repetitions + 1;
    if (nextRepetitions === 1) nextIntervalDays = 1;
    else if (nextRepetitions === 2) nextIntervalDays = 6;
    else nextIntervalDays = Math.round(prev.interval * prev.ef);
    if (nextIntervalDays < 1) nextIntervalDays = 1;
  }

  return {
    ef: nextEf,
    interval: nextIntervalDays,
    repetitions: nextRepetitions,
    dueAt: now + nextIntervalDays * DAY_MS,
    lastReviewedAt: now,
  };
}

/** Convenience: is this card due for review at `now`? */
export function isDue(state: SRSCardState, now: number = Date.now()): boolean {
  return state.dueAt <= now;
}
