"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { hasAccess } from "@/lib/access";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<boolean | null>(null);

  useEffect(() => {
    setAccess(hasAccess());
    function refresh() {
      setAccess(hasAccess());
    }
    window.addEventListener("dronelingo:access-changed", refresh);
    return () => window.removeEventListener("dronelingo:access-changed", refresh);
  }, []);

  // null = still checking localStorage — render skeleton to avoid layout shift
  if (access === null) return <AccessSkeleton />;
  if (!access) return <PaywallPanel />;
  return <>{children}</>;
}

function AccessSkeleton() {
  return (
    <div className="mx-auto max-w-lg py-16" aria-hidden="true">
      <div className="animate-pulse rounded-sm border border-horizon bg-cockpit p-8 space-y-4">
        <div className="h-3 w-24 rounded bg-hull" />
        <div className="h-6 w-48 rounded bg-hull" />
        <div className="h-4 w-full rounded bg-hull" />
        <div className="h-4 w-5/6 rounded bg-hull" />
        <div className="mt-6 h-10 w-full rounded bg-hull" />
      </div>
    </div>
  );
}

function PaywallPanel() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="rounded-sm border border-cyan-pulse/20 bg-cockpit p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          Full access required
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-hud-white">
          Unlock all 9 topics
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-telemetry">
          You are viewing a locked topic. Get full access to all lessons, practice drills, and mock exams for a one-time payment of €19.
        </p>

        <ul className="mt-6 space-y-2 text-left text-sm text-telemetry">
          {[
            "All 9 EASA topics with full lessons",
            "45+ practice questions per topic",
            "Unlimited mock exams",
            "Latvian, English & Russian",
            "One-time — no subscription",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-green-clear">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          className="mt-8 inline-flex w-full items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-6 py-3 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
        >
          Get full access — €19 →
        </Link>

        <p className="mt-4 font-mono text-xs text-muted">
          Air Safety topic is free — no account needed.
        </p>
      </div>
    </div>
  );
}
