export type VerifyResult =
  | { ok: true; txid?: string; amountPi?: number }
  | { ok: false; reason: string };

export async function verifyPiPayment(_paymentId: string): Promise<VerifyResult> {
  // TODO: Pi Network “developer library / backend API” ile gerçek verify burada yapılacak.
  // Şimdilik “ok” dönüyor diye düşünme; prod’da bunu mutlaka bağla.
  return { ok: false, reason: "PI_VERIFY_NOT_IMPLEMENTED" };
}
