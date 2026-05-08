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

  const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });
  if (!topic) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { topicId_slug: { topicId: topic.id, slug: lessonSlug } },
  });
  if (!lesson) notFound();

  const body = localize(lesson.bodyMdx, locale);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/learn/${topic.slug}`}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← {localize(topic.title, locale)}
      </Link>

      <article className="prose prose-gray mt-6 max-w-none">
        <MDXRemote source={body} />
      </article>

      {lesson.sourceRef ? (
        <p className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
          {lesson.sourceRef}
        </p>
      ) : null}
    </main>
  );
}
