"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Trainer, type TrainerQuestion } from "@/components/practice/Trainer";
import { FREE_TOPIC_SLUG, hasAccess } from "@/lib/access";

/**
 * Daily warm-up client wrapper.
 *
 * Server hands us the full question pool annotated with the topic slug.
 * We filter to the user's accessible scope (client-side because access
 * state lives in localStorage until NextAuth #3 lands):
 *   - Has paid access → all questions.
 *   - No paid access → free topic only.
 * Then we render the standard Trainer in dueOnly mode.
 *
 * Hydration guard: render a small skeleton while we read localStorage so
 * the UI doesn't flash from paywall → free → full.
 */
export function WarmUpClient({
  pool,
}: {
  pool: (TrainerQuestion & { topicSlug: string })[];
}) {
  const t = useTranslations("warmUp");
  const [access, setAccess] = useState<boolean | null>(null);

  useEffect(() => {
    setAccess(hasAccess());
    function refresh() {
      setAccess(hasAccess());
    }
    window.addEventListener("dronelingo:access-changed", refresh);
    return () =>
      window.removeEventListener("dronelingo:access-changed", refresh);
  }, []);

  if (access === null) {
    return (
      <div
        className="mt-8 animate-pulse rounded-sm border border-horizon bg-cockpit p-8 space-y-4"
        aria-hidden
      >
        <div className="h-3 w-24 rounded bg-hull" />
        <div className="h-6 w-2/3 rounded bg-hull" />
        <div className="h-32 w-full rounded bg-hull" />
      </div>
    );
  }

  const accessible = access
    ? pool
    : pool.filter((q) => q.topicSlug === FREE_TOPIC_SLUG);

  // Strip the topicSlug field before passing to Trainer (its props don't
  // know about it — keeps the existing API clean).
  const trainerQuestions: TrainerQuestion[] = accessible.map((q) => ({
    id: q.id,
    externalId: q.externalId,
    stem: q.stem,
    options: q.options,
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
    sourceRef: q.sourceRef,
  }));

  return (
    <>
      {!access && (
        <p className="mt-4 rounded-sm border border-cyan-pulse/20 bg-cyan-pulse/5 px-4 py-3 text-xs text-telemetry">
          {t("freeOnlyNote")}{" "}
          <Link
            href="/pricing"
            className="font-medium text-cyan-pulse underline-offset-2 hover:underline"
          >
            {t("unlockAll")} →
          </Link>
        </p>
      )}
      <Trainer questions={trainerQuestions} initialDueOnly />
    </>
  );
}
