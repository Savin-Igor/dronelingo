"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccessStatus } from "./useAccessStatus";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const access = useAccessStatus();

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
  const t = useTranslations("access");

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="rounded-sm border border-cyan-pulse/20 bg-cockpit p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("gateTitle")}
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-hud-white">
          {t("panelTitle")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-telemetry">
          {t("gateBody")}
        </p>

        <ul className="mt-6 space-y-2 text-left text-sm text-telemetry">
          {[
            t("features.lessons"),
            t("features.practice"),
            t("features.exams"),
            t("features.languages"),
            t("features.payment"),
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
          {t("gateCta")} →
        </Link>

        <p className="mt-4 font-mono text-xs text-muted">
          {t("freeNote")}
        </p>
      </div>
    </div>
  );
}
