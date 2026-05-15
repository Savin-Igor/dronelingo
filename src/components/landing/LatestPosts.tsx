import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { listAllPosts } from "@/lib/blog";

type Props = {
  locale: string;
  /** Maximum number of posts to surface. Defaults to 3. */
  limit?: number;
};

/**
 * "Latest from the blog" strip — three newest posts shown on the
 * landing page below WhyDronelingo. Renders nothing if there are no
 * posts (e.g. fresh deploy).
 */
export async function LatestPosts({ locale, limit = 3 }: Props) {
  const posts = listAllPosts().slice(0, limit);
  if (posts.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "blog.latest" });

  return (
    <section className="border-t border-horizon bg-cockpit/50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
              ◇ {t("kicker")}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-hud-white sm:text-3xl">
              {t("heading")}
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm text-cyan-pulse transition-colors hover:text-hud-white"
          >
            {t("seeAll")} →
          </Link>
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const slug = post.slug[locale];
            const title = post.title[locale];
            const excerpt = post.excerpt[locale];
            const heroAlt = post.heroImageAlt[locale] ?? title;
            const dateLabel = post.publishedAt.toISOString().slice(0, 10);
            return (
              <li key={post.dirSlug}>
                <Link
                  href={`/blog/${slug}`}
                  className="group block overflow-hidden rounded-sm border border-horizon bg-cockpit transition-colors hover:border-cyan-pulse/50"
                >
                  {post.heroImage && (
                    <div className="overflow-hidden bg-hull">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.heroImage}
                        alt={heroAlt}
                        className="block aspect-video h-auto w-full object-cover transition-transform group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
                      {dateLabel}
                    </p>
                    <h3 className="mt-2 text-base font-semibold leading-tight text-hud-white">
                      {title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-telemetry">
                      {excerpt}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
