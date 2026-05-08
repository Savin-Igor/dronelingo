import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ClaimFlow } from "@/components/claim/ClaimFlow";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "claim" });
  return buildMetadata({
    locale,
    path: "/claim",
    title: `${t("title")} — dronelingo`,
    description: t("subtitle"),
  });
}

export default function ClaimPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <ClaimFlow />
    </main>
  );
}
