import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
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

export default async function HomePage() {
  const [featuredProducts, categories, brands] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Step Into Style
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl">
              Discover premium running, lifestyle & basketball shoes. Fast Nairobi delivery via Uber Boda. Pay online or cash on delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shoes" className="btn btn-primary text-lg px-8 py-3">
                Shop Now
              </Link>
              <Link href="/shoes?category=running" className="btn bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 text-lg px-8 py-3">
                Running Shoes
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating shoes decoration */}
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-primary-900 to-transparent" />
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-8 text-center">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Fast Nairobi Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Quality Guaranteed</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-2">Featured Shoes</h2>
              <p className="text-body mt-1">Handpicked styles just for you</p>
            </div>
            <Link href="/shoes" className="text-primary-600 hover:text-primary-700 font-medium">
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

      {/* Shop by Category */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-2 text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Running', slug: 'running', icon: '🏃', color: 'bg-blue-500' },
              { name: 'Lifestyle', slug: 'lifestyle', icon: '👟', color: 'bg-purple-500' },
              { name: 'Basketball', slug: 'basketball', icon: '🏀', color: 'bg-orange-500' },
              { name: 'Training', slug: 'training', icon: '💪', color: 'bg-green-500' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/shoes?category=${cat.slug}`}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <div className={`absolute inset-0 ${cat.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative p-6 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl mb-2">{cat.icon}</span>
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                  <p className="text-sm opacity-80">Shop {cat.name.toLowerCase()} shoes</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="heading-2 text-center mb-10">Popular Brands</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {brands.map((brand) => (
                <Link
                  key={brand.brand}
                  href={`/shoes?brand=${encodeURIComponent(brand.brand)}`}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  {brand.brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="heading-2 mb-4">Ready to Find Your Perfect Pair?</h2>
          <p className="text-primary-100 mb-8">Join thousands of happy customers in Nairobi. Free delivery on orders over KES 7,000.</p>
          <Link href="/shoes" className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}