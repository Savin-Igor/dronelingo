import type { Metadata } from "next";
import { PricingFlow } from "@/components/pricing/PricingFlow";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: "/pricing",
    title: "Get full access — €19 — dronelingo",
    description:
      "One-time €19 for full access to all 9 EASA A1/A3 topics, practice drills, and unlimited mock exams.",
  });
}

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Full access
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        Unlock the full platform
      </h1>
      <p className="mt-2 text-sm text-telemetry">
        First topic (Air Safety) is always free. Pay once to unlock everything.
      </p>
      <div className="mt-8">
        <PricingFlow />
      </div>
    </main>
  );
}
