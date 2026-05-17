import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { searchHybrid } from "@/lib/search/query";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  const base = buildMetadata({
    locale,
    path: "/search",
    title: `${t("title")} — dronelingo`,
    description: t("description"),
  });
  // Search results are user-state — keep them out of the index.
  return { ...base, robots: { index: false, follow: false } };
}

const TYPE_LABEL_KEYS: Record<string, string> = {
  source: "typeSource",
  lesson: "typeLesson",
  blog: "typeBlog",
  question: "typeQuestion",
  static: "typeStatic",
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const t = await getTranslations({ locale, namespace: "search" });

  const results = query ? await searchHybrid(query, locale) : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-hud-white">{t("title")}</h1>
      <p className="mb-8 text-sm text-muted">
        {query
          ? t("resultsFor", { q: query, count: results.length })
          : t("instructions")}
      </p>

      {query && results.length === 0 && (
        <p className="rounded-sm border border-horizon bg-hull/40 px-4 py-3 text-sm text-muted">
          {t("noResults")}
        </p>
      )}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.url}>
            <Link
              // Cross-locale results can show up via the en-fallback path; in
              // that case the URL already has the locale prefix baked in, so
              // we use a plain `<a>` to avoid double-prefixing.
              href={r.url.startsWith(`/${locale}/`) ? r.url.slice(locale.length + 1) : r.url}
              className="block rounded-sm border border-horizon bg-hull/40 px-4 py-3 transition-colors hover:border-cyan-pulse/50 hover:bg-hull"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
                {t(TYPE_LABEL_KEYS[r.type] ?? "typeStatic")}
              </p>
              <p className="mt-1 text-sm font-medium text-hud-white">
                {r.title}
              </p>
              <p className="mt-1 text-xs text-telemetry">{r.snippet}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
