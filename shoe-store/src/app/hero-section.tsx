'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { HeroBackground } from '@/components/hero/hero-background';
import { ProductShowcase } from '@/components/hero/product-showcase';
import { FloatingBadge } from '@/components/hero/floating-badge';
import { siteConfig } from '@/lib/site-config';

interface HomeHeroSectionProps {
  productName: string;
  productBrand: string;
  productPrice: string;
  productImage: string;
}

export function HomeHeroSection({ productName, productBrand, productPrice, productImage }: HomeHeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FloatingBadge icon="zap" label="New Arrivals Just Dropped" />
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Step Into{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Style</span>
                  <motion.span
                    className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-600/40 rounded-full -z-0"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  />
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-white/80 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover premium sneakers, urban fashion, and footwear. Free delivery within {siteConfig.freeDeliveryArea}. Outside {siteConfig.freeDeliveryArea}, countrywide, and worldwide shipping at a fee.
          </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/shoes"
                className="group inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <ShoppingBag size={20} />
                Shop Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shoes?category=running"
                className="inline-flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 px-8 py-3.5 rounded-xl font-bold text-lg backdrop-blur-sm transition-all active:scale-95"
              >
                Running Shoes
              </Link>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              className="flex flex-wrap gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <FloatingBadge icon="truck" label="Same-Day Delivery" delay={0.6} />
              <FloatingBadge icon="shield" label="Secure Payment" delay={0.8} />
            </motion.div>
          </div>

          {/* Right: Product showcase */}
          <div className="relative flex justify-center lg:justify-end">
            <ProductShowcase
              image={productImage}
              name={productName}
              brand={productBrand}
              price={productPrice}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
