import { NextRequest, NextResponse } from 'next/server';
import { parseStkCallback, type StkCallbackPayload } from '@/lib/mpesa';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const payload: StkCallbackPayload = await req.json();
    const result = parseStkCallback(payload);

    const order = await db.query.orders.findFirst({
      where: eq(orders.checkoutRequestId, result.checkoutRequestId),
    });

    if (!order) {
      return NextResponse.json({ result: '0' });
    }

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
    }

    return NextResponse.json({ result: '0' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Callback failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
