import { db } from '@/lib/db';
import { products, variants } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ProductActions } from './product-actions';
export const dynamic = 'force-dynamic';

async function getProducts() {
  return db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(50);
}

async function getVariantsForProduct(productId: string) {
  return db
    .select()
    .from(variants)
    .where(eq(variants.productId, productId));
}

export default async function InventoryPage() {
  const productsList = await getProducts();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Link href="/admin/inventory/add" className="btn btn-primary text-sm">
          + Add Product
        </Link>
      </div>

      {productsList.length > 0 ? (
        <div className="space-y-4">
          {productsList.map(async (product) => {
            const productVariants = await getVariantsForProduct(product.id);
            const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0);
            const images = JSON.parse(product.images || '[]');
            
            return (
              <div key={product.id} className="bg-white rounded-2xl border overflow-hidden card-3d">
                <div className="flex items-start gap-4 p-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    {images[0] && (
                      <Image src={images[0]} alt={product.name} width={80} height={80} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary-600 uppercase">{product.brand}</span>
                      <span className="text-sm text-gray-500 capitalize">· {product.category}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600">{formatPrice(product.basePrice)}</p>
                    
                    {/* Stock summary */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        totalStock > 10 ? 'bg-green-100 text-green-700' :
                        totalStock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                      </span>
                      <span className="text-sm text-gray-400">{productVariants.length} variants</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProductActions productId={product.id} />
                  </div>
                </div>
                
                {/* Variants quick view */}
                <div className="border-t bg-gray-50 px-4 py-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {productVariants.slice(0, 10).map(variant => (
                      <span key={variant.id} className={`px-2 py-0.5 rounded-full border ${
                        variant.stock > 0 ? 'border-green-200 bg-green-50 text-green-700' :
                        'border-red-200 bg-red-50 text-red-300'
                      }`}>
                        {variant.size}/{variant.color}: {variant.stock || 0}
                      </span>
                    ))}
                    {productVariants.length > 10 && (
                      <span className="px-2 py-0.5 text-gray-400">+{productVariants.length - 10} more</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-16 text-center">
          <p className="text-gray-500 text-lg">No products yet</p>
          <p className="text-gray-400 text-sm mt-2">Add your first shoe product to get started</p>
          <Link href="/admin/inventory/add" className="mt-4 inline-flex btn btn-primary">
            Add First Product
          </Link>
        </div>
      )}
    </div>
  );
}