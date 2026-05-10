import Image from "next/image";
import { useTranslations } from "next-intl";

const CARDS = ["localFirst", "passOrFree", "euAligned"] as const;

export function WhyDronelingo() {
  const t = useTranslations("landing.why");

  return (
    <section className="bg-cockpit px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-cyan-pulse">
          Why us
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-hud-white">
          {t("heading")}
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {CARDS.map((card) => {
            const isFeature = card === "localFirst";
            return (
              <div
                key={card}
                className={`relative overflow-hidden rounded-sm border bg-void p-6 transition-colors ${
                  isFeature
                    ? "border-cyan-pulse/25 hover:border-cyan-pulse/50"
                    : "border-horizon hover:border-signal"
                }`}
              >
                {isFeature && (
                  <>
                    <Image
                      src="/pilot-fpv.jpg"
                      alt=""
                      fill
                      className="object-cover object-center opacity-[0.12]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-void/50"
                      aria-hidden
                    />
                  </>
                )}
                <div className="relative z-10">
                  <h3 className="font-display text-base font-semibold text-hud-white">
                    {t(`${card}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-telemetry">
                    {t(`${card}.body`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
