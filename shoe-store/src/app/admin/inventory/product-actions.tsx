'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { MagneticButton } from '@/components/ui/magnetic-button';

interface ProductActionsProps {
  id: string;
  isActive: boolean;
}

export function ProductActions({ id, isActive }: ProductActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(isActive ? 'Product archived' : 'Product restored');
      router.refresh();
    } catch {
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <MagneticButton>
        <motion.button
          onClick={() => router.push(`/admin/inventory/${id}`)}
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-[var(--color-surface-elevated)] hover:bg-primary-50 dark:hover:bg-zinc-700 text-[var(--color-text-muted)] hover:text-primary-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          Edit
        </motion.button>
      </MagneticButton>
      <MagneticButton>
        <motion.button
          onClick={toggleActive}
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isActive
              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20'
              : 'bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20'
          }`}
        >
          {isActive ? 'Archive' : 'Restore'}
        </motion.button>
      </MagneticButton>
    </div>
  );
}
