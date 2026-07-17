import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { desc, sql, eq, and } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { AnimatedCard, StaggerContainer, StaggerItem } from '@/components/admin/animated';
import { UpdateStatusButton } from './update-status-button';

export const dynamic = 'force-dynamic';

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; payment?: string }>;
}

async function getOrders(status?: string, payment?: string) {
  const conditions = [];
  if (status) conditions.push(eq(orders.status, status as 'pending' | 'paid' | 'confirmed' | 'completed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'));
  if (payment) conditions.push(eq(orders.paymentMethod, payment as 'paystack' | 'cod' | 'mpesa'));

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
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(50);
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status, payment } = await searchParams;
  const ordersList = await getOrders(status, payment);

  const statusFilters = ['pending', 'confirmed', 'completed', 'shipped', 'delivered', 'cancelled'];
  const paymentFilters = [
    { label: 'Online', value: 'paystack', icon: '💳' },
    { label: 'COD', value: 'cod', icon: '💵' },
    { label: 'M-Pesa', value: 'mpesa', icon: '📱' },
  ];

  function buildHref(s?: string, p?: string) {
    const params = new URLSearchParams();
    if (s) params.set('status', s);
    if (p) params.set('payment', p);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatedCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Orders</h1>
            <div className="flex gap-2">
              {statusFilters.map(s => (
                <Link
                  key={s}
                  href={status === s ? buildHref(undefined, payment) : buildHref(s, payment)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    status === s
                      ? 'bg-primary-500 text-white'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:bg-primary-50 dark:hover:bg-zinc-700 hover:text-primary-600'
                  }`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] font-medium">Payment:</span>
            {paymentFilters.map(p => (
              <Link
                key={p.value}
                href={payment === p.value ? buildHref(status, undefined) : buildHref(status, p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  payment === p.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:bg-primary-50 dark:hover:bg-zinc-700 hover:text-primary-600'
                }`}
              >
                {p.icon} {p.label}
              </Link>
            ))}
            {(status || payment) && (
              <Link
                href="/admin/orders"
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                ✕ Clear
              </Link>
            )}
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
                      {order.paymentMethod === 'paystack' ? '💳 Online' : order.paymentMethod === 'mpesa' ? '📱 M-Pesa' : '💵 COD'} · {formatPrice(order.total)} · {new Date(Number(order.createdAt ?? 0) * 1000).toLocaleDateString()}
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
