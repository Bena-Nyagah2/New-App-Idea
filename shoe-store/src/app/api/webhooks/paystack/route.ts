import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, variants, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/paystack';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = event.event;

    if (eventType === 'charge.success') {
      const { reference, amount, metadata } = event.data;

      // Find existing pending order by reference
      const existingOrder = await db.select()
        .from(orders)
        .where(eq(orders.paystackReference, reference))
        .limit(1);

      if (existingOrder.length === 0) {
        console.error('Webhook received for unknown reference:', reference);
        return NextResponse.json({ status: 'Order not found' });
      }

      const order = existingOrder[0];

      // Already confirmed — idempotent
      if (order.paymentStatus === 'paid' && order.status === 'confirmed') {
        return NextResponse.json({ status: 'Already processed' });
      }

      // Confirm the order
      await db.update(orders).set({
        status: 'confirmed',
        paymentStatus: 'paid',
        confirmedAt: new Date(),
      }).where(eq(orders.id, order.id));

      // Fetch order items for email
      const items = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      // Resolve product names for items
      for (const item of items) {
        if (!item.productName) {
          const variant = await db.select({ productId: variants.productId })
            .from(variants)
            .where(eq(variants.id, item.variantId))
            .limit(1);
          if (variant.length > 0) {
            const product = await db.select({ name: products.name })
              .from(products)
              .where(eq(products.id, variant[0].productId))
              .limit(1);
            if (product.length > 0) {
              await db.update(orderItems)
                .set({ productName: product[0].name })
                .where(eq(orderItems.id, item.id));
              item.productName = product[0].name;
            }
          }
        }
      }

      // Send confirmation email
      if (order.customerEmail) {
        sendOrderConfirmationEmail({
          to: order.customerEmail,
          name: order.customerName || 'Customer',
          orderId: order.id.slice(0, 8),
          items: items.map((item) => ({
            name: item.productName || 'Shoe',
            size: item.variantSize,
            color: item.variantColor,
            quantity: item.quantity,
            price: item.unitPrice,
          })),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          deliveryType: order.deliveryType,
          paymentMethod: 'paystack',
          address: order.shippingAddress || 'Not specified',
        }).catch(console.error);
      }

      // Admin notification
      sendAdminNewOrderEmail({
        orderId: order.id.slice(0, 8),
        customerName: order.customerName || 'Customer',
        customerPhone: order.customerPhone || 'Not provided',
        customerEmail: order.customerEmail || 'Not provided',
        total: order.total,
        paymentMethod: 'paystack',
        itemsCount: items.length,
      }).catch(console.error);
    }

    return NextResponse.json({ status: 'Received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
