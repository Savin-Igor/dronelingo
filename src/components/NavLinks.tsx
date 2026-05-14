"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/learn", key: "learn" },
  { href: "/practice", key: "practice" },
  { href: "/exam", key: "exam" },
  { href: "/blog", key: "blog" },
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ href, key }) => {
        const isActive =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "border-b border-cyan-pulse pb-0.5 text-sm font-medium text-cyan-pulse"
                : "text-sm text-telemetry transition-colors hover:text-hud-white"
            }
          >
            {t(key)}
          </Link>
        );
      })}
    </>
  );
}
