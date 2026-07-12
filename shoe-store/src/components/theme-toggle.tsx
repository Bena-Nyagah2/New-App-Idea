'use client';

import { useTheme } from '@/components/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

const modes = ['light', 'dark', 'auto'] as const;
const icons = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
} as const;
const labels = {
  light: 'Light mode',
  dark: 'Dark mode',
  auto: 'System theme',
} as const;

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  function cycle() {
    const idx = modes.indexOf(mode);
    setMode(modes[(idx + 1) % modes.length]);
  }

  const Icon = icons[mode];

  return (
    <motion.button
      onClick={cycle}
      className="relative p-2.5 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors"
      aria-label={labels[mode]}
      whileTap={{ scale: 0.9, rotate: -30 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="block"
        >
          <Icon size={22} className="text-[var(--color-text)]" />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
