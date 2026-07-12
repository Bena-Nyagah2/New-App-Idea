import Link from 'next/link';
import { FaqClient } from './faq-client';

export const metadata = {
  title: 'FAQ - Shoe Store',
  description: 'Frequently asked questions about shopping, delivery, payments, and returns at Shoe Store Nairobi.',
};

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <nav className="mb-8 text-sm text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)] font-medium">FAQ</span>
      </nav>

      <FaqClient />
    </div>
  );
}
