const KEY = "dronelingo:access:v1";

export const FREE_TOPIC_SLUG = "air-safety";

export type StoredAccess = {
  ref: string;
  paidAt: number;
};

export function readAccess(): StoredAccess | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAccess;
  } catch {
    return null;
  }
}

export function writeAccess(ref: string, paidAt: number): void {
  if (typeof window === "undefined") return;
  const data: StoredAccess = { ref, paidAt };
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("dronelingo:access-changed"));
}

export function hasAccess(): boolean {
  return readAccess() !== null;
}

export function isFreeTopic(slug: string): boolean {
  return slug === FREE_TOPIC_SLUG;
}
