import type { Metadata } from "next";
import { env } from "@/env";
import { routing } from "@/i18n/routing";

export const SITE_NAME = "dronelingo";
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

type Args = {
  locale: string;
  /** Path without locale, e.g. "/learn" or "/" for root. */
  path: string;
  title: string;
  description: string;
};

/**
 * Build a Metadata object that:
 * - sets a locale-aware canonical url
 * - lists `alternates.languages` for every supported locale
 * - sets twitter and openGraph defaults
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
}: Args): Metadata {
  const cleanPath = path === "/" ? "" : path;
  const canonical = `/${locale}${cleanPath}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `/${l}${cleanPath}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
