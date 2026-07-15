import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Returns & Exchanges - ${siteConfig.name}`,
  description: `Learn about our return and exchange policy for items purchased at ${siteConfig.name}.`,
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <nav className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)] font-medium">Returns & Exchanges</span>
      </nav>

      <h1 className="heading-1 mb-4">Returns & Exchanges</h1>
      <p className="text-body text-lg mb-10">Not the right fit? You have {siteConfig.returnDays} days to exchange — no refunds, just swaps.</p>

      {/* Disclaimer */}
      <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-5 mb-10">
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400 mb-1">Disclaimer</p>
            <p className="text-sm text-orange-600 dark:text-orange-400/90 leading-relaxed">
              {siteConfig.disclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Policy Overview */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw size={28} className="text-[var(--color-primary)]" />
          <h2 className="heading-3">Our Promise</h2>
        </div>
        <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
          We want you to love your new shoes. If they don&apos;t fit perfectly, you can exchange them
          within <strong className="text-[var(--color-text)]">{siteConfig.returnDays} days</strong> of delivery.
          Please note: we offer <strong className="text-[var(--color-text)]">exchanges only</strong> — no cash refunds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[var(--color-text)]">Exchange Within {siteConfig.returnDays} Days</h4>
              <p className="text-sm text-[var(--color-text-muted)]">Swap for another shoe of equal or higher value within {siteConfig.returnDays} days of delivery.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-[var(--color-text)]">Free Exchanges in {siteConfig.freeDeliveryArea}</h4>
              <p className="text-sm text-[var(--color-text-muted)]">We&apos;ll arrange pickup and redelivery within {siteConfig.freeDeliveryArea} at no extra cost.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle size={28} className="text-orange-500" />
          <h2 className="heading-3">Conditions</h2>
        </div>
        <ul className="space-y-3 text-[var(--color-text-muted)]">
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">1.</span>
            <span>Items must be exchanged within <strong className="text-[var(--color-text)]">{siteConfig.returnDays} days</strong> of delivery date.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">2.</span>
            <span>Shoes must be <strong className="text-[var(--color-text)]">unworn</strong> and in their original packaging with tags attached.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">3.</span>
            <span><strong className="text-[var(--color-text)]">No refunds</strong> — exchanges only. You can swap for another shoe of equal or higher value (price difference applies).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">4.</span>
            <span>For upcountry and worldwide orders, the customer covers return shipping costs.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[var(--color-primary)] font-bold mt-1">5.</span>
            <span>Contact us via WhatsApp or email to initiate an exchange.</span>
          </li>
        </ul>
      </div>

      {/* How it works */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8">
        <h2 className="heading-3 mb-6">How to Start an Exchange</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Contact Us', desc: `Send a WhatsApp message to +${siteConfig.whatsapp} or email ${siteConfig.email} with your order ID.` },
            { step: '2', title: 'Pack & Prepare', desc: 'Pack the shoes in their original box with all tags attached.' },
            { step: '3', title: 'Pickup or Drop-off', desc: `We'll arrange a pickup (${siteConfig.freeDeliveryArea}) or provide our drop-off address.` },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-bold mb-1 text-[var(--color-text)]">{item.title}</h4>
              <p className="text-sm text-[var(--color-text-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
