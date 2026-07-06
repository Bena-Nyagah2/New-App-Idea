'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UpdateStatusButtonProps {
  orderId: string;
  currentStatus: string;
}

export function UpdateStatusButton({ orderId, currentStatus }: UpdateStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Only show statuses that make sense as next steps
  const availableStatuses = getNextStatuses(currentStatus);

  async function handleUpdate(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
        setShowDropdown(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
      >
        Update
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
          {availableStatuses.map(status => (
            <button
              key={status.value}
              onClick={() => handleUpdate(status.value)}
              disabled={loading}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getNextStatuses(current: string) {
  switch (current) {
    case 'pending': return [
      { value: 'confirmed', label: '✓ Confirm' },
      { value: 'cancelled', label: '✗ Cancel' },
    ];
    case 'paid': return [
      { value: 'confirmed', label: '→ Confirm' },
      { value: 'cancelled', label: '✗ Cancel' },
    ];
    case 'confirmed': return [
      { value: 'shipped', label: '🚚 Ship' },
      { value: 'cancelled', label: '✗ Cancel' },
    ];
    case 'shipped': return [
      { value: 'delivered', label: '📦 Delivered' },
    ];
    case 'delivered': return [];
    case 'cancelled': return [];
    default: return [];
  }
}