"use client";

import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";

type Props = {
  user: { name?: string | null; email?: string | null } | null;
};

export function UserMenu({ user }: Props) {
  const t = useTranslations("auth");

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="hidden sm:inline-flex items-center rounded-md border border-horizon px-3 py-1.5 text-xs font-medium text-telemetry hover:text-hud-white hover:border-hud-white transition-colors"
      >
        {t("signIn")}
      </Link>
    );
  }

  const label = user.name ?? user.email?.split("@")[0] ?? "—";

  return (
    <div className="hidden sm:flex items-center gap-2">
      <Link
        href="/profile"
        className="text-xs text-telemetry hover:text-hud-white transition-colors truncate max-w-[120px]"
        title={user.email ?? ""}
      >
        {label}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        {t("signOut")}
      </button>
    </div>
  );
}
