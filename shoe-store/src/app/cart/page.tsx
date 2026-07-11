'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const hasItems = items.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        className="heading-2 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shopping Cart
      </motion.h1>

      {!hasItems ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShoppingBag size={64} className="mx-auto text-gray-300" />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold text-gray-900 font-[var(--font-heading)]">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Add some shoes to get started!</p>
          <Link
            href="/shoes"
            className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors active:scale-95"
          >
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-2xl border divide-y overflow-hidden">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex gap-4 p-4 sm:p-6"
                >
                  {/* Image */}
                  <Link
                    href={`/shoes/${item.productSlug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50"
                  >
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="112px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/shoes/${item.productSlug}`}
                        className="font-bold hover:text-primary-600 transition-colors line-clamp-1 font-[var(--font-heading)]"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Size: {item.variantSize} · Color: {item.variantColor}
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1.5">
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <motion.button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                          aria-label="Decrease quantity"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Minus size={14} />
                        </motion.button>
                        <span className="px-4 py-1.5 text-sm font-bold w-10 text-center bg-gray-50">
                          {item.quantity}
                        </span>
                        <motion.button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                          aria-label="Increase quantity"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>

                      <motion.button
                        onClick={() => removeItem(item.variantId)}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <motion.div
            className="bg-white rounded-2xl border p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between text-lg font-bold mb-2">
              <span className="font-[var(--font-heading)]">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">Delivery calculated at checkout</p>
            <Link href="/checkout" className="block">
              <motion.span
                className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </motion.span>
            </Link>
            <Link
              href="/shoes"
              className="flex items-center justify-center gap-1 text-primary-600 hover:text-primary-700 font-semibold mt-4 text-sm"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
