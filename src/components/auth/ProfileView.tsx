"use client";

import { useTranslations } from "next-intl";

type ExamSummary = {
  id: string;
  takenAt: string;
  score: number;
  total: number;
  passed: boolean;
  durationSec: number;
};

type TopicStat = {
  slug: string;
  title: string;
  correct: number;
  total: number;
};

type Props = {
  examResults: ExamSummary[];
  topicStats: TopicStat[];
  totalAttempts: number;
  memberSince: string;
};

export function ProfileView({ examResults, topicStats, totalAttempts, memberSince }: Props) {
  const t = useTranslations("profile");

  const passRate = examResults.length > 0
    ? Math.round((examResults.filter((e) => e.passed).length / examResults.length) * 100)
    : null;

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("examsTotal")} value={String(examResults.length)} />
        <StatCard label={t("passRate")} value={passRate !== null ? `${passRate}%` : "—"} />
        <StatCard label={t("questionsAnswered")} value={String(totalAttempts)} />
        <StatCard
          label={t("memberSince")}
          value={memberSince ? new Date(memberSince).toLocaleDateString() : "—"}
        />
      </div>

      {/* Per-topic mastery */}
      {topicStats.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("topicAccuracy")}</h2>
          <div className="space-y-2">
            {topicStats
              .sort((a, b) => b.total - a.total)
              .map((s) => {
                const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={s.slug} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{s.title}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.correct}/{s.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Exam history */}
      {examResults.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("examHistory")}</h2>
          <div className="space-y-2">
            {examResults.map((e) => {
              const pct = Math.round((e.score / e.total) * 100);
              const date = new Date(e.takenAt).toLocaleDateString();
              const mins = Math.round(e.durationSec / 60);
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className={e.passed ? "text-green-500" : "text-destructive"}>
                      {e.passed ? "✓" : "✗"}
                    </span>
                    <span className="text-muted-foreground">{date}</span>
                  </div>
                  <div className="flex items-center gap-4 tabular-nums">
                    <span>{pct}%</span>
                    <span className="text-muted-foreground">{mins} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {examResults.length === 0 && totalAttempts === 0 && (
        <p className="text-sm text-muted-foreground">{t("noData")}</p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
