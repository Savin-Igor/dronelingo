import { useTranslations } from "next-intl";

export function ValueProp() {
  const t = useTranslations("landing");

  return (
    <section className="border-y border-horizon bg-hull px-6 py-10">
      <p className="mx-auto max-w-3xl text-center text-lg font-medium leading-relaxed text-hud-white">
        {t("valueProp")}
      </p>
    </section>
  );
}
