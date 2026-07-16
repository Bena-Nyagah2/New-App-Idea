import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, orderId } = body as {
      phoneNumber?: string;
      amount?: number;
      orderId?: string;
    };

    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json(
        { error: 'phoneNumber, amount, and orderId are required' },
        { status: 400 },
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: 'Amount must be at least 1' },
        { status: 400 },
      );
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 },
      );
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 409 },
      );
    }

    // Convert cents to KES for Safaricom (amount from frontend is in cents)
    const amountInKes = Math.round(amount / 100);

    const stkResponse = await initiateStkPush({
      phoneNumber,
      amount: amountInKes,
      accountRef: orderId,
      description: `Payment for order ${orderId}`,
    });

    await db
      .update(orders)
      .set({
        paymentMethod: 'mpesa',
        mpesaPhoneNumber: phoneNumber,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        status: 'pending',
        paymentStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      message: stkResponse.CustomerMessage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'STK Push failed';
    console.error('[STK Push Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
