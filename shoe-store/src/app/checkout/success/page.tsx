'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  
  useEffect(() => {
    setOrderId(searchParams.get('orderId'));
    setMethod(searchParams.get('method'));
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="bg-primary-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="heading-2 mb-4">
        {method === 'cod' ? 'Order Placed Successfully! 🎉' : 'Payment Successful! 🎉'}
      </h1>

      <p className="text-body mb-8">
        {method === 'cod'
          ? `Order #${orderId?.slice(0, 8) || '...'} received. We'll confirm via WhatsApp and dispatch via Uber Boda. Pay on delivery.`
          : `Your order is confirmed! We'll start processing and dispatch via Uber Boda. Check your email for details.`}
      </p>

      {orderId && (
        <div className="bg-white rounded-xl border p-6 mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Order ID</span>
            <span className="font-medium">{orderId.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium">{method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          We&apos;ll send you delivery updates via email and phone.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push('/shoes')} variant="primary">
            Continue Shopping
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback="Loading...">
      <CheckoutSuccessContent />
    </Suspense>
  );
}
