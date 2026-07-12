'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Truck, Package, ShieldCheck } from 'lucide-react';

const FREE_DELIVERY_THRESHOLD = 700000;

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const hasItems = items.length > 0;
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const qualifiesForFree = subtotal >= FREE_DELIVERY_THRESHOLD;

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
            <ShoppingBag size={64} className="mx-auto text-gray-200 dark:text-gray-700" />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold text-[var(--color-text)] font-[var(--font-heading)]">Your cart is empty</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">Add some shoes to get started!</p>
          <Link
            href="/shoes"
            className="mt-6 inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-600/20"
          >
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Free delivery banner */}
          <motion.div
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {qualifiesForFree ? (
                <Truck size={16} className="text-green-600" />
              ) : (
                <Package size={16} className="text-[var(--color-text-muted)]" />
              )}
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                {qualifiesForFree ? (
                  <span className="text-green-600 font-bold">Free delivery unlocked!</span>
                ) : (
                  <>Add <span className="font-bold text-[var(--color-text)]">{formatPrice(remaining)}</span> more for free delivery</>
                )}
              </p>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
            </div>
          </motion.div>

          {/* Cart Items */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] overflow-hidden">
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
                  <Link
                    href={`/shoes/${item.productSlug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
                  >
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="112px"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/shoes/${item.productSlug}`}
                        className="font-bold hover:text-primary-600 transition-colors line-clamp-1 font-[var(--font-heading)] text-[var(--color-text)]"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                        Size: {item.variantSize} · Color: {item.variantColor}
                      </p>
                      <p className="text-lg font-bold text-[var(--color-text)] mt-1.5">
                        {formatPrice(item.unitPrice)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                        <motion.button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-surface-elevated)] transition-colors text-[var(--color-text-muted)]"
                          aria-label="Decrease quantity"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Minus size={14} />
                        </motion.button>
                        <span className="w-12 h-10 flex items-center justify-center text-sm font-bold bg-[var(--color-surface-elevated)] text-[var(--color-text)]">
                          {item.quantity}
                        </span>
                        <motion.button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-surface-elevated)] transition-colors text-[var(--color-text-muted)]"
                          aria-label="Increase quantity"
                          whileTap={{ scale: 0.85 }}
                        >
                          <Plus size={14} />
                        </motion.button>
                      </div>

                      <motion.button
                        onClick={() => removeItem(item.variantId)}
                        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-lg transition-colors font-medium"
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
            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="font-bold text-lg text-[var(--color-text)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-text-muted)]">Delivery</span>
                <span className="text-sm text-[var(--color-text-muted)]">{qualifiesForFree ? <span className="text-green-600 font-bold">FREE</span> : 'Calculated at checkout'}</span>
              </div>
            </div>
            <Link href="/checkout" className="block">
              <motion.span
                className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
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
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <ShieldCheck size={14} className="text-green-600" />
                Secure checkout
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Truck size={14} className="text-primary-600" />
                Fast delivery
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
