import { db } from '@/lib/db';
import { products, suppliers, variants } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';
import Link from 'next/link';
import { ProductActions } from './product-actions';
import { AnimatedCard, StaggerContainer, StaggerItem } from '@/components/admin/animated';
import { parseJsonSafe } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getInventory() {
  return db
    .select({
      id: products.id,
      name: products.name,
      basePrice: products.basePrice,
      onSale: products.onSale,
      salePrice: products.salePrice,
      category: products.category,
      brand: products.brand,
      isActive: products.isActive,
      images: products.images,
      stock: sql<number>`COALESCE(SUM(${variants.stock}), 0)`.as('stock'),
    })
    .from(products)
    .leftJoin(variants, sql`${variants.productId} = ${products.id}`)
    .groupBy(products.id)
    .orderBy(desc(products.createdAt));
}

export default async function InventoryPage() {
  const inventory = await getInventory();

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Inventory</h1>
          <Link
            href="/admin/inventory/add"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Product
          </Link>
        </div>
      </AnimatedCard>

      {inventory.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((product) => {
            const totalStock = product.stock;
            const images = parseJsonSafe(product.images, []) as string[];
            const mainImage = images[0] || null;
            return (
              <StaggerItem key={product.id}>
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-all">
                  <div className="flex gap-3 p-4">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-[var(--color-surface-elevated)]"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[var(--color-surface-elevated)] rounded-lg flex items-center justify-center text-lg">
                        👟
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate text-[var(--color-text)]">
                        {product.name}
                      </h3>
                      <p className="text-[var(--color-text-muted)] text-xs">
                        {product.brand} · {product.category}
                      </p>
                      <div className="mt-1">
                        <span className={`badge ${totalStock > 5 ? 'badge-success' : totalStock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                          {totalStock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex gap-2">
                    <Link
                      href={`/admin/inventory/${product.id}`}
                      className="flex-1 bg-[var(--color-surface-elevated)] hover:bg-primary-50 dark:hover:bg-primary-500/10 text-[var(--color-text-muted)] hover:text-primary-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <ProductActions id={product.id} isActive={product.isActive} />
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
        <div className="bg-[var(--color-surface-elevated)] rounded-xl p-16 text-center">
          <p className="text-[var(--color-text-muted)] text-lg">No products yet</p>
        </div>
      )}
    </div>
  );
}
