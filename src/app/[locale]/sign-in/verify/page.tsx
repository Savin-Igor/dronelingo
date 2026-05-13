import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Check your email — dronelingo",
  robots: { index: false },
};

export default async function VerifyPage() {
  const t = await getTranslations("auth");
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="text-4xl">✉️</div>
        <h1 className="text-2xl font-bold">{t("checkEmail")}</h1>
        <p className="text-sm text-muted-foreground">{t("checkEmailDesc")}</p>
        <Link href="/" className="text-sm underline underline-offset-4">
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
