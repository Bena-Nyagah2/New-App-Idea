'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glareEnabled?: boolean;
  scaleOnHover?: number;
}

export function TiltCard({
  children,
  className,
  intensity = 8,
  glareEnabled = true,
  scaleOnHover = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  });

  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glareOpacity = useTransform(
    [x, y] as const,
    ([vx, vy]: number[]) => (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01 ? 0.15 : 0)
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scaleOnHover : 1,
        }}
        transition={{ scale: { duration: 0.3, ease: 'easeOut' } }}
      >
        {children}

        {glareEnabled && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              opacity: glareOpacity,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
