import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { HomeHeroSection } from './hero-section';
import { TrustIndicators } from './trust-indicators';
import { CategoryCard } from './category-card';
import { getBrandLogo } from '@/lib/brands';
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

  const heroProduct = featuredProducts[0];
  const heroImages = heroProduct ? JSON.parse(heroProduct.images || '[]') : [];
  const heroImage = heroImages[0] || '/placeholder-shoe.png';

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
      {brands.length > 0 && (
        <section className="section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="heading-2 text-center mb-10">Popular Brands</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {brands.map((brand) => {
                const brandConfig = getBrandLogo(brand.brand);
                return (
                  <Link
                    key={brand.brand}
                    href={`/shoes?brand=${encodeURIComponent(brand.brand)}`}
                    className="group flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-md transition-all duration-200 px-5 py-3 min-w-[120px]"
                  >
                    {brandConfig ? (
                      <Image
                        src={brandConfig.logo}
                        alt={`${brand.brand} logo`}
                        width={90}
                        height={30}
                        className="opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    ) : (
                      <span className="font-semibold text-gray-600 group-hover:text-primary-600 transition-colors">
                        {brand.brand}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
