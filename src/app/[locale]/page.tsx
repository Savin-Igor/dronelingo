import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <p className="text-lg text-gray-600">{t("tagline")}</p>
    </main>
  );
}
