import { useTranslations } from "next-intl";

const CARDS = ["localFirst", "passOrFree", "euAligned"] as const;

export function WhyDronelingo() {
  const t = useTranslations("landing.why");

  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold text-gray-900">
          {t("heading")}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {t(`${card}.title`)}
              </h3>
              <p className="mt-2 text-gray-600">{t(`${card}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
