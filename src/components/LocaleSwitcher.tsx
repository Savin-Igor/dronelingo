import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<(typeof routing.locales)[number], string> = {
  lv: "LV",
  en: "EN",
  ru: "RU",
};

export function LocaleSwitcher() {
  const current = useLocale();

  return (
    <nav aria-label="Language" className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => {
        const isActive = locale === current;
        return (
          <Link
            key={locale}
            href="/"
            locale={locale}
            aria-current={isActive ? "true" : undefined}
            className={
              isActive
                ? "rounded px-2 py-1 font-semibold text-gray-900"
                : "rounded px-2 py-1 text-gray-500 hover:text-gray-900"
            }
          >
            {LABELS[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
