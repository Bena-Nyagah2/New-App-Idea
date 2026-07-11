'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';

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
  const isLowStock = inStock && variant && variant.stock <= 3;

  return (
    <motion.article
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
      }}
    >
      <Link href={`/shoes/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <motion.div
            className="relative w-full h-full"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </motion.div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <Eye size={14} />
                Quick View
              </span>
            </motion.div>
          </div>

          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock pulse */}
          {isLowStock && (
            <motion.span
              className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              Only {variant?.stock} left
            </motion.span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1.5 font-[var(--font-heading)]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.basePrice)}
            </span>
            {variant && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-semibold',
                  inStock
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {inStock ? `${variant.stock} left` : 'Sold Out'}
              </span>
            )}
          </div>
        </div>
      </Link>

      {inStock && (
        <div className="px-4 pb-4">
          <Link
            href={`/shoes/${product.slug}`}
            className="group/btn flex items-center justify-center gap-2 w-full mt-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          >
            View Details
            <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </motion.article>
  );
}
