import { SITE_URL } from "@/lib/seo";

type Crumb = { name: string; path: string };

/**
 * BreadcrumbList JSON-LD blob. The visual breadcrumb is rendered
 * separately by the route — this component only emits the structured
 * data so search engines can show breadcrumbs in result snippets.
 */
export function BreadcrumbSchema({
  locale,
  crumbs,
}: {
  locale: string;
  crumbs: Crumb[];
}) {
  const blob = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}/${locale}${c.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
    />
  );
}
