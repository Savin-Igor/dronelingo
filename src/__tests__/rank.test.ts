import { describe, it, expect } from "vitest";
import { computeRank, RANK_TARGETS } from "@/lib/rank";
import type { RankInputs } from "@/lib/rank";

const base: RankInputs = {
  lessonsVisitedCount: 0,
  recentMockScores: [],
  topicMastery: [],
  hasCertificate: false,
  totalTopics: 9,
};

describe("computeRank", () => {
  it("starts at recruit with no activity", () => {
    const snap = computeRank(base);
    expect(snap.current).toBe("recruit");
    expect(snap.next).toBe("cadet");
  });

  it("promotes to cadet when enough lessons visited", () => {
    const snap = computeRank({
      ...base,
      lessonsVisitedCount: RANK_TARGETS.cadetLessons,
    });
    expect(snap.current).toBe("cadet");
    expect(snap.next).toBe("pilotReady");
  });

  it("promotes to pilotReady when mocks and topics are met", () => {
    const snap = computeRank({
      ...base,
      lessonsVisitedCount: RANK_TARGETS.cadetLessons,
      recentMockScores: [90, 88],
      topicMastery: Array(9).fill(0.75),
    });
    expect(snap.current).toBe("pilotReady");
  });

  it("certified rank when certificate is held", () => {
    const snap = computeRank({ ...base, hasCertificate: true });
    expect(snap.current).toBe("certified");
    expect(snap.next).toBeNull();
  });

  it("certified overrides all other criteria", () => {
    const snap = computeRank({
      ...base,
      hasCertificate: true,
      lessonsVisitedCount: 0,
      recentMockScores: [],
    });
    expect(snap.current).toBe("certified");
  });

  it("progressToNext is 0 for fresh recruit", () => {
    const snap = computeRank(base);
    expect(snap.progressToNext).toBe(0);
  });

  it("progressToNext is 1 for certified", () => {
    const snap = computeRank({ ...base, hasCertificate: true });
    expect(snap.progressToNext).toBe(1);
  });
});
