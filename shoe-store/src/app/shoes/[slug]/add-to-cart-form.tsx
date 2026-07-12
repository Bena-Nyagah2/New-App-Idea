'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart } from 'lucide-react';
import { MagneticButton } from '@/components/ui/magnetic-button';

interface AddToCartFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: string[];
  };
  variants: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
    colorHex?: string;
  }>;
  allColors: string[];
  allSizes: string[];
  inStock: boolean;
}

export function AddToCartForm({ product, variants, allColors, allSizes, inStock }: AddToCartFormProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const selectedVariant = selectedColor && selectedSize
    ? variants.find(v => v.color === selectedColor && v.size === selectedSize)
    : null;

  const canAdd = Boolean(selectedVariant && selectedVariant.stock > 0);

  const handleAddToCart = () => {
    if (!selectedVariant || !canAdd) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantSize: selectedVariant.size,
      variantColor: selectedVariant.color,
      variantColorHex: selectedVariant.colorHex,
      image: product.images[0] || '/placeholder.svg',
      unitPrice: product.basePrice,
      costPrice: 0,
      quantity: 1,
      maxStock: selectedVariant.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Colors */}
      {allColors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2.5 font-[var(--font-heading)]">
            Color: <span className="text-primary-600">{selectedColor || 'Select'}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => {
              const variant = variants.find(v => v.color === color);
              const hasStock = variants.some(v => v.color === color && v.stock > 0);
              const isSelected = selectedColor === color;

              return (
                <motion.button
                  key={color}
                  onClick={() => {
                    setSelectedColor(isSelected ? null : color);
                    setSelectedSize(null);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors',
                    isSelected
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                      : hasStock
                      ? 'border-[var(--color-border)] hover:border-gray-400 dark:hover:border-gray-500 text-[var(--color-text)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                  )}
                  disabled={!hasStock}
                  whileTap={hasStock ? { scale: 0.95 } : undefined}
                  whileHover={hasStock ? { scale: 1.03 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {variant?.colorHex && (
                    <motion.span
                      className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] flex-shrink-0"
                      style={{ backgroundColor: variant.colorHex }}
                      animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  {color}
                  {!hasStock && <span className="text-xs opacity-60">(sold out)</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {allSizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2.5 font-[var(--font-heading)]">
            Size: <span className="text-primary-600">{selectedSize || 'Select'}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => {
              const isAvailable = selectedColor
                ? variants.some(v => v.color === selectedColor && v.size === size && v.stock > 0)
                : variants.some(v => v.size === size && v.stock > 0);
              const isSelected = selectedSize === size;
              const variant = selectedColor
                ? variants.find(v => v.color === selectedColor && v.size === size)
                : undefined;
              const isLowStock = variant && variant.stock > 0 && variant.stock <= 3;

              return (
                <motion.button
                  key={size}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedSize(isSelected ? null : size);
                    }
                  }}
                  className={cn(
                    'px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-colors min-w-[52px] relative',
                    isSelected
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                      : isAvailable
                      ? 'border-[var(--color-border)] hover:border-gray-400 dark:hover:border-gray-500 text-[var(--color-text)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50'
                  )}
                  disabled={!isAvailable}
                  whileTap={isAvailable ? { scale: 0.9 } : undefined}
                  whileHover={isAvailable ? { scale: 1.05 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {size}
                  {isLowStock && isAvailable && (
                    <motion.span
                      className="absolute -top-2 -right-2 bg-secondary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {variant?.stock}
                    </motion.span>
                  )}
                  {!isAvailable && (
                    <span className="block text-[10px] mt-0.5 font-normal opacity-60">sold out</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected State */}
      <AnimatePresence>
        {selectedColor && selectedSize && !selectedVariant?.stock && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-secondary-600 dark:text-secondary-400 text-sm font-semibold"
          >
            This combination is sold out.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Add to Cart */}
      <div className="flex gap-4 pt-4 border-t border-[var(--color-border)]">
        <MagneticButton
          variant="primary"
          size="lg"
          className={cn(
            'flex-1 !py-3.5',
            !canAdd && '!bg-gray-200 dark:!bg-gray-700 !text-gray-500 dark:!text-gray-400 cursor-not-allowed',
            added && '!bg-green-500'
          )}
          disabled={!canAdd}
          onClick={handleAddToCart}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check size={18} />
                Added to Cart!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart size={18} />
                {canAdd ? `Add to Cart – ${formatPrice(product.basePrice)}` : 'Select Size & Color'}
              </motion.span>
            )}
          </AnimatePresence>
        </MagneticButton>

        {selectedColor && selectedSize && selectedVariant && selectedVariant.stock > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-green-600 dark:text-green-400 self-center font-semibold"
          >
            {selectedVariant.stock > 10 ? 'In stock' : `${selectedVariant.stock} left`}
          </motion.span>
        )}
      </div>
    </div>
  );
}
