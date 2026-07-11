'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, BRANDS, SIZES_EU } from '@/lib/validations';

interface VariantForm {
  id?: string;
  size: string;
  color: string;
  colorHex: string;
  stock: string;
  costPrice: string;
  sku: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    basePrice: '',
    images: '',
    isActive: true,
  });

  const [variants, setVariants] = useState<VariantForm[]>([]);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        const p = data.product;
        setForm({
          name: p.name || '',
          brand: p.brand || '',
          category: p.category || '',
          description: p.description || '',
          basePrice: String((p.basePrice || 0) / 100),
          images: (JSON.parse(p.images || '[]')).join(', '),
          isActive: p.isActive ?? true,
        });
        setVariants(
          (data.variants || []).map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || '',
            stock: String(v.stock || 0),
            costPrice: v.costPrice ? String(v.costPrice / 100) : '',
            sku: v.sku || '',
          }))
        );
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  function addVariant() {
    setVariants([...variants, { size: '', color: '', colorHex: '', stock: '', costPrice: '', sku: '' }]);
  }

  function updateVariant(idx: number, field: string, value: string) {
    const newVariants = [...variants];
    (newVariants[idx] as any)[field] = value;
    setVariants(newVariants);
  }

  function removeVariant(idx: number) {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== idx));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          category: form.category,
          description: form.description,
          basePrice: parseInt(form.basePrice) * 100,
          images: form.images.split(',').map(s => s.trim()).filter(Boolean),
          isActive: form.isActive,
          variants: variants.filter(v => v.size && v.color).map(v => ({
            id: v.id,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || undefined,
            stock: parseInt(v.stock) || 0,
            costPrice: parseInt(v.costPrice) * 100 || 0,
            sku: v.sku || undefined,
          })),
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed');

      setSuccess(true);
      setTimeout(() => router.push('/admin/inventory'), 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading product...</div>;
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Product updated successfully!
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

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={e => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active product (visible on store)</label>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Variants (Sizes &amp; Colors)</h3>
            <button type="button" onClick={addVariant} className="text-primary-600 text-sm font-medium hover:text-primary-700">
              + Add Variant
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
            {variants.map((variant, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg items-end">
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
                  value={variant.colorHex}
                  onChange={e => updateVariant(idx, 'colorHex', e.target.value)}
                  placeholder="#000"
                  className="input text-sm py-1 bg-white w-20"
                />
                <input
                  value={variant.stock}
                  onChange={e => updateVariant(idx, 'stock', e.target.value)}
                  placeholder="Stock"
                  type="number"
                  className="input text-sm py-1 bg-white max-w-[70px]"
                />
                <input
                  value={variant.costPrice}
                  onChange={e => updateVariant(idx, 'costPrice', e.target.value)}
                  placeholder="Cost KES"
                  type="number"
                  className="input text-sm py-1 bg-white max-w-[90px]"
                />
                <input
                  value={variant.sku}
                  onChange={e => updateVariant(idx, 'sku', e.target.value)}
                  placeholder="SKU"
                  className="input text-sm py-1 bg-white max-w-[120px]"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-red-500 text-sm hover:text-red-700 px-1"
                  >
                    &#10005;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} className="flex-1" size="lg">
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1" size="lg">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
