'use client';

import { motion } from 'framer-motion';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient base */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #e06d0f 0%, #ed8914 25%, #b85010 50%, #ed8914 75%, #e06d0f 100%)',
            'linear-gradient(135deg, #ed8914 0%, #b85010 25%, #e06d0f 50%, #b85010 75%, #ed8914 100%)',
            'linear-gradient(135deg, #b85010 0%, #ed8914 25%, #e06d0f 50%, #ed8914 75%, #b85010 100%)',
            'linear-gradient(135deg, #e06d0f 0%, #ed8914 25%, #b85010 50%, #ed8914 75%, #e06d0f 100%)',
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Mesh pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                            radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating decorative orbs */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-white/[0.06] blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-white/[0.05] blur-3xl"
        animate={{
          y: [0, 20, 0],
          x: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-[50%] left-[60%] w-48 h-48 rounded-full bg-secondary-600/[0.08] blur-2xl"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
    </div>
  );
}
