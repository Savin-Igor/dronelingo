import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
} from "./provider";

/**
 * Stub payment provider — accepts every request after a small delay
 * so the UI can show a realistic "Processing…" state.
 *
 * Real money is never moved. The reference is a stable
 * "stub_<hex>" string that downstream code can recognise.
 */
export class StubProvider implements PaymentProvider {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const ref = `stub_${Math.random().toString(36).slice(2, 10)}`;
    return {
      ok: true,
      reference: ref,
      paidAt: new Date().toISOString(),
      // intentionally tagged so server logs make it obvious this was a stub
      ...{ provider: "stub", req },
    } as PaymentResult;
  }
}

export const stubProvider = new StubProvider();
