'use client';

import { motion } from 'framer-motion';
import { Zap, Truck, Shield } from 'lucide-react';

interface FloatingBadgeProps {
  icon: 'zap' | 'truck' | 'shield';
  label: string;
  className?: string;
  delay?: number;
}

const iconMap = {
  zap: Zap,
  truck: Truck,
  shield: Shield,
};

export function FloatingBadge({ icon, label, className = '', delay = 0 }: FloatingBadgeProps) {
  const Icon = iconMap[icon];

  return (
    <motion.div
      className={`inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-float border border-white/50 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 120, damping: 14 }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <motion.span
        className="text-primary-500"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        <Icon size={16} />
      </motion.span>
      <span className="text-sm font-semibold text-gray-800 font-[var(--font-heading)]">{label}</span>
    </motion.div>
  );
}
