'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getBrandLogo } from '@/lib/brands';

interface Brand {
  brand: string;
}

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  const brandItems = brands.map(b => ({
    ...b,
    config: getBrandLogo(b.brand),
  }));

  // Double the list for seamless loop
  const doubled = [...brandItems, ...brandItems];

  return (
    <section className="section overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 className="heading-2 text-center">Popular Brands</h2>
      </div>

      {/* Marquee container */}
      <div className="relative group">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-marquee group-hover:pause-marquee">
          {doubled.map((item, i) => (
            <Link
              key={`${item.brand}-${i}`}
              href={`/shoes?brand=${encodeURIComponent(item.brand)}`}
              className="flex-shrink-0 w-40 h-24 mx-3 flex items-center justify-center bg-white border border-gray-100 rounded-2xl hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 group/card"
            >
              {item.config ? (
                <div className="relative flex flex-col items-center gap-1.5">
                  <Image
                    src={item.config.logo}
                    alt={`${item.brand} logo`}
                    width={80}
                    height={28}
                    className="opacity-50 group-hover/card:opacity-100 transition-opacity duration-300"
                  />
                  <span className="text-[10px] font-semibold text-gray-400 group-hover/card:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
                    {item.brand}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-gray-500 group-hover/card:text-[var(--color-primary)] transition-colors text-sm">
                  {item.brand}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
