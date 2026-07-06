'use client';

export function SortDropdown({ sort }: { sort?: string }) {
  return (
    <select
      className="input max-w-[160px] bg-white"
      defaultValue={sort || 'newest'}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort', e.target.value);
        window.location.href = url.toString();
      }}
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}