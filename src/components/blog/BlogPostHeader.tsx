import type { BlogPostMeta } from "@/lib/blog";

type Props = {
  post: BlogPostMeta;
  locale: string;
};

export function BlogPostHeader({ post, locale }: Props) {
  const title = post.title[locale];
  const heroAlt = post.heroImageAlt[locale] ?? title;
  const publishedLabel = post.publishedAt.toISOString().slice(0, 10);
  const updatedLabel = post.updatedAt.toISOString().slice(0, 10);
  const showUpdated =
    post.updatedAt.getTime() !== post.publishedAt.getTime();

  return (
    <header className="mb-8">
      {post.heroImage && (
        <div className="mb-6 overflow-hidden rounded-sm border border-horizon bg-hull">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.heroImage}
            alt={heroAlt}
            className="block aspect-video h-auto w-full object-cover"
          />
        </div>
      )}
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        {publishedLabel}
        {showUpdated && (
          <span className="ml-3 text-muted">· updated {updatedLabel}</span>
        )}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-hud-white sm:text-4xl">
        {title}
      </h1>
      {post.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm border border-horizon bg-hull/60 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
