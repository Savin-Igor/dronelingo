import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header() {
  const t = useTranslations("nav");
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-base font-semibold text-gray-900">
            dronelingo
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/learn"
              className="text-gray-600 hover:text-gray-900"
            >
              {t("learn")}
            </Link>
            <Link
              href="/practice"
              className="text-gray-600 hover:text-gray-900"
            >
              {t("practice")}
            </Link>
            <Link
              href="/exam"
              className="text-gray-600 hover:text-gray-900"
            >
              {t("exam")}
            </Link>
            <Link
              href="/claim"
              className="text-gray-600 hover:text-gray-900"
            >
              {t("claim")}
            </Link>
          </nav>
        </div>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
