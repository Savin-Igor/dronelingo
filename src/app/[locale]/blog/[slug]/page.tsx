import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx-options";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { BlogPostFooter } from "@/components/blog/BlogPostFooter";
import { BlogPostHeader } from "@/components/blog/BlogPostHeader";
import { routing } from "@/i18n/routing";
import {
  getLocalisedSlugs,
  getPostByLocalisedSlug,
  listAllPosts,
} from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Pre-render every (locale, localised-slug) pair at build time.
 * Without this, the dynamic [slug] route would fall through to a 404
 * for any slug that doesn't exist in the requested locale even when
 * it exists in another.
 */
export async function generateStaticParams() {
  const posts = listAllPosts();
  const params: { locale: string; slug: string }[] = [];
  for (const post of posts) {
    for (const locale of routing.locales) {
      params.push({ locale, slug: post.slug[locale] });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostByLocalisedSlug(locale, slug);
  if (!post) return {};

  const title = post.meta.title[locale];
  const description = post.meta.excerpt[locale];

  // hreflang alternates use the per-locale slug for that locale.
  const localisedSlugs = getLocalisedSlugs(post.meta);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const altSlug = localisedSlugs[l];
    if (altSlug) {
      languages[l] = `/${l}/blog/${altSlug}`;
    }
  }

  const canonical = `/${locale}/blog/${slug}`;

  return {
    title: `${title} — dronelingo`,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      locale,
      type: "article",
      publishedTime: post.meta.publishedAt.toISOString(),
      modifiedTime: post.meta.updatedAt.toISOString(),
      tags: post.meta.tags,
      images: post.meta.heroImage
        ? [
            {
              url: `${SITE_URL}${post.meta.heroImage}`,
              alt: post.meta.heroImageAlt[locale] ?? title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostByLocalisedSlug(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });

  // Article JSON-LD for Google rich-result eligibility.
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.meta.title[locale],
    description: post.meta.excerpt[locale],
    datePublished: post.meta.publishedAt.toISOString(),
    dateModified: post.meta.updatedAt.toISOString(),
    inLanguage: locale,
    image: post.meta.heroImage
      ? [`${SITE_URL}${post.meta.heroImage}`]
      : undefined,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${locale}/blog/${slug}`,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <BlogPostHeader post={post.meta} locale={locale} />

      <article className="prose prose-dronelingo max-w-none">
        <MDXRemote source={post.bodyMdx} options={mdxOptions} />
      </article>

      <BlogPostFooter
        post={post.meta}
        copy={{
          sourceLabel: t("sources"),
          backToBlog: t("backToBlog"),
          ctaHeading: t("cta.heading"),
          ctaBody: t("cta.body"),
          ctaPrimary: t("cta.primary"),
          ctaSecondary: t("cta.secondary"),
        }}
      />
    </main>
  );
}
