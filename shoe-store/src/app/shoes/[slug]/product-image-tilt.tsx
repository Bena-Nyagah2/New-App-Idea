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

const LENS_SIZE = 160;
const ZOOM = 2.5;

export function ProductImageTilt({ src, alt, inStock, outOfStockLabel = 'Out of Stock' }: ProductImageTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });

  const glareOpacity = useTransform(
    [x, y] as const,
    ([vx, vy]: number[]) => (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01 ? 0.25 : 0)
  );
  const glareX = useTransform(x, [-0.5, 0.5], [20, 80]);
  const glareY = useTransform(y, [-0.5, 0.5], [20, 80]);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    x.set(normX - 0.5);
    y.set(normY - 0.5);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setHovered(false);
  }

  return (
    <motion.div
      ref={ref}
      className="relative rounded-2xl overflow-hidden bg-[var(--color-surface-elevated)] cursor-crosshair"
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

      {/* Dynamic glare effect — tracks mouse position */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: glareOpacity,
          background: useTransform(
            [glareX, glareY] as const,
            ([gx, gy]: number[]) =>
              `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.3) 0%, transparent 55%)`
          ),
        }}
      />

      {/* Magnifying lens zoom */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-30 rounded-full border-2 border-white/60 shadow-2xl overflow-hidden"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: lensPos.x - LENS_SIZE / 2,
            top: lensPos.y - LENS_SIZE / 2,
          }}
        >
          <div
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${src})`,
              backgroundSize: `${ref.current ? ref.current.offsetWidth * ZOOM : 600}px ${ref.current ? ref.current.offsetHeight * ZOOM : 600}px`,
              backgroundPosition: `${-(mousePos.x * ZOOM - LENS_SIZE / 2)}px ${-(mousePos.y * ZOOM - LENS_SIZE / 2)}px`,
            }}
          />
          {/* Lens glare ring */}
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
        </div>
      )}
    </motion.div>
  );
}
