import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string; lesson: string }>;
}) {
  const { locale, topic: topicSlug, lesson: lessonSlug } = await params;

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { lessons: { orderBy: { ord: "asc" } } },
  });
  if (!topic) notFound();

  const index = topic.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) notFound();
  const lesson = topic.lessons[index];
  const prev = index > 0 ? topic.lessons[index - 1] : null;
  const next = index < topic.lessons.length - 1 ? topic.lessons[index + 1] : null;

  const body = localize(lesson.bodyMdx, locale);

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-12 lg:self-start">
        <Link
          href={`/learn/${topic.slug}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← {localize(topic.title, locale)}
        </Link>
        <nav className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {localize(topic.title, locale)}
          </h2>
          <ol className="mt-3 space-y-1">
            {topic.lessons.map((l) => {
              const isActive = l.slug === lessonSlug;
              return (
                <li key={l.id}>
                  <Link
                    href={`/learn/${topic.slug}/${l.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "block rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900"
                        : "block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  >
                    {localize(l.title, locale)}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <div>
        <article className="prose prose-gray max-w-none">
          <MDXRemote source={body} />
        </article>

        {lesson.sourceRef ? (
          <p className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
            {lesson.sourceRef}
          </p>
        ) : null}

        <nav
          aria-label="Lesson navigation"
          className="mt-12 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6"
        >
          {prev ? (
            <Link
              href={`/learn/${topic.slug}/${prev.slug}`}
              className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50"
            >
              <span className="text-xs uppercase tracking-wider text-gray-400">
                ←
              </span>
              <span className="mt-1 block text-sm font-medium text-gray-900">
                {localize(prev.title, locale)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${topic.slug}/${next.slug}`}
              className="rounded-lg border border-gray-200 p-4 text-right hover:border-gray-300 hover:bg-gray-50"
            >
              <span className="text-xs uppercase tracking-wider text-gray-400">
                →
              </span>
              <span className="mt-1 block text-sm font-medium text-gray-900">
                {localize(next.title, locale)}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </main>
  );
}
