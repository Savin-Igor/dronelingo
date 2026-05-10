import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AccessGate } from "@/components/access/AccessGate";
import { BreadcrumbSchema } from "@/components/learn/Breadcrumb";
import { MarkLessonVisited } from "@/components/learn/MarkLessonVisited";
import { lessonComponents } from "@/components/lesson";
import { isFreeTopic } from "@/lib/access";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string; lesson: string }>;
}) {
  const { locale, topic: topicSlug, lesson: lessonSlug } = await params;
  const tLearn = await getTranslations({ locale, namespace: "learn" });

  const topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { lessons: { orderBy: { ord: "asc" } } },
  });
  if (!topic) notFound();

  const index = topic.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) notFound();
  const lesson = topic.lessons[index];
  const prev = index > 0 ? topic.lessons[index - 1] : null;
  const next =
    index < topic.lessons.length - 1 ? topic.lessons[index + 1] : null;

  const body = localize(lesson.bodyMdx, locale);
  const free = isFreeTopic(topicSlug);

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <BreadcrumbSchema
        locale={locale}
        crumbs={[
          { name: tLearn("title"), path: "/learn" },
          {
            name: localize(topic.title, locale),
            path: `/learn/${topic.slug}`,
          },
          {
            name: localize(lesson.title, locale),
            path: `/learn/${topic.slug}/${lesson.slug}`,
          },
        ]}
      />

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Link
          href={`/learn/${topic.slug}`}
          className="font-mono text-xs text-muted transition-colors hover:text-telemetry"
        >
          ← {localize(topic.title, locale)}
        </Link>

        <nav className="mt-5" aria-label="Lessons in this sector">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
            {localize(topic.title, locale)}
          </p>
          <ol className="mt-3 space-y-0.5">
            {topic.lessons.map((l, i) => {
              const isActive = l.slug === lessonSlug;
              return (
                <li key={l.id}>
                  <Link
                    href={`/learn/${topic.slug}/${l.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-l-2 border-cyan-pulse bg-hull/80 text-hud-white"
                        : "text-telemetry hover:bg-hull/40 hover:text-hud-white"
                    }`}
                  >
                    <span className="w-5 shrink-0 font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {localize(l.title, locale)}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div>
        {free && <MarkLessonVisited lessonId={lesson.id} />}

        {free ? (
          <article className="prose prose-dronelingo max-w-none">
            <MDXRemote source={body} components={lessonComponents} />
          </article>
        ) : (
          <AccessGate>
            <article className="prose prose-dronelingo max-w-none">
              <MDXRemote source={body} components={lessonComponents} />
            </article>
          </AccessGate>
        )}

        {lesson.sourceRef ? (
          <p className="mt-12 border-t border-horizon pt-6 font-mono text-xs text-muted">
            {lesson.sourceRef}
          </p>
        ) : null}

        <nav
          aria-label="Lesson navigation"
          className="mt-12 grid grid-cols-2 gap-3 border-t border-horizon pt-6"
        >
          {prev ? (
            <Link
              href={`/learn/${topic.slug}/${prev.slug}`}
              className="rounded-sm border border-horizon p-4 transition-colors hover:border-signal hover:bg-hull/50"
            >
              <span className="font-mono text-xs text-muted">←</span>
              <span className="mt-1 block text-sm font-medium text-telemetry">
                {localize(prev.title, locale)}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${topic.slug}/${next.slug}`}
              className="rounded-sm border border-horizon p-4 text-right transition-colors hover:border-signal hover:bg-hull/50"
            >
              <span className="font-mono text-xs text-muted">→</span>
              <span className="mt-1 block text-sm font-medium text-telemetry">
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
