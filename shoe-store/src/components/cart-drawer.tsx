'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row">
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Cart Panel */}
          <motion.aside
            className="relative md:ml-auto md:w-96 w-full bg-white flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary-600" />
                <h2 className="text-lg font-bold font-[var(--font-heading)]">
                  Cart ({totalItems})
                </h2>
              </div>
              <motion.button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <ShoppingBag size={48} className="mx-auto text-gray-300" />
                  </motion.div>
                  <p className="mt-4 text-gray-500 font-medium">Your cart is empty</p>
                  <Link
                    href="/shoes"
                    onClick={closeCart}
                    className="mt-4 inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Continue Shopping <ArrowRight size={14} />
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
                        className="flex gap-4"
                      >
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link
                              href={`/shoes/${item.productSlug}`}
                              className="font-semibold text-sm truncate block font-[var(--font-heading)] hover:text-primary-600 transition-colors"
                              onClick={closeCart}
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.variantSize} / {item.variantColor}
                            </p>
                            <p className="text-sm font-bold text-primary-600 mt-1">
                              {formatPrice(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <motion.button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="px-2.5 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                                aria-label="Decrease quantity"
                                whileTap={{ scale: 0.85 }}
                              >
                                <Minus size={14} />
                              </motion.button>
                              <span className="px-3 py-1 text-sm font-bold w-9 text-center bg-gray-50">
                                {item.quantity}
                              </span>
                              <motion.button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="px-2.5 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                                aria-label="Increase quantity"
                                whileTap={{ scale: 0.85 }}
                              >
                                <Plus size={14} />
                              </motion.button>
                            </div>
                            <motion.button
                              onClick={() => removeItem(item.variantId)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                className="border-t p-5 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex justify-between text-lg font-bold">
                  <span className="font-[var(--font-heading)]">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-400">Delivery calculated at checkout</p>
                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors active:scale-95"
                  onClick={closeCart}
                >
                  View Cart
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/shoes"
                  onClick={closeCart}
                  className="block text-center text-primary-600 hover:text-primary-700 font-semibold text-sm"
                >
                  Continue Shopping
                </Link>
              </motion.div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
