import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, MapPin, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Delivery Information - Shoe Store',
  description: 'Learn about our delivery options, zones, and pricing across Kenya.',
};

const zones = [
  { area: 'Nairobi CBD', boda: 'KES 200', courier: 'KES 350', pickup: 'Free', time: 'Same day' },
  { area: 'Nairobi Suburbs', boda: 'KES 300', courier: 'KES 400', pickup: 'Free', time: 'Same/next day' },
  { area: 'Westlands / Karen', boda: 'KES 350', courier: 'KES 450', pickup: 'Free', time: 'Same day' },
  { area: 'Kiambu / Thika', boda: '—', courier: 'KES 500', pickup: '—', time: '1-2 days' },
  { area: 'Mombasa', boda: '—', courier: 'KES 700', pickup: '—', time: '2-3 days' },
  { area: 'Upcountry', boda: '—', courier: 'From KES 600', pickup: '—', time: '3-5 days' },
];

export default function DeliveryInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Delivery Info</span>
      </nav>

      <h1 className="heading-1 mb-4">Delivery Information</h1>
      <p className="text-body text-lg mb-10">Fast, reliable delivery across Kenya</p>

      {/* Delivery Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl border p-6 text-center">
          <Truck size={32} className="mx-auto text-[var(--color-primary)] mb-3" />
          <h3 className="font-bold text-lg mb-1">Uber Boda</h3>
          <p className="text-sm text-gray-500">Fastest option. Delivered to your door within hours in Nairobi.</p>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center">
          <Clock size={32} className="mx-auto text-[var(--color-primary)] mb-3" />
          <h3 className="font-bold text-lg mb-1">Courier</h3>
          <p className="text-sm text-gray-500">Reliable delivery anywhere in Kenya. 1-5 days depending on location.</p>
        </div>
        <div className="bg-white rounded-2xl border p-6 text-center">
          <MapPin size={32} className="mx-auto text-[var(--color-primary)] mb-3" />
          <h3 className="font-bold text-lg mb-1">Pickup</h3>
          <p className="text-sm text-gray-500">Collect from our Nairobi location at no extra cost.</p>
        </div>
      </div>

      {/* Pricing Table */}
      <h2 className="heading-2 mb-6">Delivery Zones &amp; Pricing</h2>
      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm bg-white rounded-2xl border overflow-hidden">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-5 py-3 font-semibold">Area</th>
              <th className="text-left px-5 py-3 font-semibold">Boda</th>
              <th className="text-left px-5 py-3 font-semibold">Courier</th>
              <th className="text-left px-5 py-3 font-semibold">Pickup</th>
              <th className="text-left px-5 py-3 font-semibold">Estimated Time</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone, i) => (
              <tr key={zone.area} className={i < zones.length - 1 ? 'border-b' : ''}>
                <td className="px-5 py-3 font-medium">{zone.area}</td>
                <td className="px-5 py-3 text-gray-600">{zone.boda}</td>
                <td className="px-5 py-3 text-gray-600">{zone.courier}</td>
                <td className="px-5 py-3 text-gray-600">{zone.pickup}</td>
                <td className="px-5 py-3 text-gray-500">{zone.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={24} className="text-[var(--color-primary)]" />
          <h2 className="heading-3">Payment Options</h2>
        </div>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">•</span> M-Pesa (via Paystack)</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">•</span> Debit / Credit Card (via Paystack)</li>
          <li className="flex items-start gap-2"><span className="text-[var(--color-primary)] font-bold">•</span> Cash on Delivery (Nairobi only)</li>
        </ul>
      </div>
    </div>
  );
}
