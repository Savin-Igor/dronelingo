"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { writeClaim } from "@/lib/anonymous-claim";
import { stubProvider } from "@/lib/payment/stub";

const CAA_ID_PATTERN = /^LVA-RP-\d{12}$/;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type Kind = "PDF" | "CAA_ID";

export function ClaimFlow() {
  const t = useTranslations("claim");
  const [kind, setKind] = useState<Kind>("PDF");
  const [file, setFile] = useState<File | null>(null);
  const [caaId, setCaaId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): string | null {
    if (kind === "PDF") {
      if (!file) return t("errors.missing");
      if (file.size > MAX_FILE_BYTES) return t("errors.fileTooLarge");
    } else {
      if (!caaId) return t("errors.missing");
      if (!CAA_ID_PATTERN.test(caaId.trim())) return t("errors.caaIdFormat");
    }
    return null;
  }

  async function handlePay() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
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
      setError("Payment failed");
      return;
    }
    writeClaim({
      id: result.reference,
      kind,
      caaIdRef: kind === "CAA_ID" ? caaId.trim() : null,
      fileName: kind === "PDF" && file ? file.name : null,
      email: email || null,
      paidAt: result.paidAt,
      paymentRef: result.reference,
    });
    setProcessing(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <section className="rounded-sm border border-green-clear/30 bg-green-clear/10 p-8 text-center">
        <p className="font-display text-2xl font-semibold text-green-clear">
          {t("checkout.success")}
        </p>
        <p className="mt-3 text-sm text-telemetry">{t("checkout.successBody")}</p>
        <Link
          href="/exam"
          className="mt-6 inline-flex rounded-sm border border-horizon px-5 py-2.5 text-sm font-medium text-telemetry transition-colors hover:border-signal hover:text-hud-white"
        >
          {t("checkout.back")}
        </Link>
      </section>
    );
  }

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
        Pilot license
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-hud-white">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-telemetry">{t("subtitle")}</p>

      {/* ── Verification method ─────────────────────────────────────── */}
      <section className="mt-6 rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("kindHeading")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <KindButton
            active={kind === "PDF"}
            onClick={() => setKind("PDF")}
            label={t("kindPdf")}
          />
          <KindButton
            active={kind === "CAA_ID"}
            onClick={() => setKind("CAA_ID")}
            label={t("kindCaaId")}
          />
        </div>

        <div className="mt-6 space-y-5">
          {kind === "PDF" ? (
            <div>
              <label
                htmlFor="claim-file"
                className="font-mono text-xs uppercase tracking-widest text-telemetry"
              >
                {t("fileLabel")}
              </label>
              <input
                id="claim-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-telemetry file:mr-4 file:cursor-pointer file:rounded-sm file:border file:border-cyan-pulse/40 file:bg-cyan-pulse/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-pulse hover:file:bg-cyan-pulse/20"
              />
              <p className="mt-2 font-mono text-xs text-muted">{t("fileHint")}</p>
              {file && (
                <p className="mt-1 font-mono text-xs text-green-clear">
                  {t("fileSelected", { name: file.name })}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label
                htmlFor="claim-caa-id"
                className="font-mono text-xs uppercase tracking-widest text-telemetry"
              >
                {t("caaIdLabel")}
              </label>
              <input
                id="claim-caa-id"
                type="text"
                value={caaId}
                onChange={(e) => setCaaId(e.target.value)}
                placeholder={t("caaIdPlaceholder")}
                className="mt-2 block w-full rounded-sm border border-horizon bg-hull px-3 py-2.5 font-mono text-sm text-hud-white placeholder:text-muted focus:border-cyan-pulse/50 focus:outline-none"
              />
              <p className="mt-2 font-mono text-xs text-muted">{t("caaIdHint")}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="claim-email"
              className="font-mono text-xs uppercase tracking-widest text-telemetry"
            >
              {t("emailLabel")}
            </label>
            <input
              id="claim-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="mt-2 block w-full rounded-sm border border-horizon bg-hull px-3 py-2.5 text-sm text-hud-white placeholder:text-muted focus:border-cyan-pulse/50 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* ── Payment ─────────────────────────────────────────────────── */}
      <section className="mt-4 rounded-sm border border-horizon bg-cockpit p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-cyan-pulse">
          {t("checkout.heading")}
        </h2>
        <p className="mt-2 font-mono text-xs text-muted">{t("checkout.note")}</p>

        <div className="mt-4 flex items-center justify-between rounded-sm border border-horizon bg-hull px-4 py-3">
          <span className="text-sm text-telemetry">dronelingo Pass Guarantee</span>
          <span className="font-mono text-base font-semibold text-hud-white">
            {t("checkout.amount")}
          </span>
        </div>

        {error && (
          <div className="mt-4 border-l-2 border-red-danger bg-red-danger/10 p-3">
            <p className="text-sm text-red-danger">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={processing}
          className="mt-5 w-full rounded-sm border border-cyan-pulse bg-cyan-pulse/10 px-5 py-3 text-sm font-medium text-cyan-pulse transition-colors hover:bg-cyan-pulse hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
        >
          {processing ? t("checkout.processing") : t("checkout.pay")}
        </button>
      </section>
    </>
  );
}

function KindButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-sm border p-4 text-left text-sm font-medium transition-colors ${
        active
          ? "border-cyan-pulse/50 bg-signal/20 text-hud-white"
          : "border-horizon bg-cockpit text-telemetry hover:border-signal hover:text-hud-white"
      }`}
    >
      {label}
    </button>
  );
}
