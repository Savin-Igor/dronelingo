import { useTranslations } from "next-intl";

export function ValueProp() {
  const t = useTranslations("landing");

  return (
    <section className="bg-gray-900 px-6 py-8">
      <p className="mx-auto max-w-3xl text-center text-lg font-medium text-white">
        {t("valueProp")}
      </p>
    </section>
  );
}
