'use client';

interface ProductActionsProps {
  productId: string;
}

export function ProductActions({ productId }: ProductActionsProps) {
  return (
    <a
      href={`/admin/inventory/${productId}`}
      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
    >
      Edit
    </a>
  );
}
