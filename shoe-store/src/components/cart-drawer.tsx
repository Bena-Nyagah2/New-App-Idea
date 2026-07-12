'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Package } from 'lucide-react';

const FREE_DELIVERY_THRESHOLD = 700000;

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const remaining = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const qualifiesForFree = subtotal >= FREE_DELIVERY_THRESHOLD;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row">
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
          />

          <motion.aside
            className="relative md:ml-auto md:max-w-md w-full bg-[var(--color-surface)] flex flex-col shadow-2xl border-l border-[var(--color-border)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <ShoppingBag size={18} className="text-primary-600" />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-text)] font-[var(--font-heading)]">
                  Cart ({totalItems})
                </h2>
              </div>
              <motion.button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors"
                aria-label="Close cart"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-[var(--color-text-muted)]" />
              </motion.button>
            </div>

            {/* Free delivery progress bar */}
            <div className="px-6 py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-2">
                {qualifiesForFree ? (
                  <Truck size={16} className="text-green-600" />
                ) : (
                  <Package size={16} className="text-[var(--color-text-muted)]" />
                )}
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {qualifiesForFree ? (
                    <span className="text-green-600 font-bold">Free delivery unlocked!</span>
                  ) : (
                    <>Add <span className="font-bold text-[var(--color-text)]">{formatPrice(remaining)}</span> more for free delivery</>
                  )}
                </p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <ShoppingBag size={56} className="mx-auto text-gray-200 dark:text-gray-700" />
                  </motion.div>
                  <p className="mt-4 text-[var(--color-text-muted)] font-medium text-lg">Your cart is empty</p>
                  <Link
                    href="/shoes"
                    onClick={closeCart}
                    className="mt-5 inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-bold"
                  >
                    Start shopping <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="flex gap-4 p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
                      >
                        <Link
                          href={`/shoes/${item.productSlug}`}
                          onClick={closeCart}
                          className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
                        >
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <Link
                              href={`/shoes/${item.productSlug}`}
                              className="font-semibold text-sm truncate block font-[var(--font-heading)] text-[var(--color-text)] hover:text-primary-600 transition-colors"
                              onClick={closeCart}
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                              {item.variantSize} / {item.variantColor}
                            </p>
                            <p className="text-sm font-bold text-primary-600 mt-1">
                              {formatPrice(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                              <motion.button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] transition-colors"
                                aria-label="Decrease quantity"
                                whileTap={{ scale: 0.85 }}
                              >
                                <Minus size={14} />
                              </motion.button>
                              <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-[var(--color-text)] bg-[var(--color-surface-elevated)]">
                                {item.quantity}
                              </span>
                              <motion.button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] transition-colors"
                                aria-label="Increase quantity"
                                whileTap={{ scale: 0.85 }}
                              >
                                <Plus size={14} />
                              </motion.button>
                            </div>
                            <motion.button
                              onClick={() => removeItem(item.variantId)}
                              className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              whileTap={{ scale: 0.85 }}
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                className="border-t border-[var(--color-border)] px-6 py-5 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-muted)] font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-[var(--color-text)] font-[var(--font-heading)]">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Delivery calculated at checkout</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20"
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>
                <div className="flex gap-3 pt-1">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-border)] py-2.5 rounded-xl text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/shoes"
                    onClick={closeCart}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
