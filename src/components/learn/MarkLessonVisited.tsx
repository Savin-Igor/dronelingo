"use client";

import { useEffect } from "react";
import { markVisited } from "@/lib/anonymous-progress";

export function MarkLessonVisited({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    markVisited(lessonId);
  }, [lessonId]);
  return null;
}
