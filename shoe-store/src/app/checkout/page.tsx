'use client';

import { useState, FormEvent } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice, getDeliveryZones, getZoneForArea } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, getSubtotal, getTotalItems } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    county: 'nairobi',
    area: '',
    address: '',
    deliveryType: 'boda' as 'boda' | 'courier' | 'pickup',
    paymentMethod: 'paystack' as 'paystack' | 'cod',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  
  // Calculate delivery
  let deliveryFee = 0;
  let deliveryInfo = 'Same/next day';
  if (formData.area && formData.deliveryType !== 'pickup') {
    const zone = getZoneForArea(formData.area);
    deliveryFee = zone.baseFee;
    deliveryInfo = zone.days;
    if (formData.paymentMethod === 'cod') {
      deliveryFee += zone.codFee || 0;
    }
  }
  
  // Free delivery threshold
  const FREE_DELIVERY = 700000; // KES 7,000
  const isFreeDelivery = subtotal >= FREE_DELIVERY || formData.deliveryType === 'pickup';
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
      newErrors.area = 'Please select or enter your area';
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
        // COD: create order directly
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        });

        if (!res.ok) throw new Error((await res.json()).error || 'Order failed');

        const { orderId } = await res.json();
        useCartStore.getState().clearCart();
        router.push(`/checkout/success?orderId=${orderId}&method=cod`);
      } else {
        // Paystack: initialize payment with full shipping metadata
        const res = await fetch('/api/payments', {
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
            deliveryFee: finalDeliveryFee,
            subtotal,
            total,
            notes: formData.notes,
            items: items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              productName: item.productName,
              variantSize: item.variantSize,
              unitPrice: item.unitPrice,
            })),
          }),
        });

        if (!res.ok) throw new Error((await res.json()).error || 'Payment failed');

        const { authorizationUrl } = await res.json();
        window.location.href = authorizationUrl;
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="heading-2 mb-4">No Shoes Selected</h1>
        <p className="text-body mb-8">Your cart is empty. Add shoes first!</p>
        <Button onClick={() => router.push('/shoes')} size="lg">Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="heading-2 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <section className="bg-white rounded-xl border p-6">
            <h2 className="heading-3 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                helperText="For order confirmation & updates"
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="07XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                helperText="For delivery coordination"
              />
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-white rounded-xl border p-6">
            <h2 className="heading-3 mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <Select
                label="Delivery Method"
                options={[
                  { value: 'boda', label: 'Uber Boda (Same/Next Day) - Nairobi Only' },
                  { value: 'pickup', label: 'Free Pickup (Location to be agreed)' },
                ]}
                value={formData.deliveryType}
                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as 'boda' | 'courier' | 'pickup' })}
              />
              
              <Select
                label="County"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                options={[
                  { value: 'nairobi', label: 'Nairobi' },
                  { value: 'kiambu', label: 'Kiambu' },
                  { value: 'machakos', label: 'Machakos' },
                  { value: 'kajiado', label: 'Kajiado' },
                ]}
              />

              <Input
                label="Area / Neighborhood"
                placeholder="Westlands, CBD, Kilimani, etc."
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                error={errors.area}
                helperText={`Estimated delivery: ${deliveryInfo}`}
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
          </section>

          {/* Payment */}
          <section className="bg-white rounded-xl border p-6">
            <h2 className="heading-3 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="paystack"
                  checked={formData.paymentMethod === 'paystack'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'paystack' })}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Pay Online (Card / M-Pesa)</p>
                  <p className="text-sm text-gray-500">Pay via Paystack - secure and instant</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.deliveryType === 'pickup' ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500'}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  disabled={formData.deliveryType === 'pickup'}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when shoes arrive. Extra delivery fee of KES 50-150 applies</p>
                </div>
              </label>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-24">
            <h2 className="heading-3 mb-4">Order Summary ({totalItems} items)</h2>

            {/* Items */}
            <ul className="divide-y mb-4 max-h-64 overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <li key={item.variantId} className="py-3 flex gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">
                      Size {item.variantSize} · Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold mt-0.5">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery ({formData.deliveryType})</span>
                <span>
                  {isFreeDelivery ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    formatPrice(finalDeliveryFee)
                  )}
                </span>
              </div>
              {deliveryFee > 0 && isFreeDelivery && (
                <div className="text-xs text-green-600">Free delivery on orders over KES 7,000!</div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* CTA */}
            <Button
              type="submit"
              size="lg"
              className="w-full mt-6"
              loading={loading}
              disabled={items.length === 0}
            >
              {formData.paymentMethod === 'paystack' ? 'Pay via Paystack' : formData.paymentMethod === 'cod' ? 'Place COD Order' : 'Place Order'}
            </Button>

            <p className="text-xs text-gray-400 text-center mt-3">
              {formData.paymentMethod === 'paystack' 
                ? 'You will be redirected to Paystack for secure payment.'
                : 'We will confirm your COD order via WhatsApp before dispatch.'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}