import { db } from '@/lib/db';
import { orders, products, variants } from '@/lib/db/schema';
import { eq, sql, count, sum } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { AnimatedCard, StaggerContainer, StaggerItem } from '@/components/admin/animated';
export const dynamic = 'force-dynamic';

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  const [ordersToday] = await db
    .select({ count: count() })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${todayTimestamp}`);

  const [revenueToday] = await db
    .select({ sum: sum(orders.total) })
    .from(orders)
    .where(
      sql`${orders.createdAt} >= ${todayTimestamp} AND ${orders.paymentStatus} = 'paid'`
    );

  const [totalProducts] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.isActive, true));

  const [pendingOrders] = await db
    .select({ count: count() })
    .from(orders)
    .where(sql`${orders.status} = 'pending' OR ${orders.status} = 'confirmed'`);

  return {
    ordersToday: ordersToday?.count || 0,
    revenueToday: revenueToday?.sum || 0,
    totalProducts: totalProducts?.count || 0,
    pendingOrders: pendingOrders?.count || 0,
  };
}

async function getRecentOrders() {
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
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(10);
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(),
  ]);

  return (
    <div className="space-y-8">
      <AnimatedCard>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </AnimatedCard>

      {/* Stats Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard
            title="Orders Today"
            value={stats.ordersToday.toString()}
            icon="🛒"
            color="text-blue-600"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Revenue Today"
            value={formatPrice(Number(stats.revenueToday ?? 0))}
            icon="💰"
            color="text-green-600"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Active Products"
            value={stats.totalProducts.toString()}
            icon="👟"
            color="text-purple-600"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders.toString()}
            icon="📦"
            color="text-yellow-600"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Orders */}
      <AnimatedCard delay={0.3}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-primary-600 font-medium hover:underline">
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-gray-500 text-xs">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentMethod === 'paystack' ? 'Online' : 'COD'} · {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(Number(order.createdAt ?? 0) * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            No orders yet
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-500 font-medium">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
