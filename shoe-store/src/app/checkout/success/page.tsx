'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { MpesaLogo } from '@/components/icons/social-icons';
import { CheckCircle } from 'lucide-react';

function fireConfetti() {
  const colors = ['#ed8914', '#4CAF50', '#E11D48', '#2563EB'];
  const duration = 3000;
  const end = Date.now() + duration;

  // Side cannons — dense
  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  // Center burst — massive
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 120,
      origin: { y: 0.55 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 1.2,
    });
  }, 300);

  // Second wave — from the top
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 160,
      startVelocity: 30,
      origin: { y: 0.1 },
      colors,
      shapes: ['circle', 'square'],
      gravity: 0.8,
    });
  }, 800);
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId] = useState<string | null>(searchParams.get('orderId'));

  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
      {/* Success icon with green glow */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="relative mx-auto mb-6 w-24 h-24"
      >
        <div className="absolute inset-0 rounded-full bg-[#4CAF50]/10 blur-xl" />
        <div className="relative w-24 h-24 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
          <CheckCircle size={48} className="text-[#4CAF50]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="heading-2 mb-4">Payment Confirmed!</h1>
        <p className="text-body mb-8">
          Your order <span className="font-semibold text-[var(--color-text)]">#{orderId?.slice(0, 8) || '...'}</span> has been
          confirmed and paid via M-Pesa. We&apos;ll start processing and dispatch via Uber Boda.
        </p>
      </motion.div>

      {/* M-Pesa receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <MpesaLogo size={28} />
          <span className="font-semibold text-[var(--color-text)]">M-Pesa Payment</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Order ID</span>
            <span className="font-medium text-[var(--color-text)]">{orderId?.slice(0, 8) || '...'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Payment Method</span>
            <span className="font-medium text-[var(--color-text)]">M-Pesa (Lipa Na M-Pesa)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Status</span>
            <span className="font-medium text-[#4CAF50]">Confirmed</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <p className="text-sm text-[var(--color-text-muted)]">
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
      </motion.div>
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
