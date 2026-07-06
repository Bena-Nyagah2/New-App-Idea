import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, and, like, desc, sql, gte, lte } from 'drizzle-orm';
import { ProductCard } from '@/components/product-card';
import { formatPrice } from '@/lib/utils';
import { CATEGORIES, BRANDS } from '@/lib/validations';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
  };
}

async function getFilteredProducts(searchParams: PageProps['searchParams']) {
  const conditions = [eq(products.isActive, true)];
  
  if (searchParams.category) {
    conditions.push(eq(products.category, searchParams.category));
  }
  
  if (searchParams.brand) {
    conditions.push(like(products.brand, `%${searchParams.brand}%`));
  }
  
  if (searchParams.search) {
    conditions.push(like(products.name, `%${searchParams.search}%`));
  }
  
  if (searchParams.minPrice) {
    conditions.push(gte(products.basePrice, parseInt(searchParams.minPrice) * 100));
  }
  
  if (searchParams.maxPrice) {
    conditions.push(lte(products.basePrice, parseInt(searchParams.maxPrice) * 100));
  }
  
  const orderBy = searchParams.sort === 'price-asc' 
    ? products.basePrice 
    : searchParams.sort === 'price-desc'
    ? desc(products.basePrice)
    : desc(products.createdAt);
  
  return db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderBy);
}

async function getActiveCategories() {
  const data = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.isActive, true));
  return data.map(d => d.category);
}

async function getActiveBrands() {
  const data = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .where(eq(products.isActive, true));
  return data.map(d => d.brand);
}

async function getTotalCount() {
  const data = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.isActive, true));
  return data[0]?.count || 0;
}

export default async function ShoesPage({ searchParams }: PageProps) {
  const [filteredProducts, activeCategories, activeBrands, totalCount] = await Promise.all([
    getFilteredProducts(searchParams),
    getActiveCategories(),
    getActiveBrands(),
    getTotalCount(),
  ]);

  const activeFilters = Object.entries(searchParams).filter(([k, v]) => v && k !== 'sort');
  const hasResults = filteredProducts.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-2">{searchParams.search ? `Results for "${searchParams.search}"` : 'All Shoes'}</h1>
          <p className="text-body mt-1">
            {hasResults ? `${filteredProducts.length}${totalCount !== filteredProducts.length ? ` of ${totalCount}` : ''} products` : 'No products found'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <form className="flex gap-2" action="/shoes" method="GET">
            <input
              type="text"
              name="search"
              placeholder="Search shoes..."
              defaultValue={searchParams.search}
              className="input w-48"
            />
            <button type="submit" className="btn btn-primary px-3 py-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          
          {/* Sort */}
          <select 
            className="input max-w-[160px] bg-white"
            defaultValue={searchParams.sort || 'newest'}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set('sort', e.target.value);
              window.location.href = url.toString();
            }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Active Filters</h3>
                <Link href="/shoes" className="text-xs text-red-600 hover:text-red-700">Clear all</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map(([key, value]) => (
                  <Link
                    key={key}
                    href={`/shoes${buildUrlParams(searchParams, key)}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium group"
                  >
                    <span>{value}</span>
                    <svg className="w-3 h-3 group-hover:text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Category</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/shoes" 
                  className={`text-sm block py-1 px-2 rounded-lg transition-colors ${!searchParams.category ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}
                >
                  All Categories
                </Link>
              </li>
              {activeCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/shoes?category=${cat}`}
                    className={`text-sm block py-1 px-2 rounded-lg transition-colors capitalize ${searchParams.category === cat ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Brand</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {activeBrands.map((brand) => (
                <li key={brand}>
                  <Link
                    href={`/shoes?brand=${encodeURIComponent(brand)}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                    className={`text-sm block py-1 px-2 rounded-lg transition-colors ${searchParams.brand === brand ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}
                  >
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Price (KES)</h3>
            <form action="/shoes" method="GET" className="space-y-2">
              {(Object.entries(searchParams).filter(([k]) => k !== 'minPrice' && k !== 'maxPrice')).map(([k, v]) => (
                <input type="hidden" key={k} name={k} value={v || ''} />
              ))}
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={searchParams.minPrice}
                  className="input text-sm py-1"
                  min={0}
                />
                <span className="text-gray-400 self-center">—</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={searchParams.maxPrice}
                  className="input text-sm py-1"
                  min={0}
                />
              </div>
              <button type="submit" className="btn btn-outline text-sm py-1 w-full">
                Apply
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {hasResults ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.id,
                    brand: product.brand,
                    category: product.category,
                    basePrice: product.basePrice,
                    images: JSON.parse(product.images || '[]'),
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No shoes found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your filters or search terms</p>
              <Link href="/shoes" className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
                Clear all filters →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="mt-12 py-4 border-t text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
          <li>/</li>
          <li aria-current="page" className="text-gray-900 font-medium">
            {searchParams.category ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1) : 'All Shoes'}
          </li>
        </ol>
      </nav>
    </div>
  );
}

function buildUrlParams(current: Record<string, string | undefined>, excludeKey: string): string {
  const params = new URLSearchParams();
  Object.entries(current).forEach(([key, value]) => {
    if (key !== excludeKey && value) {
      params.set(key, value);
    }
  });
  const paramStr = params.toString();
  return paramStr ? `?${paramStr}` : '';
}