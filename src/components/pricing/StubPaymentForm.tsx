"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { writeAccess } from "@/lib/access";
import { stubProvider } from "@/lib/payment/stub";

export function StubPaymentForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    setError(null);
    setProcessing(true);
    const userRef = email || `anon_${Date.now()}`;
    const result = await stubProvider.processPayment({
      amount: 1900,
      currency: "EUR",
      userRef,
      email: email || undefined,
    });
    if (!result.ok) {
      setProcessing(false);
      setError("Payment failed. Please try again.");
      return;
    }
    writeAccess(result.reference, Date.now());
    router.replace("/learn");
  }

  return (
    <div className="rounded-sm border border-horizon bg-cockpit p-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        One-time payment
      </h2>

      <div className="mt-4 flex items-center justify-between rounded-sm border border-horizon bg-hull px-4 py-3">
        <span className="text-sm text-telemetry">dronelingo — Full Access</span>
        <span className="font-mono text-xl font-semibold text-hud-white">
          €19
        </span>
      </div>

      <div className="mt-4">
        <label
          htmlFor="pricing-email"
          className="font-mono text-xs uppercase tracking-widest text-telemetry"
        >
          Email (optional — for receipt)
        </label>
        <input
          id="pricing-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 block w-full rounded-sm border border-horizon bg-hull px-3 py-2.5 text-sm text-hud-white placeholder:text-muted focus:border-cyan-pulse/50 focus:outline-none"
        />
      </div>

      {error && (
        <div className="mt-4 border-l-2 border-red-danger bg-red-danger/10 p-3">
          <p className="text-sm text-red-danger">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handlePurchase}
        disabled={processing}
        className="mt-5 w-full rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-3 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
      >
        {processing ? "Processing..." : "Get full access — €19 →"}
      </button>

      <p className="mt-4 text-center font-mono text-xs text-muted">
        Stub checkout — no real charge. Access stored in your browser.
      </p>
    </div>
  );
}
