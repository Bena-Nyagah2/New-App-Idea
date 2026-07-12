'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { MagneticButton } from '@/components/ui/magnetic-button';

interface SupplierActionsProps {
  id: string;
  isActive: boolean;
}

export function SupplierActions({ id, isActive }: SupplierActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(isActive ? 'Supplier deactivated' : 'Supplier activated');
      router.refresh();
    } catch {
      toast.error('Failed to update supplier');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MagneticButton>
      <button
        onClick={toggleActive}
        disabled={loading}
        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isActive
            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20'
            : 'bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20'
        }`}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </MagneticButton>
  );
}
