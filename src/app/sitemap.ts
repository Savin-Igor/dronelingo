import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

const PUBLIC_PATHS = [
  "",
  "/learn",
  "/practice",
  "/exam",
  "/exam/meteorology-a2",
  "/blog",
  "/pricing",
  "/guide",
  "/faq",
  "/privacy",
  "/terms",
];

const PRIORITY: Record<string, number> = {
  "": 1.0,
  "/learn": 0.9,
  "/practice": 0.8,
  "/exam": 0.8,
  "/pricing": 0.9,
  "/guide": 0.8,
  "/blog": 0.8,
  "/faq": 0.6,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PUBLIC_PATHS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${SITE_URL}/${locale}${path}`;
    }
    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" || path === "/learn" ? "weekly" : "monthly",
        priority: PRIORITY[path] ?? 0.5,
        alternates: { languages },
      });
    }
  }

  // Blog posts: slug differs per locale, so hreflang alternates point at
  // the localised slug for each language. Without this, Google would treat
  // the three locale variants as separate pages instead of translations.
  for (const post of listAllPosts()) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      const slug = post.slug[locale];
      if (slug) {
        languages[locale] = `${SITE_URL}/${locale}/blog/${slug}`;
      }
    }
    for (const locale of routing.locales) {
      const slug = post.slug[locale];
      if (!slug) continue;
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
