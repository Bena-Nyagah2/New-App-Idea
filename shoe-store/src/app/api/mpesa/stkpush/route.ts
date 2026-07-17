import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush, validateEnv } from '@/lib/mpesa';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const missing = validateEnv();
    if (missing.length > 0) {
      console.error('[STK Push] Missing env vars:', missing.join(', '));
      return NextResponse.json(
        { error: `Server configuration error: missing ${missing.join(', ')}` },
        { status: 500 },
      );
    }
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
    console.log('[STK Push] Starting:', { orderId, phoneNumber: phoneNumber.slice(0, 6) + '***', amountInKes });

    const stkResponse = await initiateStkPush({
      phoneNumber,
      amount: amountInKes,
      accountRef: orderId,
      description: `Payment for order ${orderId}`,
    });

    console.log('[STK Push] Safaricom responded:', {
      ResponseCode: stkResponse.ResponseCode,
      CheckoutRequestID: stkResponse.CheckoutRequestID,
      ResponseDescription: stkResponse.ResponseDescription,
    });

    if (!stkResponse.CheckoutRequestID) {
      console.error('[STK Push] Safaricom returned no CheckoutRequestID. Full response:', JSON.stringify(stkResponse));
      return NextResponse.json({ error: 'Safaricom returned no CheckoutRequestID' }, { status: 502 });
    }

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

    console.log('[STK Push] Order', orderId, 'updated with checkoutRequestId:', stkResponse.CheckoutRequestID);

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      merchantRequestId: stkResponse.MerchantRequestID,
      message: stkResponse.CustomerMessage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[STK Push] Failed:', message);
    if (stack) console.error('[STK Push] Stack:', stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
