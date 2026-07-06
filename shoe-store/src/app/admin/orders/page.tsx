import { db } from '@/lib/db';
import { orders, orderItems, variants, products } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { orderStatuses, paymentStatuses } from '@/lib/validations';
import Link from 'next/link';
import { UpdateStatusButton } from './update-status-button';
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    status?: string;
    paymentMethod?: string;
  };
}

async function getOrders(searchParams: PageProps['searchParams']) {
  let query = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);
  return query;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const ordersList = await getOrders(searchParams);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        
        <div className="flex gap-2">
          <select className="input text-sm py-1 bg-white max-w-[200px]">
            <option value="">All Status</option>
            {orderStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {ordersList.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ordersList.map((order) => {
                const statusConfig = orderStatuses.find(s => s.value === order.status);
                const paymentConfig = paymentStatuses.find(s => s.value === order.paymentStatus);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary-600 font-medium hover:underline">
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-gray-500 text-xs">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${statusConfig?.color || 'gray'}20`, color: statusConfig?.color || 'gray' }}>
                        {statusConfig?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${paymentConfig?.color || 'gray'}20`, color: paymentConfig?.color || 'gray' }}>
                        {paymentConfig?.label || order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {(() => {
                        const createdAt = Number(order.createdAt ?? 0) * 1000;
                        return new Date(createdAt).toLocaleDateString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-16 text-center">
          <p className="text-gray-500 text-lg">No orders yet</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here as customers place them</p>
        </div>
      )}
    </div>
  );
}