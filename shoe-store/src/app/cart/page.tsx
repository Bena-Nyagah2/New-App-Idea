'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useState } from 'react';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { siteConfig } from '@/lib/site-config';
import { calculateDeliveryFee, getDeliveryLabel, isCbdArea } from '@/lib/cdb-utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const hasItems = items.length > 0;

  const [deliveryCounty, setDeliveryCounty] = useState('nairobi');
  const [deliveryArea, setDeliveryArea] = useState('');
  const isFreeDelivery = isCbdArea(deliveryArea);
  const deliveryFee = isFreeDelivery ? 0 : calculateDeliveryFee(deliveryCounty, deliveryArea);
  const deliveryLabel = getDeliveryLabel(deliveryCounty, deliveryArea);

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
          {/* Delivery */}
          <div className="rounded-2xl border border-[var(--color-border)] p-4 bg-[var(--color-surface)]">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-primary-600" />
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Free delivery within {siteConfig.freeDeliveryArea}. Outside {siteConfig.freeDeliveryArea} at a fee.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 border-t border-[var(--color-border)] pt-3">
              <label className="text-sm text-[var(--color-text-muted)]">County</label>
              <select
                value={deliveryCounty}
                onChange={(e) => setDeliveryCounty(e.target.value)}
                className="input flex-1 max-w-[200px]"
              >
                <option value="nairobi">Nairobi</option>
                <option value="kiambu">Kiambu</option>
                <option value="machakos">Machakos</option>
                <option value="countrywide">Other Kenyan County</option>
                <option value="worldwide">Worldwide</option>
              </select>

              {deliveryCounty === 'nairobi' && (
                <>
                  <label className="text-sm text-[var(--color-text-muted)]">Area</label>
                  <input
                    placeholder="e.g. CBD, Kilimani, Westlands"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="input flex-1"
                  />
                </>
              )}
            </div>

            {deliveryLabel && (
              <p className="text-xs text-[var(--color-text-muted)] mt-2 flex items-center gap-1.5">
                <Info size={12} /> {deliveryLabel}
              </p>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-3">Items</h2>
              {subtotal > 0 && <Link href="/shoes" className="text-sm font-medium text-primary-600 flex items-center gap-1.5">
                <ArrowLeft size={14} /> Continue Shopping
              </Link>}
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-4 text-xs text-[var(--color-text-muted)] font-medium">
                <span className="w-1/3"></span>
                <span className="flex-1"></span>
                <span>Price</span>
              </div>

              <motion.ul layout className="divide-y divide-[var(--color-border)]">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.li
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: '-1px', overflow: 'hidden' }}
                      transition={{ duration: 0.3, type: 'spring' }}
                      className="p-4 hover:bg-[var(--color-surface-elevated)] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-1/3">
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={80}
                            height={80}
                            className="rounded-lg bg-[var(--color-surface-elevated)] object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-[var(--color-text)] line-clamp-2">{item.productName}</h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {item.variantSize} × {item.variantColor}
                            {item.variantColorHex && (
                              <span className="inline-flex items-center gap-1 ml-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.variantColorHex }} />
                              </span>
                            )}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-xs">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className={`px-2 py-0.5 border border-[var(--color-border)] rounded-full aspect-square flex items-center justify-center ${item.quantity <= 1 ? 'opacity-50' : 'hover:bg-[var(--color-surface)]'}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-medium text-xs min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= (item.maxStock || 99)}
                              className={`px-2 py-0.5 border border-[var(--color-border)] rounded-full aspect-square flex items-center justify-center ${item.quantity >= (item.maxStock || 99) ? 'opacity-50' : 'hover:bg-[var(--color-surface)]'}`}
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="ml-2 px-2 py-0.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full text-red-600 dark:text-red-400 text-xs"
                            >
                              Remove
                            </button>
                            {(item.maxStock || 0) > 0 && item.quantity >= (item.maxStock || 0) && (
                              <span className="ml-2 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full text-xs">
                                Max stock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-[var(--color-text)]">{formatPrice(item.unitPrice * item.quantity)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[var(--color-text-muted)] line-through">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h2 className="heading-3 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : `+ ${formatPrice(deliveryFee)}`}</span>
              </div>
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between heading-4">
                <span>Total</span>
                <span>{formatPrice(subtotal + deliveryFee)}</span>
              </div>
            </div>

            <MagneticButton className="w-full mt-6" size="lg">
              <Link href="#" className="flex items-center justify-center gap-2 w-full">
                Continue to Checkout
                <ArrowRight size={16} />
              </Link>
            </MagneticButton>
          </div>
        </div>
      )}
    </div>
  );
}
