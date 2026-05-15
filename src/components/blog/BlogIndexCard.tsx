import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog";

type Props = {
  post: BlogPostMeta;
  locale: string;
};

export function BlogIndexCard({ post, locale }: Props) {
  const slug = post.slug[locale];
  const title = post.title[locale];
  const excerpt = post.excerpt[locale];
  const heroAlt = post.heroImageAlt[locale] ?? title;
  const dateLabel = post.publishedAt.toISOString().slice(0, 10);

  return (
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
        <h3 className="mt-2 text-lg font-semibold leading-tight text-hud-white">
          {title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-telemetry">{excerpt}</p>
        {post.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-sm border border-horizon bg-hull/60 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
