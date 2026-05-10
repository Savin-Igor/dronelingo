"use client";

import { Link } from "@/i18n/navigation";
import { useProgress } from "./useProgress";

export type TopicListItem = {
  slug: string;
  title: string;
  summary: string;
  lessonIds: string[];
};

export function LearnTopicsList({ topics }: { topics: TopicListItem[] }) {
  const progress = useProgress();

  return (
    <ul className="mt-8 space-y-3">
      {topics.map((topic, i) => {
        const total = topic.lessonIds.length;
        const visited = topic.lessonIds.filter((id) => progress[id]).length;
        const percent = total === 0 ? 0 : Math.round((visited / total) * 100);
        const done = visited === total && total > 0;

        return (
          <li key={topic.slug}>
            <Link
              href={`/learn/${topic.slug}`}
              className="group block rounded-sm border border-horizon bg-cockpit p-5 transition-colors hover:border-cyan-pulse/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-semibold text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-lg font-semibold text-hud-white">
                    {topic.title}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {done && (
                    <span className="font-mono text-xs text-green-clear">✓</span>
                  )}
                  {total > 0 && (
                    <span className="font-mono text-xs text-muted">
                      {visited}/{total}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-telemetry">
                {topic.summary}
              </p>

              {total > 0 && (
                <div
                  className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-grid"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-cyan-pulse transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
