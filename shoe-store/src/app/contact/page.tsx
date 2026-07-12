import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Shoe Store',
  description: 'Get in touch with Shoe Store Nairobi. WhatsApp, call, or email us for any inquiries.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <nav className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)] font-medium">Contact Us</span>
      </nav>

      <h1 className="heading-1 mb-4">Contact Us</h1>
      <p className="text-body text-lg mb-10">We&apos;d love to hear from you. Reach out anytime!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Cards */}
        <div className="space-y-4">
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle size={22} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">WhatsApp</h3>
              <p className="text-sm text-[var(--color-text-muted)]">+254 700 000 000</p>
            </div>
          </a>

          <a
            href="tel:+254700000000"
            className="flex items-center gap-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">Call Us</h3>
              <p className="text-sm text-[var(--color-text-muted)]">+254 700 000 000</p>
            </div>
          </a>

          <a
            href="mailto:hello@shoestore.ke"
            className="flex items-center gap-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">Email</h3>
              <p className="text-sm text-[var(--color-text-muted)]">hello@shoestore.ke</p>
            </div>
          </a>

          <div className="flex items-center gap-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
              <MapPin size={22} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text)]">Location</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6">
          <h2 className="heading-3 mb-5">Send a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input type="tel" className="input" placeholder="07XX XXX XXX" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input min-h-[120px]" placeholder="How can we help?" />
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
