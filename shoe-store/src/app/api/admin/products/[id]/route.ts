import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, variants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  brand: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  onSale: z.boolean().optional(),
  salePrice: z.number().nullable().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1),
    color: z.string().min(1),
    colorHex: z.string().optional(),
    stock: z.number().min(0),
    costPrice: z.number().min(0).optional(),
    sku: z.string().optional(),
  })).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await db.select().from(products).where(eq(products.id, params.id)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const productVariants = await db.select().from(variants).where(eq(variants.productId, params.id));
    return NextResponse.json({ product: result[0], variants: productVariants });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data = updateProductSchema.parse(body);

    const existing = await db.select({ id: products.id }).from(products).where(eq(products.id, params.id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product fields
    await db.update(products).set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.brand !== undefined && { brand: data.brand }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
      ...(data.onSale !== undefined && { onSale: data.onSale }),
      ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
      ...(data.images !== undefined && { images: JSON.stringify(data.images) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    }).where(eq(products.id, params.id));

    // Sync variants if provided
    if (data.variants) {
      const existingVariants = await db.select({ id: variants.id }).from(variants).where(eq(variants.productId, params.id));
      const existingIds = new Set(existingVariants.map(v => v.id));

      for (const v of data.variants) {
        if (v.id && existingIds.has(v.id)) {
          // Update existing variant
          await db.update(variants).set({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || null,
            stock: v.stock,
            costPrice: v.costPrice || null,
            ...(v.sku && { sku: v.sku }),
            updatedAt: new Date(),
          }).where(eq(variants.id, v.id));
          existingIds.delete(v.id);
        } else {
          // Create new variant
          const variantId = v.id || `${params.id}-${v.size}-${v.color}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await db.insert(variants).values({
            id: variantId,
            productId: params.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || null,
            sku: v.sku || `SKU-${variantId}`,
            stock: v.stock,
            costPrice: v.costPrice || null,
          });
        }
      }

      // Soft-delete variants not in the update list
      for (const id of Array.from(existingIds)) {
        await db.update(variants).set({ stock: 0 }).where(eq(variants.id, id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
