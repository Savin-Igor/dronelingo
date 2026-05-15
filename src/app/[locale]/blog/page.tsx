import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BlogIndexCard } from "@/components/blog/BlogIndexCard";
import { listAllPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const base = buildMetadata({
    locale,
    path: "/blog",
    title: `${t("indexTitle")} — dronelingo`,
    description: t("indexDescription"),
  });
  // Advertise the RSS feed for autodiscovery.
  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: {
        "application/rss+xml": `/${locale}/blog/rss.xml`,
      },
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = listAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        ◇ {t("kicker")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white sm:text-4xl">
        {t("indexTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-telemetry">{t("indexDescription")}</p>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-sm border border-horizon bg-cockpit p-6 text-center text-telemetry">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.dirSlug}>
              <BlogIndexCard post={post} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
