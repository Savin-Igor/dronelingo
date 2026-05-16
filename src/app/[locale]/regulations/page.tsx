import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { listAllSources, type SourceMeta, type SourceKind } from "@/lib/sources";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.regulations" });
  return buildMetadata({
    locale,
    path: "/regulations",
    title: `${t("title")} — dronelingo`,
    description: t("description"),
  });
}

const KIND_ORDER: SourceKind[] = [
  "eu-regulation",
  "easa-guidance",
  "caa-operational",
];

const KIND_LABELS: Record<SourceKind, Record<string, string>> = {
  "eu-regulation": { en: "EU Regulations", lv: "ES regulas", ru: "Регламенты ЕС" },
  "easa-guidance": { en: "EASA Guidance", lv: "EASA vadlīnijas", ru: "Руководство EASA" },
  "caa-operational": { en: "CAA Latvia — Operational", lv: "CAA Latvia — Operatīvie avoti", ru: "CAA Латвии — Оперативные источники" },
};

export default async function RegulationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.regulations" });
  const sources = listAllSources();

  const grouped = new Map<SourceKind, SourceMeta[]>();
  for (const kind of KIND_ORDER) {
    grouped.set(kind, sources.filter((s) => s.kind === kind));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold text-hud-white">{t("title")}</h1>
      <p className="mb-10 text-sm text-muted">{t("description")}</p>

      {KIND_ORDER.map((kind) => {
        const group = grouped.get(kind) ?? [];
        if (group.length === 0) return null;
        const groupLabel = KIND_LABELS[kind][locale] ?? KIND_LABELS[kind]["en"];
        return (
          <section key={kind} className="mb-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-telemetry">
              {groupLabel}
            </h2>
            <ul className="space-y-3">
              {group.map((source) => {
                const title = source.officialTitle[locale] ?? source.officialTitle["en"];
                const short = source.shortTitle[locale] ?? source.shortTitle["en"];
                return (
                  <li key={source.id}>
                    <Link
                      href={`/regulations/${source.id}`}
                      className="block rounded-sm border border-horizon bg-hull/40 px-4 py-3 transition-colors hover:border-cyan-pulse/50 hover:bg-hull"
                    >
                      <p className="text-sm font-medium text-hud-white">{title}</p>
                      <p className="mt-0.5 text-xs text-muted">{short}</p>
                      <p className="mt-1 text-xs text-telemetry">
                        Verified: {source.lastVerifiedAt}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
