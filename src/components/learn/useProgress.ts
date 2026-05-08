"use client";

import { useEffect, useState } from "react";
import { readProgress, type ProgressMap } from "@/lib/anonymous-progress";

export function useProgress(): ProgressMap {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(readProgress());
    function refresh() {
      setProgress(readProgress());
    }
    window.addEventListener("dronelingo:progress-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("dronelingo:progress-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return progress;
}
