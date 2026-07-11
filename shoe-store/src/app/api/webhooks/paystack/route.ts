import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, variants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
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
      const { reference, amount, metadata, customer } = event.data;

      // Check if order already exists (idempotent)
      const existing = await db.select({ id: orders.id })
        .from(orders)
        .where(eq(orders.paystackReference, reference));

      if (existing.length > 0) {
        return NextResponse.json({ status: 'Already processed' });
      }

      const orderId = crypto.randomUUID();
      const itemsData: any[] = metadata?.items ? JSON.parse(metadata.items) : [];

      // Validate stock for every item before inserting anything
      const stockErrors: string[] = [];
      const validItems: any[] = [];

      for (const item of itemsData) {
        const variant = await db.select().from(variants).where(eq(variants.id, item.variantId)).limit(1);
        if (variant.length === 0) {
          stockErrors.push(`Variant ${item.variantId} not found`);
          continue;
        }
        const v = variant[0];
        const qty = item.quantity || 1;
        if (v.stock < qty) {
          stockErrors.push(`${item.variantId} only has ${v.stock} in stock (requested ${qty})`);
          continue;
        }
        validItems.push({ ...item, resolvedVariant: v, quantity: qty });
      }

      if (stockErrors.length > 0) {
        console.error('Webhook stock validation failed:', stockErrors);
        // Still return 200 so Paystack doesn't retry — but log for manual review
        return NextResponse.json({ status: 'Stock validation failed', errors: stockErrors });
      }

      // Create order
      await db.insert(orders).values({
        id: orderId,
        customerEmail: customer?.email || metadata?.email || '',
        customerName: metadata?.name || customer?.first_name || '',
        customerPhone: metadata?.phone || '',
        shippingAddress: metadata?.address || '',
        county: metadata?.county || 'nairobi',
        deliveryType: metadata?.deliveryType || 'boda',
        deliveryFee: metadata?.deliveryFee || 0,
        status: 'confirmed',
        paymentMethod: 'paystack',
        paymentStatus: 'paid',
        paystackReference: reference,
        subtotal: metadata?.subtotal || amount,
        tax: 0,
        total: amount,
        notes: metadata?.notes || null,
      });

      // Create order items + decrement stock
      for (const item of validItems) {
        const v = item.resolvedVariant;
        await db.insert(orderItems).values({
          id: crypto.randomUUID(),
          orderId,
          variantId: v.id,
          productName: item.productName || '',
          variantSize: item.variantSize || v.size || '',
          variantColor: item.variantColor || v.color || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.unitPrice || 0) * item.quantity,
        });

        // Decrement stock
        await db.update(variants)
          .set({ stock: sql`GREATEST(${variants.stock} - ${item.quantity}, 0)` })
          .where(eq(variants.id, v.id));
      }

      // Send emails
      const customerEmail = customer?.email || metadata?.email || '';
      if (customerEmail) {
        sendOrderConfirmationEmail({
          to: customerEmail,
          name: metadata?.name || customer?.first_name || 'Customer',
          orderId: orderId.slice(0, 8),
          items: validItems.map((item: any) => ({
            name: item.productName || 'Shoe',
            size: item.variantSize || item.resolvedVariant.size || '-',
            color: item.variantColor || item.resolvedVariant.color || '-',
            quantity: item.quantity,
            price: item.unitPrice || 0,
          })),
          subtotal: metadata?.subtotal || amount,
          deliveryFee: metadata?.deliveryFee || 0,
          total: amount,
          deliveryType: metadata?.deliveryType || 'boda',
          paymentMethod: 'paystack',
          address: metadata?.address || 'Not specified',
        }).catch(console.error);
      }

      sendAdminNewOrderEmail({
        orderId: orderId.slice(0, 8),
        customerName: metadata?.name || customer?.first_name || 'Customer',
        customerPhone: metadata?.phone || 'Not provided',
        customerEmail: customerEmail || 'Not provided',
        total: amount,
        paymentMethod: 'paystack',
        itemsCount: validItems.length,
      }).catch(console.error);
    }

    return NextResponse.json({ status: 'Received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
