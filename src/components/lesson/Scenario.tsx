import type { ReactNode } from "react";

export function Scenario({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title ?? "Scenario"}
      className="not-prose my-8 border border-horizon bg-signal/20 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Scenario
      </p>
      {title ? (
        <h3 className="mt-1 text-lg font-semibold text-hud-white">{title}</h3>
      ) : null}
      <div className="mt-3 text-sm text-telemetry [&>p]:my-2 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
