import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/paystack';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventType = event.event;

    // Only handle successful charges
    if (eventType === 'charge.success') {
      const { reference, amount, metadata, customer } = event.data;
      
      // Check if order already exists
      const existing = await db.select({ id: orders.id })
        .from(orders)
        .where(eq(orders.paystackReference, reference));
      
      if (existing.length > 0) {
        return NextResponse.json({ status: 'Already processed' });
      }

      // Create order from Paystack metadata
      const orderId = crypto.randomUUID();
      const itemsData = metadata?.items ? JSON.parse(metadata.items) : [];
      
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

      // Create order items
      for (const item of itemsData) {
        await db.insert(orderItems).values({
          id: crypto.randomUUID(),
          orderId,
          variantId: item.variantId,
          productName: item.productName || '',
          variantSize: item.variantSize || '',
          variantColor: item.variantColor || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: (item.unitPrice || 0) * (item.quantity || 1),
        });
      }

      // Send emails
      const customerEmail = customer?.email || metadata?.email || '';
      if (customerEmail) {
        sendOrderConfirmationEmail({
          to: customerEmail,
          name: metadata?.name || customer?.first_name || 'Customer',
          orderId: orderId.slice(0, 8),
          items: itemsData.map((item: any) => ({
            name: item.productName || 'Shoe',
            size: item.variantSize || '-',
            color: item.variantColor || '-',
            quantity: item.quantity || 1,
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
        itemsCount: itemsData.length,
      }).catch(console.error);
    }

    return NextResponse.json({ status: 'Received' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}