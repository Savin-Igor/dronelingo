// One-line memory hook. Designed to be the single thing a student carries
// out of the lesson. Keep the line ≤ 12 words.
export function MemoryAnchor({
  rule,
  hint,
}: {
  rule: string;
  hint?: string;
}) {
  return (
    <aside
      role="note"
      aria-label="Memory anchor"
      className="not-prose my-8 flex items-start gap-4 border border-cyan-pulse/40 bg-hull/80 p-5"
    >
      <span
        aria-hidden
        className="font-mono text-2xl leading-none text-cyan-pulse"
      >
        ◇
      </span>
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
          Remember
        </p>
        <p className="mt-1 text-base font-semibold text-hud-white">{rule}</p>
        {hint ? <p className="mt-1 text-sm text-telemetry">{hint}</p> : null}
      </div>
    </aside>
  );
}
