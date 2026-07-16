const DARAJA_BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const SHORTCODE = process.env.MPESA_SHORTCODE!;
const PASSKEY = process.env.MPESA_PASSKEY!;
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

function getTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

export function generatePassword(timestamp: string): string {
  const data = `${SHORTCODE}${PASSKEY}${timestamp}`;
  return Buffer.from(data).toString('base64');
}

export async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  const res = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Daraja OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function initiateStkPush(args: {
  phoneNumber: string;
  amount: number;
  accountRef: string;
  description?: string;
}): Promise<StkPushResponse> {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = generatePassword(timestamp);

  // Format phone: strip +, ensure 254 prefix
  let phone = args.phoneNumber.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = `254${phone.slice(1)}`;
  if (!phone.startsWith('254')) phone = `254${phone}`;

  const res = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(args.amount),
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: args.accountRef.slice(0, 12),
      TransactionDesc: (args.description || 'Payment').slice(0, 13),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`STK Push failed (${res.status}): ${text}`);
  }

  return res.json();
}

export function parseStkCallback(payload: StkCallbackPayload) {
  const cb = payload.Body.stkCallback;
  const metadata = cb.CallbackMetadata?.Item || [];
  const get = (name: string) => metadata.find(i => i.Name === name)?.Value;

  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    amount: get('Amount') as number | undefined,
    mpesaReceiptNumber: get('MpesaReceiptNumber') as string | undefined,
    phoneNumber: get('PhoneNumber') as string | undefined,
    transactionDate: get('TransactionDate') as string | undefined,
  };
}
