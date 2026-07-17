import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'] as const;
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus } = body as {
      status?: string;
      paymentStatus?: string;
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
        return NextResponse.json(
          { error: `Invalid status: ${status}. Allowed: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      updates.status = status;
      if (status === 'confirmed') updates.confirmedAt = new Date();
      if (status === 'shipped') updates.shippedAt = new Date();
      if (status === 'delivered') updates.deliveredAt = new Date();
    }

    if (paymentStatus !== undefined) {
      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus as typeof VALID_PAYMENT_STATUSES[number])) {
        return NextResponse.json(
          { error: `Invalid paymentStatus: ${paymentStatus}. Allowed: ${VALID_PAYMENT_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      updates.paymentStatus = paymentStatus;
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: { id: updated.id, status: updated.status, paymentStatus: updated.paymentStatus } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update order';
    console.error('[Admin Orders] PATCH error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
