'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SupplierActionsProps {
  supplierId: string;
  isActive: boolean;
}

export function SupplierActions({ supplierId, isActive }: SupplierActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {
      await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 pt-3 border-t flex gap-2">
      <a
        href={`/admin/suppliers/${supplierId}`}
        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        Edit
      </a>
      <button
        onClick={toggleActive}
        disabled={loading}
        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
      >
        {isActive ? 'Deactivate' : 'Reactivate'}
      </button>
    </div>
  );
}
