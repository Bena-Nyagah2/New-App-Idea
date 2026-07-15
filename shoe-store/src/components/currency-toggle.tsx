'use client';

import { motion } from 'framer-motion';
import { useCurrencyStore } from '@/lib/currency-store';
import { cn } from '@/lib/utils';

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrencyStore();

  const options = [
    { id: 'KES' as const, label: 'KSh' },
    { id: 'USD' as const, label: '$' },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[var(--color-surface-elevated)] p-0.5 border border-[var(--color-border)]">
      {options.map(opt => {
        const isActive = currency === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => setCurrency(opt.id)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-bold transition-colors',
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
