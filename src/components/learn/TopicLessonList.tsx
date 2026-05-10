"use client";

import { Link } from "@/i18n/navigation";
import { useProgress } from "./useProgress";

export type LessonListItem = {
  id: string;
  slug: string;
  title: string;
};

export function TopicLessonList({
  topicSlug,
  lessons,
}: {
  topicSlug: string;
  lessons: LessonListItem[];
}) {
  const progress = useProgress();

  return (
    <ul className="mt-6 divide-y divide-horizon rounded-sm border border-horizon">
      {lessons.map((lesson, i) => {
        const visited = Boolean(progress[lesson.id]);
        return (
          <li key={lesson.id}>
            <Link
              href={`/learn/${topicSlug}/${lesson.slug}`}
              className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-hull/60"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm font-medium ${
                    visited ? "text-telemetry" : "text-hud-white"
                  }`}
                >
                  {lesson.title}
                </span>
              </div>
              {visited ? (
                <span
                  aria-label="visited"
                  className="shrink-0 font-mono text-xs text-green-clear"
                >
                  ✓
                </span>
              ) : (
                <span className="shrink-0 font-mono text-xs text-muted" aria-hidden>
                  →
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
