import { db } from '@/lib/db';
import { orders, orderItems, products, variants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { AnimatedCard } from '@/components/admin/animated';
import { parseJsonSafe } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      variantSize: orderItems.variantSize,
      variantColor: orderItems.variantColor,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      productName: orderItems.productName,
      variantSku: variants.sku,
      productImages: products.images,
    })
    .from(orderItems)
    .leftJoin(variants, eq(orderItems.variantId, variants.id))
    .leftJoin(products, eq(variants.productId, products.id))
    .where(eq(orderItems.orderId, id));

  return { ...order, items };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  return (
    <div className="space-y-6 animate-fade-in">
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Placed on {new Date(Number(order.createdAt ?? 0) * 1000).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
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
        </div>
      </AnimatedCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <AnimatedCard delay={0.1}>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-3">Customer</h2>
            <div className="space-y-2 text-sm">
              <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Name:</span> {order.customerName}</p>
              <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Phone:</span> {order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Email:</span> {order.customerEmail}</p>
              )}
              <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Address:</span> {order.shippingAddress || `${order.county || ''} · ${order.deliveryType}`}</p>
              {order.notes && (
                <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Notes:</span> {order.notes}</p>
              )}
            </div>
          </div>
        </AnimatedCard>

        {/* Payment Info */}
        <AnimatedCard delay={0.15}>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Method:</span> <span className="capitalize">{order.paymentMethod}</span></p>
              <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Status:</span> <span className="capitalize">{order.paymentStatus}</span></p>
              {order.paystackReference && (
                <p className="text-[var(--color-text)]"><span className="text-[var(--color-text-muted)]">Ref:</span> <span className="text-xs">{order.paystackReference}</span></p>
              )}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text)] font-bold text-lg">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Order Items */}
        <AnimatedCard delay={0.2}>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
            <h2 className="font-semibold text-[var(--color-text)] mb-3">Items ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item) => {
                const images = parseJsonSafe(item.productImages, []) as string[];
                const img = images[0] || null;
                return (
                <div key={item.id} className="flex gap-3">
                  {img ? (
                    <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover bg-[var(--color-surface-elevated)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-elevated)] flex items-center justify-center">👟</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.productName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.variantSize && `Size: ${item.variantSize}`}
                      {item.variantColor && ` · Color: ${item.variantColor}`}
                      {` · Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{formatPrice(item.totalPrice)}</p>
                </div>
                );
              })}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
