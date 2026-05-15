import { listAllPosts } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Per-locale RSS 2.0 feed at /<locale>/blog/rss.xml.
 *
 * The feed advertises blog posts in the requested locale, using that
 * locale's URL slug. Three feeds total (lv / en / ru); each is the
 * canonical feed for its language. Readers that want all languages
 * subscribe to all three.
 */
function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return new Response("Not found", { status: 404 });
  }

  const posts = listAllPosts();
  const feedUrl = `${SITE_URL}/${locale}/blog/rss.xml`;
  const indexUrl = `${SITE_URL}/${locale}/blog`;

  const items = posts
    .map((post) => {
      const slug = post.slug[locale];
      if (!slug) return "";
      const title = post.title[locale];
      const description = post.excerpt[locale];
      const link = `${SITE_URL}/${locale}/blog/${slug}`;
      const pubDate = post.publishedAt.toUTCString();
      const image = post.heroImage ? `${SITE_URL}${post.heroImage}` : null;

      return [
        "    <item>",
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(description)}</description>`,
        image
          ? `      <enclosure url="${image}" type="image/png" length="0" />`
          : "",
        ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — blog (${locale})</title>
    <link>${indexUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Drone-certification guides and regulatory news for Latvia and the EU.</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
