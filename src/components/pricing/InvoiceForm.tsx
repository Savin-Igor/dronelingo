"use client";

import { useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

export function InvoiceForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setState("submitting");

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setState("error");
        setErrorMessage(data.error || "Failed to create invoice.");
        return;
      }

      setState("success");
    } catch (err) {
      console.error("Invoice creation error:", err);
      setState("error");
      setErrorMessage("An error occurred. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-sm border border-horizon bg-cockpit p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl text-green-clear">✓</div>
          <div>
            <h3 className="font-mono text-sm font-semibold uppercase tracking-widest text-hud-white mb-2">
              Invoice Sent
            </h3>
            <p className="text-sm text-telemetry mb-3">
              We&apos;ve sent an invoice to <span className="font-mono">{email}</span>
              . Please pay €19 via bank transfer using the details in your
              email.
            </p>
            <p className="text-xs text-muted">
              We&apos;ll activate your access within 1 business day of receiving your
              payment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          Request Invoice
        </h2>

        <div className="mt-4">
          <label
            htmlFor="invoice-name"
            className="font-mono text-xs uppercase tracking-widest text-telemetry"
          >
            Name (optional)
          </label>
          <input
            id="invoice-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-2 block w-full rounded-sm border border-horizon bg-hull px-3 py-2.5 text-sm text-hud-white placeholder:text-muted focus:border-cyan-pulse/50 focus:outline-none"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="invoice-email"
            className="font-mono text-xs uppercase tracking-widest text-telemetry"
          >
            Email (required)
          </label>
          <input
            id="invoice-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-2 block w-full rounded-sm border border-horizon bg-hull px-3 py-2.5 text-sm text-hud-white placeholder:text-muted focus:border-cyan-pulse/50 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-sm border border-horizon bg-hull px-4 py-3">
          <span className="text-sm text-telemetry">dronelingo — Full Access</span>
          <span className="font-mono text-xl font-semibold text-hud-white">
            €19
          </span>
        </div>

        {state === "error" && (
          <div className="mt-4 border-l-2 border-red-danger bg-red-danger/10 p-3">
            <p className="text-sm text-red-danger">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="mt-5 w-full rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-3 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "submitting" ? "Sending..." : "Send Invoice → €19"}
        </button>

        <p className="mt-4 text-center font-mono text-xs text-muted">
          You will receive an invoice email with bank transfer details.
        </p>
      </div>
    </form>
  );
}
