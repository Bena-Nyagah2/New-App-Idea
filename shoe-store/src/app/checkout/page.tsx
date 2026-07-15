'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { calculateDeliveryFee, getDeliveryLabel } from '@/lib/cdb-utils';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, CreditCard, Lock, X } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

interface FormData {
  email: string;
  name: string;
  phone: string;
  county: string;
  area: string;
  address: string;
  deliveryType: 'boda' | 'pickup';
  paymentMethod: 'paystack' | 'cod';
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    phone: '',
    county: 'nairobi',
    area: '',
    address: '',
    deliveryType: 'boda',
    paymentMethod: 'paystack',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute delivery fee based on CBD logic
  const deliveryFee = calculateDeliveryFee(formData.county, formData.area);
  const deliveryLabel = getDeliveryLabel(formData.county, formData.area);
  const isFreeDelivery = deliveryFee === 0;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const total = subtotal + finalDeliveryFee;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email required';
    }
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name required (min 2 characters)';
    }
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Valid phone number required';
    }
    if (!formData.area || formData.area.length < 2) {
      newErrors.area = 'Please enter your area/neighborhood';
    }
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = 'Full delivery address required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;
    if (items.length === 0) {
      setError('Your cart is empty. Add items first.');
      return;
    }

    setLoading(true);

    try {
      const checkoutData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        county: formData.county,
        area: formData.area,
        address: formData.address,
        deliveryType: formData.deliveryType,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        subtotal,
        deliveryFee: finalDeliveryFee,
        total,
      };

      if (formData.paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        });

        if (!res.ok) throw new Error((await res.json()).error || 'Order failed');

        const { orderId } = await res.json();
        clearCart();
        router.push('/checkout/success?status=success');
      } else {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        });

        if (!res.ok) throw new Error((await res.json()).error || 'Payment init failed');

        const { authorizationUrl } = await res.json();
        window.location.href = authorizationUrl;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1 className="heading-2 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Checkout
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="heading-3 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                />
              </div>
              <Input
                label="Phone"
                type="tel"
                placeholder="07XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                helperText="For delivery coordination"
              />
            </section>

            {/* Delivery */}
            <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="heading-3 mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <Select
                  label="Delivery Method"
                  options={[
                    { value: 'boda', label: 'Uber Boda (Same/Next Day) - Nairobi' },
                    { value: 'pickup', label: 'Free Pickup (Location to be agreed)' },
                  ]}
                  value={formData.deliveryType}
                  onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as 'boda' | 'pickup' })}
                />

                <Select
                  label="County / Region"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  options={[
                    { value: 'nairobi', label: 'Nairobi' },
                    { value: 'kiambu', label: 'Kiambu' },
                    { value: 'machakos', label: 'Machakos' },
                    { value: 'kajiado', label: 'Kajiado' },
                    { value: 'other', label: 'Other Kenyan County' },
                    { value: 'international', label: 'Outside Kenya (Worldwide)' },
                  ]}
                />

                <Input
                  label="Area / Neighborhood"
                  placeholder="CBD, Westlands, Kilimani, etc."
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  error={errors.area}
                  helperText={`Delivery: ${deliveryLabel}`}
                />

                <Textarea
                  label="Full Address"
                  placeholder="Apartment/house number, building name, street name, landmarks"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  error={errors.address}
                />

                <Textarea
                  label="Delivery Notes (Optional)"
                  placeholder="Building color, gate code, nearest landmark..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Delivery fee preview */}
              <div className="mt-4 p-3 bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)]">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Delivery: <span className={isFreeDelivery ? 'text-green-600' : 'text-[var(--color-text)]'}>
                    {isFreeDelivery ? 'Free' : `+ ${formatPrice(finalDeliveryFee)}`}
                  </span>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {isFreeDelivery
                    ? `Free delivery within ${siteConfig.freeDeliveryArea}.`
                    : 'Shipping outside CBD incurs a delivery fee. See details above.'}
                </p>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="heading-3 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={formData.paymentMethod === 'paystack'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'paystack' })}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">Pay Online (Paystack)</p>
                      <p className="text-sm text-[var(--color-text-muted)]">M-Pesa, Card, Bank Transfer. Secure checkout.</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                      <Truck size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-[var(--color-text-muted)]">Pay when shoes arrive. {isFreeDelivery ? 'No extra fee.' : `Extra fee: ${formatPrice(finalDeliveryFee)}.`}</p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full py-4" size="lg">
              {formData.paymentMethod === 'cod' ? 'Place Order (Pay on Delivery)' : 'Continue to Payment'}
            </Button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 sticky top-24">
            <h2 className="heading-3 mb-4">Order Summary ({totalItems} items)</h2>

            <ul className="divide-y divide-[var(--color-border)] mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <li key={item.variantId} className="py-3 flex gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-elevated)]">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[var(--color-text)]">{item.productName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Size {item.variantSize} · Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-0.5 text-[var(--color-text)]">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="text-[var(--color-text)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Delivery</span>
                <span className={isFreeDelivery ? 'text-green-600' : 'text-[var(--color-text)]'}>
                  {isFreeDelivery ? 'Free' : `+ ${formatPrice(finalDeliveryFee)}`}
                </span>
              </div>
              {isFreeDelivery && (
                <p className="text-xs text-green-600 dark:text-green-400">Free delivery within {siteConfig.freeDeliveryArea}!</p>
              )}
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-between heading-4 text-[var(--color-text)]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}