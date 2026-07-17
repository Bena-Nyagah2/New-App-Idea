'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MagneticButton } from '@/components/ui/magnetic-button';

interface UpdateStatusButtonProps {
  orderId: string;
  currentStatus: string;
}

const STATUSES = ['pending', 'confirmed', 'completed', 'shipped', 'delivered', 'cancelled'];

export function UpdateStatusButton({ orderId, currentStatus }: UpdateStatusButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Status updated to ${newStatus}`);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <MagneticButton>
        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.95 }}
          className="bg-[var(--color-surface-elevated)] hover:bg-primary-50 dark:hover:bg-primary-500/10 text-[var(--color-text-muted)] hover:text-primary-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          {currentStatus} ▾
        </motion.button>
      </MagneticButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute right-0 top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 overflow-hidden min-w-[140px]"
          >
            {STATUSES.filter(s => s !== currentStatus).map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={loading}
                className="w-full text-left px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)] transition-colors capitalize disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
