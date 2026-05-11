/**
 * Per-topic SRS aggregation — pure functions.
 *
 * Given a topic's question externalId prefix + a SRS state map, produce
 * the stats needed to render the MasteryMap: total seen, due now, count
 * of "mastered" cards, and a rolled-up mastery ratio in [0, 1].
 *
 * No I/O, no React.
 */
import { isDue, type SRSCardState, type SRSMap } from "./index";

export type TopicMasteryInput = {
  /** Stable topic identifier — passed back in the output unchanged. */
  slug: string;
  /** Question externalId prefix, e.g. "as" for "as-001". */
  prefix: string;
  /** Total number of questions in the topic — denominator for mastery %. */
  totalQuestions: number;
};

export type TopicMasteryStats = {
  slug: string;
  totalQuestions: number;
  /** Questions the user has answered at least once. */
  seenCount: number;
  /** Questions whose SRS schedule says "due now". */
  dueCount: number;
  /** Questions considered "mastered" — see `isMastered`. */
  masteredCount: number;
  /** Rolled-up 0..1 score. Used for the bar fill + tier classification. */
  masteryRatio: number;
  /** Most recent review time across the topic (epoch ms), or 0. */
  lastReviewedAt: number;
  /** Pedagogical tier — drives colour and label. */
  tier: MasteryTier;
};

export type MasteryTier = "untouched" | "weak" | "learning" | "ready" | "mastered";

/**
 * "Mastered" means SM-2 has had enough successful runs to push the card
 * to a comfortable interval. We use the same threshold as a typical
 * Anki "young → mature" boundary: ≥ 3 successful repetitions AND an
 * ease factor that hasn't degraded much.
 */
export function isMastered(card: SRSCardState): boolean {
  return card.repetitions >= 3 && card.ef >= 2.3;
}

/**
 * Map a 0..1 mastery ratio to a tier. Thresholds chosen so that the user
 * sees movement quickly:
 *   0%       → untouched (no SRS state at all)
 *   < 25%    → weak
 *   < 60%    → learning
 *   < 90%    → ready
 *   ≥ 90%    → mastered
 *
 * The `untouched` tier is a special case (seenCount === 0) regardless
 * of ratio — used for topics the user has never opened.
 */
export function tierFor(stats: {
  seenCount: number;
  masteryRatio: number;
}): MasteryTier {
  if (stats.seenCount === 0) return "untouched";
  if (stats.masteryRatio >= 0.9) return "mastered";
  if (stats.masteryRatio >= 0.6) return "ready";
  if (stats.masteryRatio >= 0.25) return "learning";
  return "weak";
}

/**
 * Build mastery stats for a single topic.
 *
 * Filters the SRS map by externalId prefix — `<prefix>-` must appear at
 * the start of the questionId. Mastery ratio is `masteredCount /
 * totalQuestions` (denominator includes unseen questions, so seeing
 * progress requires both answering AND succeeding).
 */
export function buildTopicMastery(
  input: TopicMasteryInput,
  srs: SRSMap,
  now: number = Date.now(),
): TopicMasteryStats {
  const prefixMatch = `${input.prefix}-`;
  let seenCount = 0;
  let dueCount = 0;
  let masteredCount = 0;
  let lastReviewedAt = 0;

  for (const [id, card] of Object.entries(srs)) {
    if (!id.startsWith(prefixMatch)) continue;
    seenCount++;
    if (isDue(card, now)) dueCount++;
    if (isMastered(card)) masteredCount++;
    if (card.lastReviewedAt > lastReviewedAt) {
      lastReviewedAt = card.lastReviewedAt;
    }
  }

  const masteryRatio =
    input.totalQuestions > 0 ? masteredCount / input.totalQuestions : 0;

  return {
    slug: input.slug,
    totalQuestions: input.totalQuestions,
    seenCount,
    dueCount,
    masteredCount,
    masteryRatio,
    lastReviewedAt,
    tier: tierFor({ seenCount, masteryRatio }),
  };
}

/** Aggregate stats across all topics — used for the global header. */
export function buildOverallMastery(stats: TopicMasteryStats[]): {
  totalQuestions: number;
  seenCount: number;
  dueCount: number;
  masteredCount: number;
  masteryRatio: number;
} {
  const total = stats.reduce((n, s) => n + s.totalQuestions, 0);
  const seen = stats.reduce((n, s) => n + s.seenCount, 0);
  const due = stats.reduce((n, s) => n + s.dueCount, 0);
  const mastered = stats.reduce((n, s) => n + s.masteredCount, 0);
  return {
    totalQuestions: total,
    seenCount: seen,
    dueCount: due,
    masteredCount: mastered,
    masteryRatio: total > 0 ? mastered / total : 0,
  };
}
