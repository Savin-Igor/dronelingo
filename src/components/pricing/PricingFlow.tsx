"use client";

import { StubPaymentForm } from "./StubPaymentForm";
import { InvoiceForm } from "./InvoiceForm";

const FEATURES = [
  "All 9 EASA A1/A3 topics with full lessons",
  "45+ practice drills per topic",
  "Unlimited mock exams (40 questions, timed)",
  "Latvian, English & Russian",
  "EASA regulation references on every question",
  "One-time payment — no subscription, no expiry",
];

export function PricingFlow() {
  const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

  return (
    <div className="mx-auto max-w-lg">
      {/* What's included */}
      <div className="rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          Full access includes
        </h2>
        <ul className="mt-4 space-y-2.5">
          {FEATURES.map((f) => (
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
        Air Safety topic is always free — no payment needed.
      </p>
    </div>
  );
}
