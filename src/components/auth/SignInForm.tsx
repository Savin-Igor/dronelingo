"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";

export function SignInForm() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = (params?.locale as string) ?? "lv";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await signIn("nodemailer", {
        email: email.trim(),
        callbackUrl: `/${locale}`,
        redirect: false,
      });
      if (res?.error) {
        setError(t("sendError"));
      } else {
        window.location.href = `/${locale}/sign-in/verify`;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="pilots@example.com"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? t("sending") : t("sendLink")}
      </button>
    </form>
  );
}
