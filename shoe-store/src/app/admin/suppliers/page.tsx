import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
export const dynamic = 'force-dynamic';

async function getSuppliers() {
  return db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
}

interface PageProps {
  searchParams: Record<string, string>;
}

export default async function SuppliersPage({ searchParams }: PageProps) {
  const suppliersList = await getSuppliers();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Link href="/admin/suppliers/add" className="btn btn-primary text-sm">
          + Add Supplier
        </Link>
      </div>

      {suppliersList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersList.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{supplier.name}</h3>
                <span className={`badge ${supplier.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {supplier.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {supplier.contactName && (
                <p className="text-sm text-gray-600">Contact: {supplier.contactName}</p>
              )}
              
              <div className="mt-3 space-y-1 text-sm">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>📞 {supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>✉️ {supplier.email}</span>
                  </div>
                )}
                {supplier.location && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>📍 {supplier.location}</span>
                  </div>
                )}
                {supplier.paymentTerms && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>💳 {supplier.paymentTerms}</span>
                  </div>
                )}
              </div>

              {supplier.notes && (
                <p className="mt-3 text-sm text-gray-400 italic">{supplier.notes}</p>
              )}
              
              <div className="mt-4 pt-3 border-t flex gap-2">
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                <button className="text-xs text-red-600 hover:text-red-700 font-medium">Deactivate</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-16 text-center">
          <p className="text-gray-500 text-lg">No suppliers added</p>
          <p className="text-gray-400 text-sm mt-2">Add your shoe suppliers here</p>
          <Link href="/admin/suppliers/add" className="mt-4 inline-flex btn btn-primary">
            Add First Supplier
          </Link>
        </div>
      )}
    </div>
  );
}