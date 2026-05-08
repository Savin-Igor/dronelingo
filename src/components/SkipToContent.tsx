import { useTranslations } from "next-intl";

/**
 * Visually hidden until focused — gives keyboard users a way to skip
 * the global header and locale switcher and jump straight to the
 * page's main content.
 */
export function SkipToContent() {
  const t = useTranslations("a11y");
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
    >
      {t("skipToContent")}
    </a>
  );
}
