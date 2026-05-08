import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["lv", "en", "ru"] as const,
  defaultLocale: "lv",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
