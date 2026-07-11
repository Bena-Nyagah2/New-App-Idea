'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    location: '',
    paymentTerms: 'mpesa',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    fetch(`/api/admin/suppliers/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setForm({
          name: data.supplier.name || '',
          contactName: data.supplier.contactName || '',
          phone: data.supplier.phone || '',
          email: data.supplier.email || '',
          location: data.supplier.location || '',
          paymentTerms: data.supplier.paymentTerms || 'mpesa',
          notes: data.supplier.notes || '',
          isActive: data.supplier.isActive ?? true,
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed');

      setSuccess(true);
      setTimeout(() => router.push('/admin/suppliers'), 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading supplier...</div>;
  }

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Edit Supplier</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Supplier updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border p-6">
        <Input
          label="Name / Business Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Nairobi Sneaker Source"
        />

        <Input
          label="Contact Name"
          value={form.contactName}
          onChange={e => setForm({ ...form, contactName: e.target.value })}
          placeholder="e.g., Alex Mutua"
        />

        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="07XX XXX XXX"
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="supplier@example.com"
        />

        <Input
          label="Location (Nairobi Area)"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          placeholder="CBD, Westlands, etc."
        />

        <Select
          label="Payment Terms"
          value={form.paymentTerms}
          onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
          options={[
            { value: 'mpesa', label: 'M-Pesa (Weekly)' },
            { value: 'bank', label: 'Bank Transfer' },
            { value: 'cash', label: 'Cash' },
            { value: 'net15', label: 'Net 15 Days' },
            { value: 'net30', label: 'Net 30 Days' },
            { value: 'consignment', label: 'Consignment (pay after sale)' },
          ]}
        />

        <Textarea
          label="Notes"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={e => setForm({ ...form, isActive: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active supplier</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
