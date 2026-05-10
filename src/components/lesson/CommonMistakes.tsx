import type { ReactNode } from "react";

export function CommonMistakes({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Common mistakes"
      className="not-prose my-8 border border-horizon bg-hull/40 p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber-300">
        Common mistakes
      </p>
      <div className="mt-3 text-sm text-telemetry [&>ul]:list-none [&>ul]:space-y-2 [&>ul]:pl-0 [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-0 [&>ul>li]:before:font-mono [&>ul>li]:before:text-amber-300 [&>ul>li]:before:content-['×']">
        {children}
      </div>
    </section>
  );
}
