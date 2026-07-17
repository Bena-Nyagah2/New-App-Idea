import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { SupplierActions } from './supplier-actions';
import { AnimatedCard, StaggerContainer, StaggerItem } from '@/components/admin/animated';

export const dynamic = 'force-dynamic';

async function getSuppliers() {
  return db
    .select()
    .from(suppliers)
    .orderBy(desc(suppliers.createdAt));
}

export default async function SuppliersPage() {
  const suppliersList = await getSuppliers();

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Suppliers</h1>
          <Link
            href="/admin/suppliers/add"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Supplier
          </Link>
        </div>
      </AnimatedCard>

      {suppliersList.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersList.map((supplier) => (
            <StaggerItem key={supplier.id}>
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{supplier.name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{supplier.contactName}</p>
                  </div>
                  <span className={`badge ${supplier.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-[var(--color-text-muted)] mb-4">
                  {supplier.phone && <p>📞 {supplier.phone}</p>}
                  {supplier.email && <p>✉️ {supplier.email}</p>}
                  {supplier.location && <p>📍 {supplier.location}</p>}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/suppliers/${supplier.id}`}
                    className="flex-1 bg-[var(--color-surface-elevated)] hover:bg-primary-50 dark:hover:bg-zinc-700 text-[var(--color-text-muted)] hover:text-primary-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <SupplierActions id={supplier.id} isActive={supplier.isActive} />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="bg-[var(--color-surface-elevated)] rounded-xl p-16 text-center">
          <p className="text-[var(--color-text-muted)] text-lg">No suppliers yet</p>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">Add your first supplier to start tracking inventory</p>
        </div>
      )}
    </div>
  );
}
