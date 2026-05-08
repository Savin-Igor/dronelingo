/**
 * Payment provider abstraction.
 *
 * MVP uses StubProvider — real Stripe lands once the stub flow has
 * been completed by ≥10 distinct users (per docs/mvp-plan.md §6).
 *
 * The shape mirrors what a real Stripe Checkout session result looks
 * like enough that swapping the implementation will not require
 * rewriting callers.
 */
export type PaymentRequest = {
  /** Amount in the smallest currency unit (cents). */
  amount: number;
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string;
  /** Free-form reference, e.g. user id or anonymous session id. */
  userRef: string;
  /** Optional contact email collected at checkout. */
  email?: string;
};

export type PaymentResult = {
  ok: boolean;
  reference: string;
  paidAt: string;
};

export interface PaymentProvider {
  processPayment(req: PaymentRequest): Promise<PaymentResult>;
}
