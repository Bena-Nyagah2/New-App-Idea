import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, variants, products } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/brevo';

const orderSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
  county: z.string(),
  area: z.string(),
  address: z.string().min(5),
  deliveryType: z.enum(['boda', 'courier', 'pickup']),
  paymentMethod: z.enum(['mpesa', 'paystack', 'cod']),
  notes: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().min(1).max(10),
  })),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    if (data.items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Validate stock for every item
    const stockErrors: string[] = [];
    const validItems: { variantId: string; quantity: number; productName: string; variantSize: string; variantColor: string; unitPrice: number; costPrice: number; productSlug: string; productId: string; image: string }[] = [];

    for (const item of data.items) {
      const variant = await db.select().from(variants).where(eq(variants.id, item.variantId)).limit(1);
      if (variant.length === 0) {
        stockErrors.push(`Variant ${item.variantId} not found`);
        continue;
      }
      const v = variant[0];
      if (v.stock < item.quantity) {
        stockErrors.push(`${item.variantId} only has ${v.stock} in stock (requested ${item.quantity})`);
        continue;
      }

      // Fetch product details for the order snapshot
      const product = await db.select().from(products).where(eq(products.id, v.productId)).limit(1);
      const p = product[0];

      validItems.push({
        variantId: v.id,
        quantity: item.quantity,
        productName: p?.name || 'Product',
        variantSize: v.size,
        variantColor: v.color,
        unitPrice: p?.basePrice || 0,
        costPrice: v.costPrice || 0,
        productSlug: p?.id || '',
        productId: v.productId,
        image: p?.images || '[]',
      });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({ error: 'Some items are out of stock', details: stockErrors }, { status: 409 });
    }

    // Generate order ID
    const orderId = crypto.randomUUID();

    const shippingAddress = JSON.stringify({
      county: data.county,
      area: data.area,
      address: data.address,
      notes: data.notes,
    });

    // Create order
    await db.insert(orders).values({
      id: orderId,
      customerEmail: data.email,
      customerName: data.name,
      customerPhone: data.phone,
      shippingAddress,
      county: data.county,
      deliveryType: data.deliveryType,
      deliveryFee: data.deliveryFee,
      status: data.paymentMethod === 'paystack' ? 'confirmed' : 'pending',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'paystack' ? 'paid' : 'pending',
      subtotal: data.subtotal,
      tax: 0,
      total: data.total,
      notes: data.notes,
    });

    // Create order items + decrement stock
    for (const item of validItems) {
      const totalPrice = item.unitPrice * item.quantity;

      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        variantId: item.variantId,
        productName: item.productName,
        variantSize: item.variantSize,
        variantColor: item.variantColor,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });

      // Decrement stock
      await db.update(variants)
        .set({ stock: sql`MAX(${variants.stock} - ${item.quantity}, 0)` })
        .where(eq(variants.id, item.variantId));
    }

    // Send confirmation email (fire-and-forget)
    sendOrderConfirmationEmail({
      to: data.email,
      name: data.name,
      orderId: orderId.slice(0, 8),
      items: validItems.map((item) => ({
        name: item.productName,
        size: item.variantSize,
        color: item.variantColor,
        quantity: item.quantity,
        price: item.unitPrice,
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
      itemsCount: validItems.length,
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
