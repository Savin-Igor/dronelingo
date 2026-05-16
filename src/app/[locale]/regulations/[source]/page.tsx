import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { getSource, getSourceBody, listAllSources } from "@/lib/sources";
import { mdxOptions } from "@/lib/mdx-options";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return listAllSources().map((s) => ({ source: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; source: string }>;
}): Promise<Metadata> {
  const { locale, source } = await params;
  const meta = getSource(source);
  if (!meta) return {};
  const title = meta.officialTitle[locale] ?? meta.officialTitle["en"];
  return buildMetadata({
    locale,
    path: `/regulations/${source}`,
    title: `${title} — dronelingo`,
    description: meta.shortTitle[locale] ?? meta.shortTitle["en"],
  });
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; source: string }>;
}) {
  const { locale, source } = await params;
  const meta = getSource(source);
  if (!meta) notFound();

  const body = getSourceBody(source, locale);
  if (!body) notFound();

  const title = meta.officialTitle[locale] ?? meta.officialTitle["en"];
  const t = await getTranslations({ locale, namespace: "meta.regulations" });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <nav className="mb-6 text-xs text-muted">
        <Link href="/regulations" className="hover:text-hud-white">
          {t("title")}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-hud-white">{title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-hud-white">{title}</h1>
        <p className="mb-4 text-xs text-telemetry">
          Last verified: {meta.lastVerifiedAt}
        </p>
        <a
          href={meta.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-sm border border-cyan-pulse/60 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
        >
          Official source →
        </a>
      </header>

      <article className="prose prose-dronelingo max-w-none">
        <MDXRemote source={body} options={mdxOptions} />
      </article>
    </main>
  );
}
