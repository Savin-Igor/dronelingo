import { useTranslations } from "next-intl";

const STEPS = ["learn", "practice", "pass"] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section id="how-it-works" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-semibold text-gray-900">
          {t("heading")}
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                {t(`${step}.title`)}
              </h3>
              <p className="mt-2 text-gray-600">{t(`${step}.body`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
