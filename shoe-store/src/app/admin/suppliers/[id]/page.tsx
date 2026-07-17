'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PageProps {
  params: { id: string };
}

export default function EditSupplierPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetch(`/api/admin/suppliers/${id}`)
      .then(res => res.json())
      .then(data => {
        const s = data.supplier || data;
        setForm({
          name: s.name || '',
          contactName: s.contactName || '',
          phone: s.phone || '',
          email: s.email || '',
          location: s.location || '',
          notes: s.notes || '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to update supplier');
      }

      toast.success('Supplier updated');
      router.push('/admin/suppliers');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-[var(--color-text-muted)] animate-pulse">Loading supplier…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors text-[var(--color-text-muted)]">
          ←
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit Supplier</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 space-y-4">
        <Input
          label="Supplier Name"
          value={form.name}
          onChange={e => updateField('name', e.target.value)}
          required
        />

        <Input
          label="Contact Name"
          value={form.contactName}
          onChange={e => updateField('contactName', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
          />
        </div>

        <Input
          label="Location"
          value={form.location}
          onChange={e => updateField('location', e.target.value)}
        />

        <Input
          label="Notes"
          value={form.notes}
          onChange={e => updateField('notes', e.target.value)}
        />

        <Button type="submit" loading={saving} className="w-full" size="lg">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
