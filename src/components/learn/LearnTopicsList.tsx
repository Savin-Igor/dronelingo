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
    <ul className="mt-8 space-y-4">
      {topics.map((topic) => {
        const total = topic.lessonIds.length;
        const visited = topic.lessonIds.filter((id) => progress[id]).length;
        const percent = total === 0 ? 0 : Math.round((visited / total) * 100);
        return (
          <li
            key={topic.slug}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <Link href={`/learn/${topic.slug}`} className="block">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {topic.title}
                </h2>
                {total > 0 && (
                  <span className="text-xs text-gray-500">
                    {visited} / {total}
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-600">{topic.summary}</p>
              {total > 0 && (
                <div
                  className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                  aria-hidden
                >
                  <div
                    className="h-full bg-green-500 transition-all"
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
