import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { cache } from "react";
import { parse as parseYaml } from "yaml";

import { routing } from "@/i18n/routing";

const BLOG_DIR = resolve(process.cwd(), "content/blog");

export type BlogPostMeta = {
  /** Canonical directory name under `content/blog/`. */
  dirSlug: string;
  /** Per-locale URL slug. */
  slug: Record<string, string>;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  publishedAt: Date;
  updatedAt: Date;
  lastVerifiedAt: Date | null;
  tags: string[];
  /** Public-path image URL (e.g. /blog/<dirSlug>/hero.png) or null. */
  heroImage: string | null;
  heroImageAlt: Record<string, string>;
  sourceRef: string | null;
};

export type BlogPost = {
  meta: BlogPostMeta;
  bodyMdx: string;
};

type RawMeta = {
  slug: Record<string, string>;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  publishedAt: string;
  updatedAt?: string;
  lastVerifiedAt?: string;
  tags?: string[];
  heroImage?: string;
  heroImageAlt?: Record<string, string>;
  sourceRef?: string;
};

function readMeta(dirSlug: string): BlogPostMeta | null {
  const metaPath = join(BLOG_DIR, dirSlug, "meta.yml");
  if (!existsSync(metaPath)) return null;

  const raw = parseYaml(readFileSync(metaPath, "utf-8")) as RawMeta;

  // Coverage check: every supported locale must have a slug, a title, and
  // an excerpt — otherwise a route lookup would 404 silently.
  for (const locale of routing.locales) {
    if (!raw.slug?.[locale]) {
      throw new Error(
        `content/blog/${dirSlug}/meta.yml: missing slug.${locale}`,
      );
    }
    if (!raw.title?.[locale]) {
      throw new Error(
        `content/blog/${dirSlug}/meta.yml: missing title.${locale}`,
      );
    }
    if (!raw.excerpt?.[locale]) {
      throw new Error(
        `content/blog/${dirSlug}/meta.yml: missing excerpt.${locale}`,
      );
    }
  }

  const heroImage = raw.heroImage
    ? `/blog/${dirSlug}/${raw.heroImage}`
    : null;

  return {
    dirSlug,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    publishedAt: new Date(raw.publishedAt),
    updatedAt: new Date(raw.updatedAt ?? raw.publishedAt),
    lastVerifiedAt: raw.lastVerifiedAt ? new Date(raw.lastVerifiedAt) : null,
    tags: raw.tags ?? [],
    heroImage,
    heroImageAlt: raw.heroImageAlt ?? {},
    sourceRef: raw.sourceRef ?? null,
  };
}

/**
 * List all blog posts, newest first. Cached for the lifetime of the
 * request so multiple components (index card + sitemap + landing strip)
 * don't re-read the filesystem.
 */
export const listAllPosts = cache((): BlogPostMeta[] => {
  if (!existsSync(BLOG_DIR)) return [];
  const dirs = readdirSync(BLOG_DIR).filter((entry) => {
    const full = join(BLOG_DIR, entry);
    return statSync(full).isDirectory();
  });
  const posts: BlogPostMeta[] = [];
  for (const dir of dirs) {
    const meta = readMeta(dir);
    if (meta) posts.push(meta);
  }
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return posts;
});

/**
 * Resolve a (locale, slug) pair to a post. Returns null when no post
 * with that localised slug exists. Used by `/blog/[slug]`.
 */
export function getPostByLocalisedSlug(
  locale: string,
  slug: string,
): BlogPost | null {
  const posts = listAllPosts();
  const meta = posts.find((p) => p.slug[locale] === slug);
  if (!meta) return null;

  const mdxPath = join(BLOG_DIR, meta.dirSlug, `${locale}.mdx`);
  if (!existsSync(mdxPath)) {
    // Fall back to English so a post with a missing translation still
    // renders something useful in the requested locale.
    const fallbackPath = join(BLOG_DIR, meta.dirSlug, "en.mdx");
    if (!existsSync(fallbackPath)) return null;
    return { meta, bodyMdx: readFileSync(fallbackPath, "utf-8") };
  }
  return { meta, bodyMdx: readFileSync(mdxPath, "utf-8") };
}

/**
 * Helper for building hreflang alternates: returns the full set of
 * `(locale → slug)` pairs for a given post.
 */
export function getLocalisedSlugs(
  meta: BlogPostMeta,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of routing.locales) {
    result[locale] = meta.slug[locale];
  }
  return result;
}
