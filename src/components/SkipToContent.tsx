import { useTranslations } from "next-intl";

export function SkipToContent() {
  const t = useTranslations("a11y");
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-cockpit focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-cyan-pulse focus:shadow-lg focus:ring-1 focus:ring-cyan-pulse/40"
    >
      {t("skipToContent")}
    </a>
  );
}
