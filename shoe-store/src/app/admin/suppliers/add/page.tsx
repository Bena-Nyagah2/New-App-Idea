'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AddSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    location: '',
    paymentTerms: 'mpesa',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed');

      router.push('/admin/suppliers');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Add Supplier</h1>

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

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Add Supplier
        </Button>
      </form>
    </div>
  );
}