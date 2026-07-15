import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, MapPin, CreditCard } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Delivery Information - ${siteConfig.name}`,
  description: `Learn about our delivery options, zones, and pricing. Free delivery within ${siteConfig.freeDeliveryArea}.`,
};

const zones = [
  { area: `${siteConfig.freeDeliveryArea}`, boda: 'Free', courier: 'Free', pickup: 'Free', time: 'Same/Next day' },
  { area: 'Nairobi (Outside CBD)', boda: 'KES 200', courier: 'KES 350', pickup: 'Free', time: 'Same/Next day' },
  { area: 'Kiambu / Thika', boda: '—', courier: 'KES 350', pickup: '—', time: '1-2 days' },
  { area: 'Machakos / Kajiado', boda: '—', courier: 'KES 400', pickup: '—', time: '1-2 days' },
  { area: 'Mombasa', boda: '—', courier: 'KES 500', pickup: '—', time: '2-3 days' },
  { area: 'Countrywide (Other Counties)', boda: '—', courier: 'KES 400-600', pickup: '—', time: '2-5 days' },
  { area: 'Worldwide', boda: '—', courier: 'From KES 1,000', pickup: '—', time: '5-10 days' },
];

export default function DeliveryInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <nav className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)] font-medium">Delivery Info</span>
      </nav>

      <h1 className="heading-1 mb-4">Delivery Information</h1>
      <p className="text-body text-lg mb-10">Fast, reliable delivery across Kenya and worldwide</p>

      {/* Delivery Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 text-center">
          <Truck size={32} className="mx-auto text-[var(--color-primary)] mb-3" />
          <h3 className="font-bold text-lg mb-1 text-[var(--color-text)]">Uber Boda</h3>
          <p className="text-sm text-[var(--color-text-muted)]">Fastest option. Delivered to your door within hours in Nairobi.</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 text-center">
          <Clock size={32} className="mx-auto text-[var(--color-primary)] mb-3" />
          <h3 className="font-bold text-lg mb-1 text-[var(--color-text)]">Courier</h3>
          <p className="text-sm text-[var(--color-text-muted)]">Reliable delivery anywhere in Kenya. 1-5 days depending on location.</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 text-center">
          <MapPin size={32} className="mx-auto text-[var(--color-primary)] mb-3" />
          <h3 className="font-bold text-lg mb-1 text-[var(--color-text)]">Pickup</h3>
          <p className="text-sm text-[var(--color-text-muted)]">Collect from our Nairobi location at no extra cost.</p>
        </div>
      </div>

      {/* Pricing Table */}
      <h2 className="heading-2 mb-6">Delivery Zones & Pricing</h2>
      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <thead>
            <tr className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
              <th className="text-left px-5 py-3 font-semibold text-[var(--color-text)]">Area</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--color-text)]">Boda</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--color-text)]">Courier</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--color-text)]">Pickup</th>
              <th className="text-left px-5 py-3 font-semibold text-[var(--color-text)]">Estimated Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {zones.map((zone, i) => (
              <tr key={zone.area}>
                <td className="px-5 py-3 font-medium text-[var(--color-text)]">{zone.area}</td>
                <td className="px-5 py-3 text-[var(--color-text-muted)]">{zone.boda}</td>
                <td className="px-5 py-3 text-[var(--color-text-muted)]">{zone.courier}</td>
                <td className="px-5 py-3 text-[var(--color-text-muted)]">{zone.pickup}</td>
                <td className="px-5 py-3 text-[var(--color-text-muted)]">{zone.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Info */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={24} className="text-[var(--color-primary)]" />
          <h2 className="heading-3">Payment Options</h2>
        </div>
        <ul className="space-y-2 text-[var(--color-text-muted)]">
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">•</span> M-Pesa (via Paystack)</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">•</span> Debit / Credit Card (via Paystack)</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">•</span> Cash on Delivery (Nairobi only)</li>
        </ul>
      </div>
    </div>
  );
}