'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    basePrice: number;
    images: string[];
    slug: string;
  };
  variant?: {
    id: string;
    size: string;
    color: string;
    stock: number;
  };
}

export function ProductCard({ product, variant }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/placeholder.jpg';
  const inStock = variant ? variant.stock > 0 : true;
  
  return (
    <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/shoes/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
              {product.brand}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.basePrice)}
            </span>
            {variant && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {inStock ? `${variant.stock} left` : 'Out of Stock'}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {inStock && (
        <div className="px-4 pb-4">
          <Link href={`/shoes/${product.slug}`} className="block w-full mt-2">
            <Button className="w-full">View Details</Button>
          </Link>
        </div>
      )}
    </article>
  );
}