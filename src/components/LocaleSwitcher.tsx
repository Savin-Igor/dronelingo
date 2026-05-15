"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<(typeof routing.locales)[number], string> = {
  lv: "LV",
  en: "EN",
  ru: "RU",
};

export function LocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const href = pathname || "/";

  return (
    <nav aria-label="Language" className="flex items-center gap-0.5 font-mono text-xs">
      {routing.locales.map((locale) => {
        const isActive = locale === current;
        return (
          <Link
            key={locale}
            href={href}
            locale={locale}
            aria-current={isActive ? "true" : undefined}
            className={
              isActive
                ? "rounded-sm px-2 py-1 font-semibold text-cyan-pulse"
                : "rounded-sm px-2 py-1 text-muted transition-colors hover:text-telemetry"
            }
          >
            {LABELS[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
