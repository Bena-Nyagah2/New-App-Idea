import { db } from '@/lib/db';
import { payouts, suppliers } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
export const dynamic = 'force-dynamic';

async function getPayouts() {
  return db
    .select({
      id: payouts.id,
      supplierId: payouts.supplierId,
      amount: payouts.amount,
      status: payouts.status,
      method: payouts.method,
      reference: payouts.reference,
      paidAt: payouts.paidAt,
      createdAt: payouts.createdAt,
      supplierName: suppliers.name,
    })
    .from(payouts)
    .leftJoin(suppliers, eq(payouts.supplierId, suppliers.id))
    .orderBy(desc(payouts.createdAt))
    .limit(30);
}

async function getPendingPayoutTotal() {
  const [result] = await db
    .select({ sum: sql<number>`sum(${payouts.amount})` })
    .from(payouts)
    .where(eq(payouts.status, 'pending'));
  return result?.sum || 0;
}

export default async function PayoutsPage() {
  const [payoutsList, pendingTotal] = await Promise.all([
    getPayouts(),
    getPendingPayoutTotal(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payouts</h1>
        <div className="text-sm text-gray-500">
          Pending: <span className="font-bold text-yellow-600">{formatPrice(pendingTotal)}</span>
        </div>
      </div>

      {payoutsList.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Supplier</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Method</th>
                <th className="text-left px-4 py-3 font-medium">Reference</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payoutsList.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{payout.supplierName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(payout.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${
                      payout.status === 'paid' ? 'badge-success' :
                      payout.status === 'pending' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{payout.method || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{payout.reference || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {payout.paidAt
                      ? new Date(Number(payout.paidAt) * 1000).toLocaleDateString()
                      : new Date(Number(payout.createdAt ?? 0) * 1000).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-16 text-center">
          <p className="text-gray-500 text-lg">No payouts yet</p>
          <p className="text-gray-400 text-sm mt-2">Payouts are generated weekly after orders are delivered</p>
        </div>
      )}
    </div>
  );
}