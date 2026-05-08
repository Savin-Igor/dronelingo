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
      <section className="rounded-xl border border-green-300 bg-green-50 p-8 text-center">
        <p className="text-2xl font-semibold text-green-900">
          {t("checkout.success")}
        </p>
        <p className="mt-3 text-sm text-green-900/80">
          {t("checkout.successBody")}
        </p>
        <Link
          href="/exam"
          className="mt-6 inline-flex rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          {t("checkout.back")}
        </Link>
      </section>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("subtitle")}</p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
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

        <div className="mt-6 space-y-4">
          {kind === "PDF" ? (
            <div>
              <label
                htmlFor="claim-file"
                className="text-sm font-medium text-gray-900"
              >
                {t("fileLabel")}
              </label>
              <input
                id="claim-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-700"
              />
              <p className="mt-2 text-xs text-gray-500">{t("fileHint")}</p>
              {file && (
                <p className="mt-1 text-xs text-gray-700">
                  {t("fileSelected", { name: file.name })}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label
                htmlFor="claim-caa-id"
                className="text-sm font-medium text-gray-900"
              >
                {t("caaIdLabel")}
              </label>
              <input
                id="claim-caa-id"
                type="text"
                value={caaId}
                onChange={(e) => setCaaId(e.target.value)}
                placeholder={t("caaIdPlaceholder")}
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
              <p className="mt-2 text-xs text-gray-500">{t("caaIdHint")}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="claim-email"
              className="text-sm font-medium text-gray-900"
            >
              {t("emailLabel")}
            </label>
            <input
              id="claim-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("checkout.heading")}
        </h2>
        <p className="mt-2 text-xs text-gray-500">{t("checkout.note")}</p>

        <div className="mt-4 flex items-center justify-between rounded-md bg-gray-50 p-4">
          <span className="text-sm text-gray-700">
            dronelingo Pass Guarantee
          </span>
          <span className="text-base font-semibold text-gray-900">
            {t("checkout.amount")}
          </span>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-900">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={processing}
          className="mt-6 w-full rounded-md bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
      className={`rounded-lg border p-4 text-left text-sm font-medium transition ${
        active
          ? "border-gray-900 bg-gray-50 text-gray-900"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}
