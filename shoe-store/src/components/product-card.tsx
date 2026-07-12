'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye, ArrowRight, Tag } from 'lucide-react';
import { MagneticButton } from './ui/magnetic-button';
import { useRef, useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    basePrice: number;
    salePrice?: number | null;
    onSale?: boolean;
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
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [glareVisible, setGlareVisible] = useState(false);
  const imageUrl = product.images?.[0] || '/placeholder.svg';
  const inStock = variant ? variant.stock > 0 : true;
  const isLowStock = inStock && variant && variant.stock <= 3;
  const isOnSale = product.onSale && product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = isOnSale
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  return (
    <motion.article
      ref={cardRef}
      className="group relative bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseMove={(e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePos({ x, y });
        setGlareVisible(true);
      }}
      onMouseLeave={() => setGlareVisible(false)}
    >
      {/* Dynamic glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: glareVisible ? 1 : 0,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />

      <Link href={`/shoes/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[var(--color-surface-elevated)] overflow-hidden">
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

          {/* Sale badge */}
          {isOnSale && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 left-3 z-10"
            >
              <span className="inline-flex items-center gap-1 bg-secondary-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                <Tag size={10} />
                {discountPercent}% OFF
              </span>
            </motion.div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <span className="inline-flex items-center gap-1.5 bg-[var(--color-surface)]/95 backdrop-blur-sm text-[var(--color-text)] px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-[var(--color-border)]">
                <Eye size={14} />
                Quick View
              </span>
            </motion.div>
          </div>

          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-secondary-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock pulse */}
          {isLowStock && (
            <motion.span
              className="absolute top-3 right-3 badge-warning text-[10px] font-bold shadow-md"
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
            <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          <h3 className="font-semibold text-[var(--color-text)] line-clamp-1 mb-1.5 font-[var(--font-heading)]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnSale ? (
                <>
                  <span className="text-lg font-bold text-secondary-600">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-[var(--color-text)]">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
            {variant && (
              <span
                className={cn(
                  'badge text-xs font-semibold',
                  inStock ? 'badge-success' : 'badge-danger'
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
          <MagneticButton
            variant="primary"
            size="md"
            className="w-full mt-1"
            onClick={() => router.push(`/shoes/${product.slug}`)}
          >
            View Details
            <ArrowRight size={14} className="ml-1" />
          </MagneticButton>
        </div>
      )}
    </motion.article>
  );
}
