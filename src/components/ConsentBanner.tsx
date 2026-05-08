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
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:flex sm:items-start sm:gap-4"
    >
      <div className="flex-1 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{t("title")}</p>
        <p className="mt-1">
          {t("body")}{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-gray-900"
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
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
