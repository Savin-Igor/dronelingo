/**
 * Pilot rank progression — pure functions.
 *
 * Tiers are tied to demonstrated competence, not vanity points (per
 * academy-vision.md §5.1). No XP, no leaderboards, no streak coercion.
 * A rank is computed from a small set of measurable inputs the user
 * already produces in everyday use of the platform.
 *
 * For Wave 2 we cover the A1/A3 track only. A2 / STS tiers ship with
 * those tracks.
 */

export type RankId =
  | "recruit"
  | "cadet"
  | "pilotReady"
  | "certified";

export type CriterionId =
  | "lessonsVisited"
  | "recentMockPasses"
  | "topicsAt70"
  | "hasCertificate";

export type Criterion = {
  id: CriterionId;
  /** Whether this criterion is currently satisfied. */
  met: boolean;
  /** Numeric progress in [0, 1] — for partial-credit rendering. */
  progress: number;
  /** Snapshot values used to compute progress, useful for debug + UI hints. */
  current: number;
  target: number;
};

export type RankInputs = {
  /** Distinct lessons the user has visited. */
  lessonsVisitedCount: number;
  /**
   * Mock exam history within the last 7 days (epoch ms). The function
   * sees only the scores; it does not care which exam is which.
   */
  recentMockScores: number[];
  /** Per-topic mastery ratios in [0, 1]. Order does not matter. */
  topicMastery: number[];
  /** Does the user hold an A1/A3 certificate locally? */
  hasCertificate: boolean;
  /** Total number of A1/A3 topics in scope (denominator for topic gate). */
  totalTopics: number;
};

/** Static thresholds. Single place to retune the curve. */
export const RANK_TARGETS = {
  cadetLessons: 3,
  readyMockScoreFloor: 85,
  readyMockCount: 2,
  readyTopicMasteryFloor: 0.7,
};

export type RankSnapshot = {
  current: RankId;
  /** Next rank to aim for, or null if certified. */
  next: RankId | null;
  /** Criteria for the *next* rank. */
  criteria: Criterion[];
  /** Aggregate progress to the next rank, 0..1. */
  progressToNext: number;
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function ratio(current: number, target: number): number {
  if (target <= 0) return 1;
  return clamp01(current / target);
}

/** Criterion: cadet — has visited ≥ N lessons. */
function lessonsVisitedCriterion(inputs: RankInputs): Criterion {
  const target = RANK_TARGETS.cadetLessons;
  const current = inputs.lessonsVisitedCount;
  return {
    id: "lessonsVisited",
    met: current >= target,
    progress: ratio(current, target),
    current,
    target,
  };
}

/** Criterion: pilotReady — ≥ N mocks passed ≥ X % within 7 days. */
function recentMockPassesCriterion(inputs: RankInputs): Criterion {
  const target = RANK_TARGETS.readyMockCount;
  const current = inputs.recentMockScores.filter(
    (s) => s >= RANK_TARGETS.readyMockScoreFloor,
  ).length;
  return {
    id: "recentMockPasses",
    met: current >= target,
    progress: ratio(current, target),
    current,
    target,
  };
}

/** Criterion: pilotReady — all topics meet mastery floor. */
function topicsAt70Criterion(inputs: RankInputs): Criterion {
  const target = inputs.totalTopics;
  const current = inputs.topicMastery.filter(
    (m) => m >= RANK_TARGETS.readyTopicMasteryFloor,
  ).length;
  return {
    id: "topicsAt70",
    met: target > 0 && current >= target,
    progress: ratio(current, target),
    current,
    target,
  };
}

/** Criterion: certified — has uploaded / claimed the certificate. */
function hasCertificateCriterion(inputs: RankInputs): Criterion {
  return {
    id: "hasCertificate",
    met: inputs.hasCertificate,
    progress: inputs.hasCertificate ? 1 : 0,
    current: inputs.hasCertificate ? 1 : 0,
    target: 1,
  };
}

/**
 * Compute the user's current rank + a forward-looking view of the next.
 *
 * Promotion is monotonic and gated. The function checks each tier in
 * order and stops at the first unmet one; the criteria returned are for
 * THAT tier, so the UI can ask the user to take the next concrete step.
 *
 * A certified user with zero lesson visits would still rank as
 * certified — the upper-tier evidence (the certificate) is sufficient
 * on its own. This avoids penalising users who already qualified
 * outside the platform and uploaded after the fact.
 */
export function computeRank(inputs: RankInputs): RankSnapshot {
  // Build all criteria up front so the UI can show any subset.
  const cadet = lessonsVisitedCriterion(inputs);
  const mocks = recentMockPassesCriterion(inputs);
  const topics = topicsAt70Criterion(inputs);
  const cert = hasCertificateCriterion(inputs);

  // Top tier first — certificate trumps everything else.
  if (cert.met) {
    return {
      current: "certified",
      next: null,
      criteria: [cert],
      progressToNext: 1,
    };
  }

  if (mocks.met && topics.met) {
    return {
      current: "pilotReady",
      next: "certified",
      criteria: [cert],
      progressToNext: cert.progress,
    };
  }

  if (cadet.met) {
    const criteria = [mocks, topics];
    const progress =
      criteria.reduce((acc, c) => acc + c.progress, 0) / criteria.length;
    return {
      current: "cadet",
      next: "pilotReady",
      criteria,
      progressToNext: progress,
    };
  }

  return {
    current: "recruit",
    next: "cadet",
    criteria: [cadet],
    progressToNext: cadet.progress,
  };
}
