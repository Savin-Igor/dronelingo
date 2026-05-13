"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const SYNCED_KEY = "dronelingo:synced:v1";

/**
 * Mount this once in the root layout (client side).
 * After sign-in, fires POST /api/sync once with all localStorage state,
 * then marks as synced so it never runs again on this device.
 */
export function SyncOnSignIn() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SYNCED_KEY)) return;

    const attempts = tryParse("dronelingo:attempts:v1", []);
    const examHistory = tryParse("dronelingo:exam-history:v1", []);
    const lessonProgress = tryParse("dronelingo:lesson-progress:v1", {});

    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempts, examHistory, lessonProgress }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          localStorage.setItem(SYNCED_KEY, "1");
        }
      })
      .catch(() => {
        // silent — will retry on next page load
      });
  }, [status, session?.user?.id]);

  return null;
}

function tryParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
