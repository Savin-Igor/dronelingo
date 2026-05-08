import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Inline JSON-LD blob describing the site as both an Organization and
 * a WebSite. Helps search engines understand the canonical site name,
 * logo and search action — no impact on layout, just shows up in
 * `<head>` style on every landing render.
 */
export function StructuredData({ locale }: { locale: string }) {
  const blob = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/og.svg`,
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: `${SITE_URL}/${locale}`,
      inLanguage: locale,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/${locale}/learn`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
  return (
    <script
      type="application/ld+json"
      // The JSON.stringify call is escaped by React, no XSS surface.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
    />
  );
}
