import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900">
        {t("title")}
      </h1>
      <p className="mt-4 text-gray-600">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
