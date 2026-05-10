import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/Header";
import { ClientWrapper } from "@/components/layout/ClientWrapper";
import { Plausible } from "@/components/Plausible";
import { SkipToContent } from "@/components/SkipToContent";
import { env } from "@/env";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL, buildMetadata } from "@/lib/seo";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return {
    metadataBase: new URL(SITE_URL),
    ...buildMetadata({
      locale,
      path: "/",
      title: `${SITE_NAME} — ${t("hero.title")}`,
      description: t("valueProp"),
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const plausibleDomain = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  const fontVars = [
    spaceGrotesk.variable,
    inter.variable,
    jetbrainsMono.variable,
  ].join(" ");

  return (
    <html lang={locale} className={fontVars}>
      <body className="antialiased">
        <NextIntlClientProvider>
          <SkipToContent />
          <div className="flex min-h-screen flex-col">
            <Header />
            <div id="main" className="flex-1">
              <ClientWrapper>{children}</ClientWrapper>
            </div>
            <Footer />
          </div>
          <ConsentBanner />
          {plausibleDomain ? <Plausible domain={plausibleDomain} /> : null}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
