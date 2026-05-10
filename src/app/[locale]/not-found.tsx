import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-widest text-cyan-pulse">
        404
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-4 text-telemetry">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-2.5 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
