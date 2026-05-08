import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Course / ItemList schema.org JSON-LD for a single topic page so
 * search engines can surface lesson lists in rich results.
 */
export function TopicSchema({
  locale,
  slug,
  title,
  description,
  lessons,
}: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  lessons: { slug: string; title: string }[];
}) {
  const blob = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    inLanguage: locale,
    url: `${SITE_URL}/${locale}/learn/${slug}`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
    },
    syllabusSections: lessons.map((l, i) => ({
      "@type": "Syllabus",
      name: l.title,
      position: i + 1,
      url: `${SITE_URL}/${locale}/learn/${slug}/${l.slug}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blob) }}
    />
  );
}
