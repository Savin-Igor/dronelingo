import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(32),
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_SECRET: z.string().min(16),
    INVOICE_IBAN: z.string().optional(),
    INVOICE_BIC: z.string().optional(),
    INVOICE_BANK_NAME: z.string().optional(),
    INVOICE_BENEFICIARY: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url().default("https://dronelingo.eu"),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_STRIPE_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === "true"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    INVOICE_IBAN: process.env.INVOICE_IBAN,
    INVOICE_BIC: process.env.INVOICE_BIC,
    INVOICE_BANK_NAME: process.env.INVOICE_BANK_NAME,
    INVOICE_BENEFICIARY: process.env.INVOICE_BENEFICIARY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_STRIPE_ENABLED: process.env.NEXT_PUBLIC_STRIPE_ENABLED,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
