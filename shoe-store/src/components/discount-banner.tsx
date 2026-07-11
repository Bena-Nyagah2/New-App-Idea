'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Percent } from 'lucide-react';
import { useTheme } from './theme-provider';

export function DiscountBanner() {
  const { activeTheme } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (activeTheme.id === 'default' || dismissed || !activeTheme.bannerText) {
    return null;
  }

  const Icon = activeTheme.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative overflow-hidden banner-gradient text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-center gap-3 text-sm font-medium">
            <Icon size={16} className="animate-bounce-subtle" />
            <span className="font-[var(--font-heading)] font-semibold tracking-wide uppercase">
              {activeTheme.bannerText}
            </span>
            <span className="hidden sm:inline opacity-80">—</span>
            <span className="hidden sm:inline">{activeTheme.bannerSubtext}</span>
            {activeTheme.discountPercent > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                <Percent size={10} />
                {activeTheme.discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
