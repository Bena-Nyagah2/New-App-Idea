import { db } from '@/lib/db';
import { products, variants } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).optional().default('newest'),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    // Simplified - returns products with first image + stock info
    const items = await db.select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      category: products.category,
      basePrice: products.basePrice,
      images: products.images,
      createdAt: products.createdAt,
    }).from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .limit(query.limit)
      .offset(query.offset);

    return NextResponse.json({ products: items, total: items.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}