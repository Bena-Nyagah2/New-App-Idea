import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: {
        status: true,
        paymentStatus: true,
        mpesaReceiptNumber: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
      mpesaReceiptNumber: order.mpesaReceiptNumber,
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const { status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

      await db
        .update(orders)
        .set({
          status,
          updatedAt: new Date(),
          ...(status === 'confirmed' ? { confirmedAt: new Date() } : {}),
          ...(status === 'shipped' ? { shippedAt: new Date() } : {}),
          ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
        })
        .where(eq(orders.id, orderId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}