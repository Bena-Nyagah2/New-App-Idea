'use client';

import Link from 'next/link';
import { getBrandLogo } from '@/lib/brands';
import { useEffect, useState, useRef } from 'react';

interface Brand {
  brand: string;
}

const svgCache = new Map<string, string>();

async function fetchSvg(path: string): Promise<string> {
  if (svgCache.has(path)) return svgCache.get(path)!;
  try {
    const res = await fetch(path);
    const text = await res.text();
    svgCache.set(path, text);
    return text;
  } catch {
    return '';
  }
}

function BrandCard({ brand }: { brand: string }) {
  const [svg, setSvg] = useState('');
  const config = getBrandLogo(brand);

  useEffect(() => {
    if (config) fetchSvg(config.logo).then(setSvg);
  }, [config]);

  return (
    <Link
      href={`/shoes?brand=${encodeURIComponent(brand)}`}
      className="flex-shrink-0 w-40 h-24 mx-3 flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 group/card"
    >
      {config && svg ? (
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="text-gray-400 group-hover/card:text-[var(--color-primary)] transition-colors duration-300 w-20 h-7 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] group-hover/card:text-[var(--color-primary)] transition-colors uppercase tracking-wider">
            {brand}
          </span>
        </div>
      ) : (
        <span className="font-bold text-[var(--color-text-muted)] group-hover/card:text-[var(--color-primary)] transition-colors text-sm">
          {brand}
        </span>
      )}
    </Link>
  );
}

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  const brandItems = brands.map(b => b.brand);
  const doubled = [...brandItems, ...brandItems];

  return (
    <section className="section overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <h2 className="heading-2 text-center">Popular Brands</h2>
      </div>

      <div className="relative group">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee group-hover:pause-marquee">
          {doubled.map((brand, i) => (
            <BrandCard key={`${brand}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
