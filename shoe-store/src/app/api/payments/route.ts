import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, variants } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { initializePayment } from '@/lib/paystack';
import { z } from 'zod';

const paymentSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
  county: z.string().default('nairobi'),
  area: z.string().optional(),
  address: z.string().min(5),
  deliveryType: z.enum(['boda', 'courier', 'pickup']),
  deliveryFee: z.number().min(0),
  total: z.number().positive(),
  subtotal: z.number().positive(),
  notes: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number().min(1),
  })),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = paymentSchema.parse(body);

    // Validate stock for all items before doing anything
    const stockErrors: string[] = [];
    const validItems: { variantId: string; quantity: number; variant: any }[] = [];

    for (const item of data.items) {
      const variant = await db.select().from(variants)
        .where(eq(variants.id, item.variantId))
        .limit(1);
      
      if (variant.length === 0) {
        stockErrors.push(`Variant ${item.variantId} not found`);
        continue;
      }
      const v = variant[0];
      if (v.stock < item.quantity) {
        stockErrors.push(`${v.size} ${v.color} only has ${v.stock} left (requested ${item.quantity})`);
        continue;
      }
      validItems.push({ variantId: item.variantId, quantity: item.quantity, variant: v });
    }

    if (stockErrors.length > 0) {
      return NextResponse.json({ error: 'Stock validation failed', details: stockErrors }, { status: 400 });
    }

    const reference = `SHOE-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Create a pending order immediately (prevents double-init)
    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
      id: orderId,
      customerEmail: data.email,
      customerName: data.name,
      customerPhone: data.phone,
      shippingAddress: `${data.area}, ${data.address}`,
      county: data.county,
      deliveryType: data.deliveryType,
      deliveryFee: data.deliveryFee,
      status: 'pending',
      paymentMethod: 'paystack',
      paymentStatus: 'pending',
      paystackReference: reference,
      subtotal: data.subtotal,
      tax: 0,
      total: data.total,
      notes: data.notes || null,
    });

    // Create order items
    for (const item of validItems) {
      const v = item.variant;
      await db.insert(orderItems).values({
        id: crypto.randomUUID(),
        orderId,
        variantId: v.id,
        productName: '', // Will be filled by webhook or we can resolve now
        variantSize: v.size,
        variantColor: v.color,
        quantity: item.quantity,
        unitPrice: Math.round(data.subtotal / data.items.reduce((sum, i) => sum + i.quantity, 0)),
        totalPrice: Math.round(data.subtotal / data.items.reduce((sum, i) => sum + i.quantity, 0)) * item.quantity,
      });

      // Decrement stock optimistically
      await db.update(variants)
        .set({ stock: sql`GREATEST(${variants.stock} - ${item.quantity}, 0)` })
        .where(eq(variants.id, v.id));
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`;

    try {
      const response = await initializePayment({
        email: data.email,
        amount: data.total,
        reference,
        callbackUrl,
        metadata: {
          orderId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          county: data.county,
          area: data.area || '',
          address: data.address,
          deliveryType: data.deliveryType,
          deliveryFee: data.deliveryFee,
          subtotal: data.subtotal,
          notes: data.notes || '',
          items: JSON.stringify(data.items.map((item) => {
            const valid = validItems.find(v => v.variantId === item.variantId);
            return {
              ...item,
              productName: valid?.variant.productId || '',
              variantSize: valid?.variant.size || '',
              variantColor: valid?.variant.color || '',
              unitPrice: valid ? Math.round(data.subtotal / data.items.reduce((sum, i) => sum + i.quantity, 0)) : 0,
            };
          })),
        },
      });

      if (response.data.status) {
        return NextResponse.json({
          status: 'success',
          authorizationUrl: response.data.authorization_url,
          reference,
        });
      } else {
        // Revert stock on failure
        for (const item of validItems) {
          await db.update(variants)
            .set({ stock: sql`${variants.stock} + ${item.quantity}` })
            .where(eq(variants.id, item.variantId));
        }
        await db.delete(orders).where(eq(orders.id, orderId));
        return NextResponse.json({ error: 'Payment initialization failed' }, { status: 400 });
      }
    } catch (paystackError) {
      console.error('Paystack initialization error:', paystackError);
      // Revert stock on failure
      for (const item of validItems) {
        await db.update(variants)
          .set({ stock: sql`${variants.stock} + ${item.quantity}` })
          .where(eq(variants.id, item.variantId));
      }
      await db.delete(orders).where(eq(orders.id, orderId));
      return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payment data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
