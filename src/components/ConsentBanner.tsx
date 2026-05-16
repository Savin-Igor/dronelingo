"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "dronelingo:consent:v1";

export function ConsentBanner() {
  const t = useTranslations("consent");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value !== "accepted") setShown(true);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = shown ? "6rem" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [shown]);

  function accept() {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    setShown(false);
    window.dispatchEvent(new Event("dronelingo:consent-changed"));
  }

  if (!shown) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-2xl rounded-sm border border-horizon bg-hull/95 p-3 shadow-lg backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:flex sm:items-start sm:gap-4 sm:p-4"
    >
      <div className="flex-1 text-xs leading-relaxed text-telemetry sm:text-sm">
        <p className="font-medium text-hud-white">{t("title")}</p>
        <p className="mt-1">
          {t("body")}{" "}
          <Link
            href="/privacy"
            className="text-cyan-pulse underline underline-offset-2 hover:text-cyan-dim"
          >
            {t("privacyLink")}
          </Link>
          .
        </p>
      </div>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={accept}
          className="w-full rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-4 py-2 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void sm:w-auto"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
