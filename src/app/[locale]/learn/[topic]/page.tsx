import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic: topicSlug } = await params;
  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { lessons: { orderBy: { ord: "asc" } } },
  });

  if (!topic) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/learn" className="text-sm text-gray-500 hover:text-gray-900">
        ← Learn
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-gray-900">
        {localize(topic.title, locale)}
      </h1>
      <p className="mt-2 text-gray-600">{localize(topic.summary, locale)}</p>

      <ul className="mt-8 space-y-3">
        {topic.lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="rounded-md border border-gray-200 bg-white p-4"
          >
            <Link
              href={`/learn/${topic.slug}/${lesson.slug}`}
              className="text-base font-medium text-gray-900 hover:underline"
            >
              {localize(lesson.title, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
