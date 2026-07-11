'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

interface ProductImageTiltProps {
  src: string;
  alt: string;
  inStock: boolean;
  outOfStockLabel?: string;
}

export function ProductImageTilt({ src, alt, inStock, outOfStockLabel = 'Out of Stock' }: ProductImageTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });

  const glareOpacity = useTransform(
    [x, y] as const,
    ([vx, vy]: number[]) => (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01 ? 0.2 : 0)
  );

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      className="relative rounded-2xl overflow-hidden bg-gray-50 cursor-crosshair"
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        animate={{ scale: hovered ? 1.03 : 1 }}
        transition={{ scale: { duration: 0.3, ease: 'easeOut' } }}
        className="relative aspect-square"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ transform: 'translateZ(30px)' }}>
            <span className="bg-red-600 text-white px-5 py-2.5 rounded-full text-lg font-bold shadow-lg">
              {outOfStockLabel}
            </span>
          </div>
        )}
      </motion.div>

      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)',
          opacity: glareOpacity,
        }}
      />
    </motion.div>
  );
}
