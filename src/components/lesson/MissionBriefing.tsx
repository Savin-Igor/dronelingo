import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function MissionBriefing({
  objective,
  children,
}: {
  objective?: string;
  children: ReactNode;
}) {
  const t = useTranslations("lessonWidgets.anatomy");
  return (
    <aside
      role="note"
      aria-label={t("missionBriefing")}
      className="not-prose my-8 border-l-2 border-cyan-pulse bg-hull/60 px-5 py-4"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-pulse">
        {t("missionBriefing")}
      </p>
      {objective ? (
        <p className="mt-2 text-base font-medium text-hud-white">{objective}</p>
      ) : null}
      <div className="mt-2 text-sm text-telemetry [&_p]:my-1">{children}</div>
    </aside>
  );
}
