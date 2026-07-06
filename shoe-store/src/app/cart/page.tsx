'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const hasItems = items.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="heading-2 mb-8">Shopping Cart</h1>

      {!hasItems ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Add some shoes to get started!</p>
          <Link href="/shoes" className="mt-6 inline-flex">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-xl border divide-y">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4 p-4 sm:p-6">
                {/* Image */}
                <Link href={`/shoes/${item.productSlug}`} className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link href={`/shoes/${item.productSlug}`} className="font-medium hover:text-primary-600 transition-colors line-clamp-1">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Size: {item.variantSize} · Color: {item.variantColor}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{formatPrice(item.unitPrice)}</p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium w-10 text-center bg-gray-50">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-6">
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/shoes" className="block text-center text-primary-600 hover:text-primary-700 font-medium mt-4">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}