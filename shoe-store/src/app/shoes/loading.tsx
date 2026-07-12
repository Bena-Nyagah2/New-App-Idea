import { ProductGridSkeleton } from '@/components/skeleton';

export default function ShoesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-8" />
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        ))}
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
