import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { AnimatedCard, StaggerContainer, StaggerItem } from '@/components/admin/animated';
import { UpdateStatusButton } from './update-status-button';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

async function getOrders(status?: string) {
  const whereClause = status
    ? eq(orders.status, status as 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned')
    : undefined;

  return db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      total: orders.total,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(50);
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status } = await searchParams;
  const ordersList = await getOrders(status);

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Orders</h1>
          <div className="flex gap-2">
            {['pending', 'confirmed', 'shipped', 'delivered'].map(s => (
              <Link
                key={s}
                href={status === s ? '/admin/orders' : `/admin/orders?status=${s}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  status === s
                    ? 'bg-primary-500 text-white'
                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600'
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </AnimatedCard>

      {ordersList.length > 0 ? (
        <StaggerContainer className="space-y-3">
          {ordersList.map((order) => (
            <StaggerItem key={order.id}>
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary-600 font-medium hover:underline text-sm">
                        #{order.id.slice(0, 8)}
                      </Link>
                      <span className={`badge ${
                        order.status === 'delivered' ? 'badge-success' :
                        order.status === 'cancelled' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text)]">{order.customerName} · {order.customerPhone}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {order.paymentMethod === 'paystack' ? '💳 Online' : '💵 COD'} · {formatPrice(order.total)} · {new Date(Number(order.createdAt ?? 0) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="bg-[var(--color-surface-elevated)] rounded-xl p-16 text-center">
          <p className="text-[var(--color-text-muted)] text-lg">
            {status ? `No ${status} orders` : 'No orders yet'}
          </p>
        </div>
      )}
    </div>
  );
}
