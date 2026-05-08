/**
 * Anonymous claim record stored in localStorage until DB-backed
 * Certificate model wires up after #9 NextAuth.
 */
const STORAGE_KEY = "dronelingo:claim:v1";

export type StoredClaim = {
  id: string;
  kind: "PDF" | "CAA_ID";
  caaIdRef: string | null;
  fileName: string | null;
  email: string | null;
  paidAt: string;
  paymentRef: string;
};

export function readClaim(): StoredClaim | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredClaim;
  } catch {
    return null;
  }
}

export function writeClaim(claim: StoredClaim): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claim));
  window.dispatchEvent(new Event("dronelingo:claim-changed"));
}
