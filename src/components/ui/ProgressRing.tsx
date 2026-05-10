// Pure SVG + CSS animation — no JS animation library needed.
// --ring-from / --ring-to are set via inline style; ring-fill keyframe reads them.
export function ProgressRing({
  percent,
  passed,
  size = 128,
}: {
  percent: number;
  passed: boolean;
  size?: number;
}) {
  const r = (size / 2) * 0.8; // 80% of half-size → for size=128: r=51.2≈51
  const circumference = 2 * Math.PI * r;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clampedPercent / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="6"
          className="stroke-grid"
        />
        {/* Animated progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={passed ? "stroke-green-clear" : "stroke-amber-alert"}
          style={
            {
              "--ring-from": circumference,
              "--ring-to": offset,
              animation: "ring-fill 700ms ease-out forwards",
            } as React.CSSProperties
          }
        />
      </svg>

      {/* Score label, centred over the ring */}
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-mono text-3xl font-semibold tabular-nums text-hud-white">
          {clampedPercent}%
        </span>
      </div>
    </div>
  );
}
