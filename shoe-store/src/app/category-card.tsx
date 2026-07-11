'use client';

import Link from 'next/link';
import { TiltCard } from '@/components/ui/tilt-card';
import { FloatingFootprints, BouncingSparkles, SpinningBasketball, BouncingDumbbell } from '@/components/icons/alive-icons';

const CATEGORY_ICONS: Record<string, typeof FloatingFootprints> = {
  running: FloatingFootprints,
  lifestyle: BouncingSparkles,
  basketball: SpinningBasketball,
  training: BouncingDumbbell,
};

const CATEGORY_COLORS: Record<string, string> = {
  running: 'bg-blue-500',
  lifestyle: 'bg-purple-500',
  basketball: 'bg-orange-500',
  training: 'bg-green-500',
};

interface CategoryCardProps {
  slug: string;
  name: string;
}

export function CategoryCard({ slug, name }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[slug] || BouncingSparkles;
  const color = CATEGORY_COLORS[slug] || 'bg-primary-500';

  return (
    <TiltCard intensity={10} scaleOnHover={1.05} className="aspect-square">
      <Link
        href={`/shoes?category=${slug}`}
        className={`group relative block w-full h-full rounded-2xl overflow-hidden ${color} opacity-90 hover:opacity-100 transition-opacity`}
      >
        <div className="relative p-6 flex flex-col items-center justify-center text-white h-full">
          <span className="mb-3"><Icon size={40} className="text-white" /></span>
          <h3 className="text-xl font-bold font-[var(--font-heading)]">{name}</h3>
          <p className="text-sm opacity-80">Shop {name.toLowerCase()} shoes</p>
        </div>
      </Link>
    </TiltCard>
  );
}
