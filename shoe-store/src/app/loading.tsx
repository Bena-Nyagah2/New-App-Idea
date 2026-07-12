import { HeroSkeleton } from '@/components/skeleton';
import { ProductGridSkeleton } from '@/components/skeleton';

export default function HomeLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mx-auto" />
          <ProductGridSkeleton count={4} />
        </div>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mx-auto" />
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}
