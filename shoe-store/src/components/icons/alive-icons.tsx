'use client';

import { motion, type Variants } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Tag,
  Star,
  ArrowRight,
  Sparkles,
  Footprints,
  Shirt,
  Circle,
  Dumbbell,
  Truck,
  Shield,
  Banknote,
  Gift,
  type LucideIcon,
} from 'lucide-react';

const bounceVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 1.5,
    },
  },
};

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

const floatVariants: Variants = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 2.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

const spinVariants: Variants = {
  animate: {
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 3,
    },
  },
};

const slideVariants: Variants = {
  animate: {
    x: [0, 4, 0],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

interface AliveIconProps {
  className?: string;
  size?: number;
}

function createAliveIcon(Icon: LucideIcon, variants: Variants) {
  return function AliveIcon({ className, size = 20 }: AliveIconProps) {
    return (
      <motion.span
        className={className}
        variants={variants}
        animate="animate"
        style={{ display: 'inline-flex' }}
      >
        <Icon size={size} />
      </motion.span>
    );
  };
}

export const BouncingCart = createAliveIcon(ShoppingCart, bounceVariants);
export const PulsingHeart = createAliveIcon(Heart, pulseVariants);
export const SpinningTag = createAliveIcon(Tag, spinVariants);
export const FloatingStar = createAliveIcon(Star, floatVariants);
export const SlidingArrow = createAliveIcon(ArrowRight, slideVariants);
export const BouncingSparkles = createAliveIcon(Sparkles, bounceVariants);
export const FloatingFootprints = createAliveIcon(Footprints, floatVariants);
export const BouncingShirt = createAliveIcon(Shirt, bounceVariants);
export const SpinningBasketball = createAliveIcon(Circle, spinVariants);
export const BouncingDumbbell = createAliveIcon(Dumbbell, bounceVariants);
export const FloatingTruck = createAliveIcon(Truck, floatVariants);
export const PulsingShield = createAliveIcon(Shield, pulseVariants);
export const SlidingBanknote = createAliveIcon(Banknote, slideVariants);
export const BouncingGift = createAliveIcon(Gift, bounceVariants);
