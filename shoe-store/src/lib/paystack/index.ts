import paystack from 'paystack';

const paystackClient = paystack(process.env.PAYSTACK_SECRET_KEY!);

export { paystackClient as paystack };

export async function initializePayment(data: {
  email: string;
  amount: number; // in cents
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackClient.transaction.initialize({
    email: data.email,
    amount: data.amount,
    reference: data.reference,
    callback_url: data.callbackUrl,
    currency: 'KES',
    channels: ['card', 'mobile_money', 'bank'],
    metadata: data.metadata,
  });
}

export async function verifyPayment(reference: string) {
  return paystackClient.transaction.verify(reference);
}

export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<boolean> {
  const crypto = await import('crypto');
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

export function formatForPaystack(amountInCents: number): number {
  // Paystack expects amount in kobo (smallest currency unit)
  // For KES, 1 KES = 100 cents, but Paystack treats KES as kobo-equivalent
  return amountInCents;
}

export function parsePaystackAmount(amount: number): number {
  return amount; // Already in cents
}