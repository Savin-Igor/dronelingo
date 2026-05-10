import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background image + gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src="/hero-cinematic.jpg"
          alt=""
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/50 to-void/95"
          aria-hidden
        />
      </div>

      {/* Tactical grid overlay */}
      <div className="tactical-grid absolute inset-0 opacity-50" aria-hidden />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-pulse">
          EASA A1/A3 &middot; Latvia &middot; EU Compliant
        </p>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-tight tracking-tight text-hud-white sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-telemetry">{t("sub")}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-7 py-3 text-sm font-medium text-cyan-pulse transition hover:bg-cyan-pulse hover:text-void"
          >
            {t("ctaPrimary")} →
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-sm border border-horizon px-7 py-3 text-sm font-medium text-telemetry transition hover:border-telemetry hover:text-hud-white"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>

      {/* HUD telemetry decoration */}
      <div
        className="absolute bottom-16 left-6 hidden font-mono text-xs text-cyan-pulse/40 sm:block"
        aria-hidden
      >
        ALT: 45m &nbsp;&middot;&nbsp; SPD: 0 m/s &nbsp;&middot;&nbsp; GPS: LOCKED
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-hud-white/30"
        aria-hidden
      >
        <ChevronDown />
      </div>
    </section>
  );
}
