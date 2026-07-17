import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('WEBHOOK HIT:', JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      console.error('[M-Pesa Callback] Missing Body.stkCallback in payload');
      return NextResponse.json({ result: '0' });
    }

    const resultCode: number | undefined = stkCallback.ResultCode;
    const resultDesc: string | undefined = stkCallback.ResultDesc;
    const checkoutRequestId: string | undefined = stkCallback.CheckoutRequestID;
    const merchantRequestId: string | undefined = stkCallback.MerchantRequestID;

    console.log('[M-Pesa Callback] Parsed stkCallback:', {
      resultCode,
      resultDesc,
      checkoutRequestId,
      merchantRequestId,
    });

    if (!checkoutRequestId) {
      console.error('[M-Pesa Callback] No CheckoutRequestID in stkCallback');
      return NextResponse.json({ result: '0' });
    }

    let mpesaReceiptNumber: string | undefined;
    let amount: number | undefined;
    let phoneNumber: string | undefined;

    const items: Array<{ Name: string; Value: unknown }> =
      stkCallback?.CallbackMetadata?.Item || [];

    for (const item of items) {
      if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value);
      if (item.Name === 'Amount') amount = item.Value as number;
      if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
    }

    console.log('[M-Pesa Callback] Extracted metadata:', {
      mpesaReceiptNumber,
      amount,
      phoneNumber,
      itemCount: items.length,
      itemNames: items.map(i => i.Name),
    });

    const order = await db.query.orders.findFirst({
      where: eq(orders.checkoutRequestId, checkoutRequestId),
    });

    if (!order) {
      console.warn('[M-Pesa Callback] No order found for checkoutRequestId:', checkoutRequestId);
      return NextResponse.json({ result: '0' });
    }

    console.log('[M-Pesa Callback] Found order:', order.id, 'current status:', order.status);

    if (resultCode === 0 && mpesaReceiptNumber) {
      await db
        .update(orders)
        .set({
          status: 'paid',
          paymentStatus: 'paid',
          mpesaReceiptNumber: mpesaReceiptNumber,
          mpesaPhoneNumber: phoneNumber || order.mpesaPhoneNumber,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log('[M-Pesa Callback] SUCCESS - Order', order.id, 'updated. Receipt:', mpesaReceiptNumber);
    } else {
      await db
        .update(orders)
        .set({
          status: 'pending',
          paymentStatus: 'failed',
          notes: resultDesc,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.warn('[M-Pesa Callback] FAILED - Order', order.id, 'resultCode:', resultCode, 'desc:', resultDesc);
    }

    return NextResponse.json({ result: '0' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Callback failed';
    console.error('[M-Pesa Callback] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
