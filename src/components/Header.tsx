import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header() {
  const t = useTranslations("nav");
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link href="/" className="text-base font-semibold text-gray-900">
          dronelingo
        </Link>
        <nav
          className="order-3 flex w-full items-center gap-4 overflow-x-auto text-sm sm:order-2 sm:w-auto sm:gap-6"
          aria-label="Primary"
        >
          <Link href="/learn" className="text-gray-600 hover:text-gray-900">
            {t("learn")}
          </Link>
          <Link
            href="/practice"
            className="text-gray-600 hover:text-gray-900"
          >
            {t("practice")}
          </Link>
          <Link href="/exam" className="text-gray-600 hover:text-gray-900">
            {t("exam")}
          </Link>
          <Link
            href="/claim"
            className="text-gray-600 hover:text-gray-900"
          >
            {t("claim")}
          </Link>
        </nav>
        <div className="order-2 sm:order-3">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
