"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dronelingo:consent:v1";

/**
 * Loads the official plausible.io script only after the user has
 * accepted the consent banner. Plausible is cookie-free, but we still
 * gate it behind explicit consent for clarity.
 */
export function Plausible({ domain }: { domain: string }) {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function refresh() {
      setConsented(window.localStorage.getItem(STORAGE_KEY) === "accepted");
    }
    refresh();
    window.addEventListener("dronelingo:consent-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("dronelingo:consent-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!consented) return null;

  // Use the tagged-events extension so DOM elements can fire custom
  // Plausible events via `className="plausible-event-name=..."` without
  // additional JavaScript. Automatic page-views still work.
  return (
    <Script
      strategy="afterInteractive"
      src="https://plausible.io/js/script.tagged-events.js"
      data-domain={domain}
    />
  );
}
