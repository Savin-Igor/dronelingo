"use client";

import { useEffect, useState } from "react";
import { hasAccess } from "@/lib/access";

export function useAccessStatus() {
  const [access, setAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const refresh = () => setAccess(hasAccess());
    refresh();
    window.addEventListener("dronelingo:access-changed", refresh);
    return () => window.removeEventListener("dronelingo:access-changed", refresh);
  }, []);

  return access;
}
