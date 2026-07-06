'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

  const availableSizesForColor = selectedColor
    ? variants.filter(v => v.color === selectedColor && v.stock > 0).map(v => v.size)
    : allSizes.filter(s => variants.some(v => v.size === s && v.stock > 0));

  const availableColorsForSize = selectedSize
    ? variants.filter(v => v.size === selectedSize && v.stock > 0).map(v => v.color)
    : allColors.filter(c => variants.some(v => v.color === c && v.stock > 0));

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
      image: product.images[0] || '/placeholder.jpg',
      unitPrice: product.basePrice,
      costPrice: 0,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Colors */}
      {allColors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color: {selectedColor || 'Select'}
          </label>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => {
              const variant = variants.find(v => v.color === color);
              const hasStock = variants.some(v => v.color === color && v.stock > 0);
              const isSelected = selectedColor === color;
              
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(isSelected ? null : color);
                    setSelectedSize(null);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all',
                    isSelected
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : hasStock
                      ? 'border-gray-200 hover:border-gray-400 text-gray-700'
                      : 'border-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                  )}
                  disabled={!hasStock}
                >
                  {variant?.colorHex && (
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  )}
                  {color}
                  {!hasStock && <span className="text-xs">(sold out)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {allSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size: {selectedSize || 'Select'}
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
                <button
                  key={size}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedSize(isSelected ? null : size);
                    }
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all min-w-[48px] relative',
                    isSelected
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : isAvailable
                      ? 'border-gray-200 hover:border-gray-400 text-gray-700'
                      : 'border-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                  )}
                  disabled={!isAvailable}
                >
                  {size}
                  {isLowStock && isAvailable && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] px-1 rounded-full font-medium">
                      {variant?.stock}
                    </span>
                  )}
                  {!isAvailable && <span className="block text-[10px] mt-0.5">sold out</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected State */}
      {selectedColor && selectedSize && !selectedVariant?.stock && (
        <p className="text-red-500 text-sm">This combination is sold out.</p>
      )}

      {/* Add to Cart */}
      <div className="flex gap-4 pt-4 border-t">
        <Button
          onClick={handleAddToCart}
          disabled={!canAdd}
          size="lg"
          className="flex-1"
        >
          {added ? 'Added ✓' : canAdd ? `Add to Cart – ${formatPrice(product.basePrice)}` : 'Select Size & Color'}
        </Button>
        
        {selectedColor && selectedSize && selectedVariant && selectedVariant.stock > 0 && (
          <span className="text-sm text-green-600 self-center">
            {selectedVariant.stock > 10 
              ? 'In stock' 
              : `${selectedVariant.stock} left`}
          </span>
        )}
      </div>
    </div>
  );
}