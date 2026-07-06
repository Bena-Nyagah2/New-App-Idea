import { db } from '@/lib/db';
import { orders, orderItems, variants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { orderStatuses, paymentStatuses } from '@/lib/validations';
import { UpdateStatusButton } from '../update-status-button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

async function getOrder(orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { order, items };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const data = await getOrder(params.id);

  if (!data) {
    notFound();
  }

  const { order, items } = data;
  const statusConfig = orderStatuses.find((s) => s.value === order.status);
  const paymentConfig = paymentStatuses.find((s) => s.value === order.paymentStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
          ← Orders
        </Link>
        <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h1>
      </div>

      {/* Status + Action */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Status:</span>
            <span className="badge badge-lg" style={{ backgroundColor: `${statusConfig?.color || 'gray'}20`, color: statusConfig?.color || 'gray' }}>
              {statusConfig?.label || order.status}
            </span>
            <span className="text-sm text-gray-500">·</span>
            <span className="text-sm text-gray-500">Payment:</span>
            <span className="badge badge-lg" style={{ backgroundColor: `${paymentConfig?.color || 'gray'}20`, color: paymentConfig?.color || 'gray' }}>
              {paymentConfig?.label || order.paymentMethod} · {order.paymentStatus}
            </span>
          </div>
          <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Timeline */}
        <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
          <div>
            <span className="text-gray-500 font-medium">Created</span>
            <br />
            {new Date(Number(order.createdAt ?? 0) * 1000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
          {order.confirmedAt && (
            <div>
              <span className="text-blue-500 font-medium">Confirmed</span>
              <br />
              {new Date(Number(order.confirmedAt) * 1000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {order.shippedAt && (
            <div>
              <span className="text-purple-500 font-medium">Shipped</span>
              <br />
              {new Date(Number(order.shippedAt) * 1000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {order.deliveredAt && (
            <div>
              <span className="text-green-500 font-medium">Delivered</span>
              <br />
              {new Date(Number(order.deliveredAt) * 1000).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Customer + Order Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">{order.customerName || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{order.customerEmail || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{order.customerPhone || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">County</dt>
              <dd className="font-medium">{order.county || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Delivery + Payment */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Delivery &amp; Payment</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Delivery</dt>
              <dd className="font-medium capitalize">{order.deliveryType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Delivery Fee</dt>
              <dd className="font-medium">{formatPrice(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Payment Method</dt>
              <dd className="font-medium capitalize">{order.paymentMethod === 'paystack' ? 'Online (Paystack)' : order.paymentMethod}</dd>
            </div>
            {order.paystackReference && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Paystack Ref</dt>
                <dd className="text-xs font-mono text-gray-400">{order.paystackReference}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold">Items ({items.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Variant</th>
              <th className="text-center px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Unit Price</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-gray-500">
                  {item.variantSize} / {item.variantColor}
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-right text-gray-500">Subtotal</td>
              <td className="px-4 py-3 text-right font-medium">{formatPrice(order.subtotal)}</td>
            </tr>
            {order.deliveryFee > 0 && (
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-4 py-3 text-right text-gray-500">Delivery Fee</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(order.deliveryFee)}</td>
              </tr>
            )}
            <tr className="bg-gray-50 font-bold">
              <td colSpan={3} className="px-4 py-3 text-right">Total</td>
              <td className="px-4 py-3 text-right">{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {(order.notes || order.adminNotes) && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-3">Notes</h2>
          {order.notes && (
            <div className="mb-3">
              <span className="text-xs text-gray-400 uppercase font-medium">Customer</span>
              <p className="text-sm mt-1 text-gray-700">{order.notes}</p>
            </div>
          )}
          {order.adminNotes && (
            <div>
              <span className="text-xs text-gray-400 uppercase font-medium">Admin</span>
              <p className="text-sm mt-1 text-gray-700">{order.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}