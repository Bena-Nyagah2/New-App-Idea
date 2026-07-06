import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { z } from 'zod';
import { calculateDeliveryFee, getZoneForArea } from '@/lib/utils';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/brevo';

const orderSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
  county: z.string(),
  area: z.string(),
  address: z.string().min(5),
  deliveryType: z.enum(['boda', 'courier', 'pickup']),
  paymentMethod: z.enum(['paystack', 'cod']),
  notes: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().min(1),
  })),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);
    
    // Validate cart has items
    if (data.items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Generate order ID
    const orderId = crypto.randomUUID();
    
    // Create order
    const shippingAddress = JSON.stringify({
      county: data.county,
      area: data.area,
      address: data.address,
      notes: data.notes,
    });

    await db.insert(orders).values({
      id: orderId,
      customerEmail: data.email,
      customerName: data.name,
      customerPhone: data.phone,
      shippingAddress,
      county: data.county,
      deliveryType: data.deliveryType,
      deliveryFee: data.deliveryFee,
      status: data.paymentMethod === 'cod' ? 'pending' : 'confirmed',
      paymentMethod: data.paymentMethod === 'paystack' ? 'paystack' : 'cod',
      paymentStatus: data.paymentMethod === 'paystack' ? 'paid' : 'pending',
      subtotal: data.subtotal,
      tax: 0, // VAT added later when registered
      total: data.total,
      notes: data.notes,
    });

    // Create order items
    for (const item of data.items) {
      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        variantId: item.variantId,
        productName: 'Product', // Will be resolved from variant
        variantSize: '',
        variantColor: '',
        quantity: item.quantity,
        unitPrice: Math.floor(data.subtotal / data.items.length),
        totalPrice: Math.floor(data.subtotal / data.items.length) * item.quantity,
      });
    }

    // Send confirmation email (fire-and-forget)
    sendOrderConfirmationEmail({
      to: data.email,
      name: data.name,
      orderId: orderId.slice(0, 8),
      items: data.items.map((item) => ({
        name: 'Shoe',
        size: '-',
        color: '-',
        quantity: item.quantity,
        price: Math.floor(data.subtotal / data.items.length),
      })),
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      total: data.total,
      deliveryType: data.deliveryType,
      paymentMethod: data.paymentMethod,
      address: data.address,
    }).catch(console.error);

    // Notify admin
    sendAdminNewOrderEmail({
      orderId: orderId.slice(0, 8),
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email,
      total: data.total,
      paymentMethod: data.paymentMethod,
      itemsCount: data.items.length,
    }).catch(console.error);

    return NextResponse.json({ 
      orderId,
      status: 'success',
      message: data.paymentMethod === 'cod' 
        ? 'Order placed. We will confirm via WhatsApp.'
        : 'Order confirmed. Processing...'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid order data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}