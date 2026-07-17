import { NextRequest, NextResponse } from 'next/server';
import { parseStkCallback, type StkCallbackPayload } from '@/lib/mpesa';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const payload: StkCallbackPayload = raw;
    const result = parseStkCallback(payload);

    console.log('[M-Pesa Callback] Received:', {
      checkoutRequestId: result.checkoutRequestId,
      resultCode: result.resultCode,
      resultDesc: result.resultDesc,
      mpesaReceiptNumber: result.mpesaReceiptNumber,
      phoneNumber: result.phoneNumber,
      amount: result.amount,
    });

    const order = await db.query.orders.findFirst({
      where: eq(orders.checkoutRequestId, result.checkoutRequestId),
    });

    if (!order) {
      console.warn('[M-Pesa Callback] No order found for checkoutRequestId:', result.checkoutRequestId);
      return NextResponse.json({ result: '0' });
    }

    console.log('[M-Pesa Callback] Found order:', order.id, 'current status:', order.status);

    if (result.resultCode === 0 && result.mpesaReceiptNumber) {
      await db
        .update(orders)
        .set({
          status: 'paid',
          paymentStatus: 'paid',
          mpesaReceiptNumber: result.mpesaReceiptNumber,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.log('[M-Pesa Callback] Order', order.id, 'updated to paid. Receipt:', result.mpesaReceiptNumber);
    } else {
      await db
        .update(orders)
        .set({
          status: 'pending',
          paymentStatus: 'failed',
          notes: result.resultDesc,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      console.warn('[M-Pesa Callback] Payment failed for order', order.id, ':', result.resultDesc);
    }

    return NextResponse.json({ result: '0' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Callback failed';
    console.error('[M-Pesa Callback] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
