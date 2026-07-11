'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Tag, Star, Sparkles } from 'lucide-react';

interface ProductShowcaseProps {
  image: string;
  name: string;
  brand: string;
  price: string;
}

export function ProductShowcase({ image, name, brand, price }: ProductShowcaseProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 30,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ perspective: 1200 }}>
      {/* Glow effect behind card */}
      <motion.div
        className="absolute inset-0 m-auto w-[80%] h-[80%] rounded-3xl bg-primary-400/20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main 3D card */}
      <motion.div
        className="relative"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Card body */}
        <div
          className="relative bg-white rounded-3xl overflow-hidden"
          style={{
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25), 0 0 40px rgba(237,137,20,0.15)',
          }}
        >
          {/* Image container */}
          <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-primary-100 p-8">
            <motion.div
              className="relative w-full h-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src={image}
                alt={name}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>

            {/* Floating sparkles */}
            <motion.div
              className="absolute top-6 right-6 text-primary-400"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={24} />
            </motion.div>
            <motion.div
              className="absolute bottom-8 left-6 text-secondary-400"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <Star size={20} fill="currentColor" />
            </motion.div>
          </div>

          {/* Card info */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{brand}</span>
            </div>
            <h3 className="font-[var(--font-heading)] font-bold text-lg text-gray-900 mb-2">{name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{price}</span>
              <motion.span
                className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold"
                whileHover={{ scale: 1.05 }}
              >
                <Tag size={12} />
                New Arrival
              </motion.span>
            </div>
          </div>
        </div>

        {/* Shadow underneath */}
        <motion.div
          className="absolute -bottom-4 left-[10%] right-[10%] h-8 bg-black/10 rounded-full blur-xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}
