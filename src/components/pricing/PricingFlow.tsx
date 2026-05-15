"use client";

import { useTranslations } from "next-intl";
import { StubPaymentForm } from "./StubPaymentForm";
import { InvoiceForm } from "./InvoiceForm";

export function PricingFlow() {
  const t = useTranslations("pricing");
  const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";
  const features = [
    t("features.lessons"),
    t("features.practice"),
    t("features.exams"),
    t("features.languages"),
    t("features.sources"),
    t("features.payment"),
  ];

  return (
    <div className="mx-auto max-w-lg">
      {/* What's included */}
      <div className="rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("includedHeading")}
        </h2>
        <ul className="mt-4 space-y-2.5">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-telemetry"
            >
              <span className="mt-0.5 shrink-0 text-green-clear">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment method */}
      <div className="mt-4">
        {stripeEnabled ? <StubPaymentForm /> : <InvoiceForm />}
      </div>

      <p className="mt-4 text-center font-mono text-xs text-muted">
        {t("freeNote")}
      </p>
    </div>
  );
}
