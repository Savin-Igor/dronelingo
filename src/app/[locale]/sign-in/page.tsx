import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in — dronelingo",
  robots: { index: false },
};

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{t("signIn")}</h1>
          <p className="text-sm text-muted-foreground">{t("signInDesc")}</p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
