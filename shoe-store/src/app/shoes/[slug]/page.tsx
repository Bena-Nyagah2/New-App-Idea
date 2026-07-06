import { Metadata } from 'next';
import { db } from '@/lib/db';
import { products, variants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { AddToCartForm } from './add-to-cart-form';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const [product] = await db.select().from(products).where(eq(products.id, slug)).limit(1);
  if (!product) notFound();
  return product;
}

async function getVariants(productId: string) {
  return db.select().from(variants).where(eq(variants.productId, productId));
}

async function getRelatedProducts(category: string, excludeId: string) {
  return db
    .select()
    .from(products)
    .where(eq(products.category, category))
    .limit(5);
}

function parseImages(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  const images = parseImages(product.images || '[]');

  return {
    title: `${product.name} - Shoe Store`,
    description: product.description || `${product.name} - ${product.brand} ${product.category}. Available at Shoe Store Nairobi.`,
    openGraph: {
      title: `${product.name} - Shoe Store`,
      description: `Shop ${product.name} at Shoe Store. ${formatPrice(product.basePrice)}`,
      images: images.slice(0, 3).map(url => ({ url, width: 800, height: 800 })),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const [product, productVariants, relatedProducts] = await Promise.all([
    getProduct(params.slug),
    getVariants(params.slug),
    getRelatedProducts('lifestyle', params.slug).catch(() => []),
  ]);
  
  const images = parseImages(product.images || '[]');
  const inStock = productVariants.some(v => v.stock > 0);
  const allColors = Array.from(new Set(productVariants.map(v => v.color)));
  const allSizes = Array.from(new Set(productVariants.map(v => v.size)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
          <li>/</li>
          <li><Link href="/shoes" className="hover:text-primary-600">Shoes</Link></li>
          <li>/</li>
          <li>
            <Link href={`/shoes?category=${product.category}`} className="hover:text-primary-600 capitalize">
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li aria-current="page" className="text-gray-900 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {!inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-lg font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 hover:border-primary-500 cursor-pointer transition-colors">
                      <Image src={img} alt={`${product.name} view ${i + 2}`} fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center">
              <p className="text-gray-400">No image available</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">{product.brand}</span>
              <span className="text-sm text-gray-500 capitalize">· {product.category}</span>
            </div>
            <h1 className="heading-2">{product.name}</h1>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(product.basePrice)}</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {product.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-body">{product.description}</p>
            </div>
          )}

          {/* Variant Selector */}
          <AddToCartForm
            product={{
              id: product.id,
              name: product.name,
              slug: product.id,
              basePrice: product.basePrice,
              images: images,
            }}
            variants={productVariants.map(v => ({
              id: v.id,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex || undefined,
              stock: v.stock,
            }))}
            allColors={allColors}
            allSizes={allSizes}
            inStock={inStock}
          />

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p className="font-medium text-sm">Fast Nairobi Delivery</p>
                <p className="text-xs text-gray-500">Same/next day delivery via Uber Boda within Nairobi.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="font-medium text-sm">Cash on Delivery Available</p>
                <p className="text-xs text-gray-500">Pay when your shoes arrive. M-Pesa & cards also accepted online.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">Not the right fit? Free exchanges within Nairobi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.filter(p => p.id !== product.id).length > 0 && (
        <section className="section">
          <h2 className="heading-2 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.filter(p => p.id !== product.id).slice(0, 5).map((rel) => (
              <ProductCard
                key={rel.id}
                product={{
                  id: rel.id,
                  name: rel.name,
                  slug: rel.id,
                  brand: rel.brand,
                  category: rel.category,
                  basePrice: rel.basePrice,
                  images: parseImages(rel.images || '[]'),
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}