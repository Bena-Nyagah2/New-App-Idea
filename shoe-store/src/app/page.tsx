import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { HomeHeroSection } from './hero-section';
import { TrustIndicators } from './trust-indicators';
import { CategoryCard } from './category-card';
import { BrandMarquee } from './brand-marquee';
import { Tag } from 'lucide-react';
import { motion } from 'framer-motion';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shoe Store | Quality Shoes in Nairobi',
  description: 'Shop the latest running, lifestyle, and basketball shoes. Fast delivery in Nairobi via Uber Boda. Pay online or cash on delivery.',
};

async function getFeaturedProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(8);
}

async function getCategories() {
  return db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.isActive, true));
}

async function getBrands() {
  return db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .where(eq(products.isActive, true));
}

async function getSaleProducts() {
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.onSale, true)))
    .orderBy(desc(products.updatedAt))
    .limit(4);
}

export default async function HomePage() {
  const [featuredProducts, categories, brands, saleProducts] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getBrands(),
    getSaleProducts(),
  ]);

  const heroProduct = featuredProducts[0];
  const heroImages = heroProduct ? JSON.parse(heroProduct.images || '[]') : [];
  const heroImage = heroImages[0] || '/placeholder.svg';

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HomeHeroSection
        productName={heroProduct?.name || 'Premium Sneakers'}
        productBrand={heroProduct?.brand || 'Top Brands'}
        productPrice={heroProduct ? formatPrice(heroProduct.basePrice) : 'KES 3,500'}
        productImage={heroImage}
      />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Featured Products */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2">Featured Shoes</h2>
              <p className="text-body mt-1">Handpicked styles just for you</p>
            </div>
            <Link href="/shoes" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              View All →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    slug: product.id,
                    basePrice: product.basePrice,
                    images: JSON.parse(product.images || '[]'),
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products yet</h3>
              <p className="mt-2 text-gray-500">Check back soon for new arrivals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Hot Deals */}
      {saleProducts.length > 0 && (
        <section className="section bg-gradient-to-br from-red-50 via-orange-50 to-rose-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Tag className="text-red-500" size={28} />
                </motion.div>
                <div>
                  <h2 className="heading-2 text-red-700">Hot Deals</h2>
                  <p className="text-body text-red-600">Don&apos;t miss these limited offers</p>
                </div>
              </div>
              <Link href="/shoes?onSale=true" className="text-red-600 hover:text-red-700 font-semibold transition-colors">
                View All Deals →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    slug: product.id,
                    basePrice: product.basePrice,
                    images: JSON.parse(product.images || '[]'),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Category */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-2 text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { slug: 'running', name: 'Running' },
              { slug: 'lifestyle', name: 'Lifestyle' },
              { slug: 'basketball', name: 'Basketball' },
              { slug: 'training', name: 'Training' },
            ].map((cat) => (
              <CategoryCard key={cat.slug} slug={cat.slug} name={cat.name} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <BrandMarquee brands={brands} />

      {/* CTA */}
      <section className="section bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="heading-2 mb-4">Ready to Find Your Perfect Pair?</h2>
          <p className="text-primary-100 mb-8">Join thousands of happy customers in Nairobi. Free delivery on orders over KES 7,000.</p>
          <Link href="/shoes" className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
