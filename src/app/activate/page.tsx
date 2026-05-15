"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { writeAccess } from "@/lib/access";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-cyan-pulse border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-telemetry">Activating your access...</p>
      </div>
    </div>
  );
}

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<
    "loading" | "success" | "error" | "already_used"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Activation link is missing the token.");
      return;
    }

    const activate = async () => {
      try {
        const response = await fetch(`/api/activate?token=${token}`);
        const data = await response.json();

        if (!data.ok) {
          if (data.error === "already_used") {
            setState("already_used");
            setErrorMessage("This activation link has already been used.");
          } else {
            setState("error");
            setErrorMessage(
              "This activation link is invalid or has expired."
            );
          }
          return;
        }

        // Grant access locally
        writeAccess(data.reference, new Date(data.paidAt).getTime());

        setState("success");

        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.replace("/learn");
        }, 1500);
      } catch (err) {
        console.error("Activation error:", err);
        setState("error");
        setErrorMessage("An error occurred. Please try again.");
      }
    };

    activate();
  }, [token, router]);

  if (state === "loading") {
    return <LoadingState />;
  }

  if (state === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold text-hud-white mb-2">
            Access Activated
          </h1>
          <p className="text-telemetry mb-4">
            Your full access is now active. Redirecting you to the learning
            platform...
          </p>
          <p className="text-muted text-sm">
            If the page doesn&apos;t redirect, you can manually{" "}
            <Link href="/learn" className="text-cyan-pulse hover:underline">
              go to the learning platform
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">✗</div>
        <h1 className="text-2xl font-semibold text-hud-white mb-2">
          {state === "already_used" ? "Link Already Used" : "Activation Failed"}
        </h1>
        <p className="text-telemetry mb-6">{errorMessage}</p>
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="inline-block px-5 py-3 bg-cyan-pulse/10 border border-cyan-pulse text-cyan-pulse rounded-sm hover:bg-cyan-pulse hover:text-void transition-colors"
          >
            Return to Pricing
          </Link>
          <p className="text-muted text-sm">
            Need help? Contact{" "}
            <a
              href="mailto:admin@dronelingo.eu"
              className="text-cyan-pulse hover:underline"
            >
              admin@dronelingo.eu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ActivateContent />
    </Suspense>
  );
}
