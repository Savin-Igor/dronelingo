import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(32),
    AUTH_TRUST_HOST: z.string().optional(),
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    ADMIN_EMAIL: z.string().email().optional(),
    // Optional at boot — when unset, the admin invoice-confirm endpoint
    // refuses every request because `secret !== undefined` for any input.
    // Set this to enable invoice confirmations. 8-char minimum blocks
    // accidentally-empty values; pick something random and long anyway.
    ADMIN_SECRET: z.string().min(8).optional(),
    INVOICE_IBAN: z.string().optional(),
    INVOICE_BIC: z.string().optional(),
    INVOICE_BANK_NAME: z.string().optional(),
    INVOICE_BENEFICIARY: z.string().optional(),
    // When false, /api/search skips the vector retriever and returns
    // lexical-only results. Lets us deploy schema + UI before the first
    // `make index-search` finishes embedding the corpus.
    SEARCH_VECTOR_ENABLED: z
      .string()
      .optional()
      .default("true")
      .transform((v) => v === "true"),
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
    AUTH_URL: process.env.AUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
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
    SEARCH_VECTOR_ENABLED: process.env.SEARCH_VECTOR_ENABLED,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_STRIPE_ENABLED: process.env.NEXT_PUBLIC_STRIPE_ENABLED,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
