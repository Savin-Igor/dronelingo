import type { ReactNode } from "react";

export function Debrief({
  unlocks,
  children,
}: {
  unlocks?: string[];
  children: ReactNode;
}) {
  return (
    <section
      aria-label="Debrief"
      className="not-prose my-10 border-t-2 border-cyan-pulse/60 bg-gradient-to-b from-hull/80 to-transparent p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        Debrief
      </p>
      <div className="mt-2 text-sm text-telemetry [&>p]:my-1">{children}</div>
      {unlocks && unlocks.length > 0 ? (
        <p className="mt-4 border-t border-horizon pt-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
          Unlocked: {unlocks.join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
