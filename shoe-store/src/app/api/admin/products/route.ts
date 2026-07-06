import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, variants } from '@/lib/db/schema';
import { z } from 'zod';
import { slugify, generateSKU } from '@/lib/utils';

const addProductSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  images: z.array(z.string()).optional().default([]),
  variants: z.array(z.object({
    size: z.string().min(1),
    color: z.string().min(1),
    stock: z.number().min(0).default(0),
    costPrice: z.number().min(0).optional(),
    sku: z.string().optional(),
  })).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = addProductSchema.parse(body);

    const slug = slugify(`${data.brand}-${data.name}`);
    const imagesJson = JSON.stringify(data.images);

    // Create product
    await db.insert(products).values({
      id: slug,
      name: data.name,
      brand: data.brand,
      category: data.category,
      description: data.description,
      basePrice: data.basePrice,
      images: imagesJson,
    });

    // Create variants
    for (const variant of data.variants) {
      const variantId = slugify(`${slug}-${variant.size}-${variant.color}`);
      const sku = variant.sku || generateSKU(slug, variant.size, variant.color);

      await db.insert(variants).values({
        id: variantId,
        productId: slug,
        size: variant.size,
        color: variant.color,
        sku,
        stock: variant.stock,
        costPrice: variant.costPrice,
      });
    }

    return NextResponse.json({ 
      success: true, 
      productId: slug,
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('Error adding product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid product data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}