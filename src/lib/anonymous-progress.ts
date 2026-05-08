/**
 * Anonymous lesson-progress tracking via localStorage.
 *
 * Replaced by DB-backed `LessonProgress` once NextAuth (#9) lands.
 * On first sign-in, this map can be uploaded once and then cleared.
 */
const STORAGE_KEY = "dronelingo:lesson-progress:v1";

export type ProgressMap = Record<string, number>;

export function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as ProgressMap)
      : {};
  } catch {
    return {};
  }
}

export function markVisited(lessonId: string): void {
  if (typeof window === "undefined") return;
  const current = readProgress();
  if (current[lessonId]) return;
  current[lessonId] = Date.now();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event("dronelingo:progress-changed"));
}
