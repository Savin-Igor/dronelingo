import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { readStaticPage } from "@/lib/static-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guide" });
  return buildMetadata({
    locale,
    path: "/guide",
    title: `${t("title")} — dronelingo`,
    description: t("description"),
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const body = readStaticPage("guide", locale);
  if (!body) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="prose prose-dronelingo max-w-none">
        <MDXRemote source={body} />
      </article>
    </main>
  );
}
