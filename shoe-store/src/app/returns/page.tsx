import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Exchanges - Shoe Store',
  description: 'Learn about our return and exchange policy for shoes purchased at Shoe Store.',
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Returns &amp; Exchanges</span>
      </nav>

      <h1 className="heading-1 mb-4">Returns &amp; Exchanges</h1>
      <p className="text-body text-lg mb-10">Not the right fit? No worries — we make returns easy.</p>

      {/* Policy Overview */}
      <div className="bg-white rounded-2xl border p-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw size={28} className="text-[var(--color-primary)]" />
          <h2 className="heading-3">Our Promise</h2>
        </div>
        <p className="text-gray-600 leading-relaxed mb-6">
          We want you to love your new shoes. If they don&apos;t fit perfectly or meet your expectations,
          you can return or exchange them within <strong>7 days</strong> of delivery — no questions asked.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Free Exchanges (Nairobi)</h4>
              <p className="text-sm text-gray-500">We&apos;ll pick up the old pair and deliver the new one at no extra cost.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Full Refund</h4>
              <p className="text-sm text-gray-500">Prefer your money back? We&apos;ll refund via the original payment method.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-white rounded-2xl border p-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle size={28} className="text-orange-500" />
          <h2 className="heading-3">Conditions</h2>
        </div>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">1.</span>
            <span>Items must be returned within <strong>7 days</strong> of delivery date.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">2.</span>
            <span>Shoes must be <strong>unworn</strong> and in their original packaging with tags attached.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">3.</span>
            <span>Sale items are eligible for <strong>exchange only</strong> (no refund on discounted items).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">4.</span>
            <span>For upcountry orders, the customer covers return shipping costs.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">5.</span>
            <span>Contact us via WhatsApp or email to initiate a return.</span>
          </li>
        </ul>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border p-8">
        <h2 className="heading-3 mb-6">How to Start a Return</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Contact Us', desc: 'Send a WhatsApp message or email with your order ID and reason for return.' },
            { step: '2', title: 'Pack & Prepare', desc: 'Pack the shoes in their original box with all tags attached.' },
            { step: '3', title: 'Pickup or Drop-off', desc: 'We\'ll arrange a pickup (Nairobi) or provide our drop-off address.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-bold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
