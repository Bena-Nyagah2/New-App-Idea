'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
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
import { ArrowRight, Truck, Phone, X, AlertCircle, CheckCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { MpesaLogo } from '@/components/icons/social-icons';

interface FormData {
  email: string;
  name: string;
  phone: string;
  county: string;
  area: string;
  address: string;
  deliveryType: 'boda' | 'pickup';
  notes: string;
}

type Phase = 'form' | 'waiting' | 'error';

function formatMpesaPhone(raw: string): string | null {
  let digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
  if (digits.startsWith('+254')) digits = digits.slice(1);
  if (digits.startsWith('254') && digits.length === 12) return digits;
  return null;
}

function MaskedPhone({ phone }: { phone: string }) {
  if (phone.length < 8) return <span>{phone}</span>;
  return <span>{phone.slice(0, 5)}***{phone.slice(-2)}</span>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    phone: '',
    county: 'nairobi',
    area: '',
    address: '',
    deliveryType: 'boda',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [waitingPhone, setWaitingPhone] = useState('');
  const [waitingOrderId, setWaitingOrderId] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const [failedReason, setFailedReason] = useState('');

  const deliveryFee = calculateDeliveryFee(formData.county, formData.area);
  const deliveryLabel = getDeliveryLabel(formData.county, formData.area);
  const isFreeDelivery = deliveryFee === 0;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const total = subtotal + finalDeliveryFee;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'waiting' || !waitingOrderId) return;

    const MAX_POLLS = 60;
    let count = 0;

    pollRef.current = setInterval(async () => {
      count++;
      setPollCount(count);

      if (count >= MAX_POLLS) {
        if (pollRef.current) clearInterval(pollRef.current);
        setFailedReason('Payment timed out. Please try again.');
        setPhase('error');
        return;
      }

      try {
        const res = await fetch(`/api/orders/${waitingOrderId}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.paymentStatus === 'paid') {
          if (pollRef.current) clearInterval(pollRef.current);
          clearCart();
          router.push(`/checkout/success?orderId=${waitingOrderId}&method=mpesa`);
        } else if (data.paymentStatus === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          setFailedReason(data.status === 'pending' ? 'Payment was not completed.' : 'Payment failed. Please try again.');
          setPhase('error');
        }
      } catch {
        // Silently retry on network error
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase, waitingOrderId, clearCart, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email required';
    }
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name required (min 2 characters)';
    }
    if (!formData.phone || !formatMpesaPhone(formData.phone)) {
      newErrors.phone = 'Enter a valid Safaricom number (07XX or 01XX)';
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
      const formattedPhone = formatMpesaPhone(formData.phone)!;

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          county: formData.county,
          area: formData.area,
          address: formData.address,
          deliveryType: formData.deliveryType,
          paymentMethod: 'mpesa',
          notes: formData.notes,
          items: items.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
          subtotal,
          deliveryFee: finalDeliveryFee,
          total,
        }),
      });

      if (!orderRes.ok) throw new Error((await orderRes.json()).error || 'Failed to create order');
      const { orderId } = await orderRes.json();

      const stkRes = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formattedPhone, amount: total, orderId }),
      });

      if (!stkRes.ok) throw new Error((await stkRes.json()).error || 'STK Push failed');

      setWaitingPhone(formattedPhone);
      setWaitingOrderId(orderId);
      setPhase('waiting');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelWaiting = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPhase('form');
    setWaitingPhone('');
    setWaitingOrderId('');
    setPollCount(0);
  };

  const retryFromError = () => {
    setPhase('form');
    setFailedReason('');
    setWaitingOrderId('');
    setPollCount(0);
  };

  if (phase === 'waiting') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1 className="heading-2 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-[#4CAF50]/30 bg-gradient-to-br from-[#0a1a0d] via-[#0d1f12] to-[#0a1a0d] p-8 sm:p-12 text-center"
            >
              {/* Ambient green glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4CAF50]/5 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* M-Pesa Logo */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="mx-auto mb-6"
                >
                  <MpesaLogo size={64} />
                </motion.div>

                {/* Animated Phone Graphic */}
                <motion.div
                  className="relative mx-auto mb-8 w-24 h-40"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Phone outline */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#4CAF50]/40 bg-[#0f2912]/60 backdrop-blur-sm">
                    {/* Screen */}
                    <div className="absolute top-3 left-2 right-2 bottom-3 rounded-xl bg-[#4CAF50]/10 flex items-center justify-center">
                      {/* Pulsing notification */}
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#4CAF50]/20 flex items-center justify-center">
                          <Phone size={16} className="text-[#4CAF50]" />
                        </div>
                        {/* Ring pulses */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[#4CAF50]/40"
                          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[#4CAF50]/30"
                          animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-[#4CAF50]/20" />
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-3 font-[var(--font-heading)]">
                    A payment request has been sent
                  </h2>
                  <p className="text-lg text-white/80 mb-2">
                    to <span className="font-semibold text-[#4CAF50]"><MaskedPhone phone={waitingPhone} /></span>
                  </p>
                  <p className="text-sm text-white/50 max-w-md mx-auto mb-8">
                    Please look at your phone, enter your M-Pesa PIN, and wait for confirmation.
                  </p>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                  className="w-full max-w-xs mx-auto h-1 bg-white/10 rounded-full overflow-hidden mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-[#4CAF50] rounded-full"
                    animate={{ width: `${Math.min((pollCount / 60) * 100, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                <p className="text-xs text-white/30 mb-8">
                  This usually takes about 30 seconds
                </p>

                {/* Cancel */}
                <motion.button
                  onClick={cancelWaiting}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel and go back
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 sticky top-24">
              <h2 className="heading-3 mb-4">Order Summary ({totalItems} items)</h2>
              <ul className="divide-y divide-[var(--color-border)] mb-4 max-h-64 overflow-y-auto scrollbar-hide">
                {items.map((item) => (
                  <li key={item.variantId} className="py-3 flex gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-elevated)]">
                      <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[var(--color-text)]">{item.productName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Size {item.variantSize} · Qty: {item.quantity}</p>
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

  if (phase === 'error') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1 className="heading-2 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-red-500/30 bg-red-50 dark:bg-red-500/5 p-8 sm:p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">Payment Not Completed</h2>
              <p className="text-[var(--color-text-muted)] mb-8 max-w-md mx-auto">{failedReason}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={retryFromError} variant="primary" size="lg">
                  Try Again
                </Button>
                <Button onClick={() => router.push('/cart')} variant="outline" size="lg">
                  Back to Cart
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 sticky top-24">
              <h2 className="heading-3 mb-4">Order Summary ({totalItems} items)</h2>
              <ul className="divide-y divide-[var(--color-border)] mb-4 max-h-64 overflow-y-auto scrollbar-hide">
                {items.map((item) => (
                  <li key={item.variantId} className="py-3 flex gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-elevated)]">
                      <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[var(--color-text)]">{item.productName}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Size {item.variantSize} · Qty: {item.quantity}</p>
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

            {/* Payment — M-Pesa Only */}
            <motion.section
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="heading-3 mb-4">Payment Method</h2>

              {/* M-Pesa branding */}
              <div className="flex items-center gap-3 p-4 border-2 border-[#4CAF50]/30 bg-[#4CAF50]/5 rounded-xl mb-4">
                <MpesaLogo size={40} />
                <div>
                  <p className="font-semibold text-[var(--color-text)]">M-Pesa (Lipa Na M-Pesa)</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Pay securely with your Safaricom M-Pesa</p>
                </div>
                <CheckCircle size={20} className="text-[#4CAF50] ml-auto" />
              </div>

              {/* Phone number — animated entrance */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    label="M-Pesa Phone Number"
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    helperText="Safaricom number registered for M-Pesa"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.section>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full py-4" size="lg">
              <span className="flex items-center justify-center gap-2">
                Pay {formatPrice(total)} with M-Pesa
                <ArrowRight size={16} />
              </span>
            </Button>

            <p className="text-xs text-center text-[var(--color-text-muted)]">
              You will receive an M-Pesa prompt on your phone to enter your PIN.
            </p>
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
                    <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="48px" />
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
