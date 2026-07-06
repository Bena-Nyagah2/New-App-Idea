'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CATEGORIES, BRANDS, SIZES_EU } from '@/lib/validations';
import { Textarea } from '@/components/ui/textarea';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    basePrice: '',
    images: '',
    variants: [{ size: '', color: '', stock: '', costPrice: '', sku: '' }],
  });

  function addVariant() {
    setForm({ ...form, variants: [...form.variants, { size: '', color: '', stock: '', costPrice: '', sku: '' }] });
  }

  function updateVariant(idx: number, field: string, value: string) {
    const newVariants = [...form.variants];
    (newVariants[idx] as any)[field] = value;
    setForm({ ...form, variants: newVariants });
  }

  function removeVariant(idx: number) {
    if (form.variants.length > 1) {
      setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          category: form.category,
          description: form.description,
          basePrice: parseInt(form.basePrice) * 100, // KES to cents
          images: form.images.split(',').map(s => s.trim()).filter(Boolean),
          variants: form.variants.filter(v => v.size && v.color).map(v => ({
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock) || 0,
            costPrice: parseInt(v.costPrice) * 100 || 0,
            sku: v.sku,
          })),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed');

      setMessage('Product added successfully!');
      setTimeout(() => router.push('/admin/inventory'), 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border p-6">
        <Input
          label="Product Name"
          placeholder="Nike Air Max 90"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Brand"
            options={BRANDS.map(b => ({ value: b, label: b }))}
            value={form.brand}
            onChange={e => setForm({ ...form, brand: e.target.value })}
            placeholder="Select brand"
          />
          <Select
            label="Category"
            options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            placeholder="Select category"
          />
        </div>

        <Input
          label="Base Price (KES)"
          type="number"
          placeholder="3500"
          value={form.basePrice}
          onChange={e => setForm({ ...form, basePrice: e.target.value })}
        />

        <Textarea
          label="Description"
          placeholder="Comfortable running shoes..."
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <Input
          label="Images (Cloudinary URLs, comma-separated)"
          placeholder="https://res.cloudinary.com/..."
          value={form.images}
          onChange={e => setForm({ ...form, images: e.target.value })}
          helperText="Upload to Cloudinary first, paste URLs here"
        />

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Variants (Sizes &amp; Colors)</h3>
            <button type="button" onClick={addVariant} className="text-primary-600 text-sm font-medium hover:text-primary-700">
              + Add Variant
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {form.variants.map((variant, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                <select
                  value={variant.size}
                  onChange={e => updateVariant(idx, 'size', e.target.value)}
                  className="input text-sm py-1 bg-white max-w-[100px]"
                >
                  <option value="" disabled>Size</option>
                  {SIZES_EU.map(s => <option key={s} value={s}>EU {s}</option>)}
                </select>
                <select
                  value={variant.color}
                  onChange={e => updateVariant(idx, 'color', e.target.value)}
                  className="input text-sm py-1 bg-white max-w-[120px]"
                >
                  <option value="" disabled>Color</option>
                  {['Black', 'White', 'Red', 'Blue', 'Grey', 'Green', 'Pink', 'Brown'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  value={variant.stock}
                  onChange={e => updateVariant(idx, 'stock', e.target.value)}
                  placeholder="Stock"
                  type="number"
                  className="input text-sm py-1 bg-white max-w-[70px]"
                />
                <input
                  value={variant.sku}
                  onChange={e => updateVariant(idx, 'sku', e.target.value)}
                  placeholder="SKU"
                  className="input text-sm py-1 bg-white max-w-[120px]"
                />
                {form.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Add Product
        </Button>
      </form>
    </div>
  );
}