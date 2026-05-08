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
    <ul className="mt-8 space-y-3">
      {lessons.map((lesson) => {
        const visited = Boolean(progress[lesson.id]);
        return (
          <li
            key={lesson.id}
            className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-4"
          >
            <Link
              href={`/learn/${topicSlug}/${lesson.slug}`}
              className="text-base font-medium text-gray-900 hover:underline"
            >
              {lesson.title}
            </Link>
            {visited && (
              <span
                aria-label="visited"
                className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700"
              >
                ✓
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
