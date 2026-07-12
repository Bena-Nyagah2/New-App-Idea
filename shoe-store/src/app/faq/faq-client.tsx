'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqSections = [
  {
    title: 'Shopping & Sizing',
    items: [
      {
        q: 'How do I find my correct shoe size?',
        a: 'We recommend measuring your foot length in centimeters and checking the EU size chart on each product page. If you\'re between sizes, we generally recommend going half a size up.',
      },
      {
        q: 'Are the shoes authentic?',
        a: 'Yes! We source directly from authorized distributors and verified suppliers. Every pair is 100% genuine.',
      },
      {
        q: 'Can I try shoes on before buying?',
        a: 'Absolutely! Visit our Nairobi pickup location, or order with Cash on Delivery and inspect the shoes before paying.',
      },
    ],
  },
  {
    title: 'Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Same-day delivery in Nairobi (order before 4 PM). Upcountry orders arrive in 2-5 business days depending on your location.',
      },
      {
        q: 'How much does delivery cost?',
        a: 'Boda delivery in Nairobi starts at KES 200. Courier delivery starts at KES 350 in Nairobi and varies by location upcountry. Pickup is always free.',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! You\'ll receive a WhatsApp message with tracking details once your order is dispatched.',
      },
    ],
  },
  {
    title: 'Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'M-Pesa, debit/credit cards (via Paystack), and Cash on Delivery (Nairobi only).',
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Yes. We use Paystack, a PCI-compliant payment processor. Your card details are never stored on our servers.',
      },
      {
        q: 'What is Cash on Delivery?',
        a: 'You pay in cash when the rider delivers your shoes. Available for Nairobi orders only. Inspect your shoes before paying!',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      {
        q: 'Can I return or exchange my shoes?',
        a: 'Yes! You have 7 days from delivery to return or exchange. Shoes must be unworn and in original packaging.',
      },
      {
        q: 'How do I start a return?',
        a: 'Send us a WhatsApp message or email with your order ID. We\'ll arrange a pickup (Nairobi) or guide you on the drop-off process.',
      },
      {
        q: 'When will I get my refund?',
        a: 'Refunds are processed within 3-5 business days via the original payment method.',
      },
    ],
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed pb-4">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqClient() {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="heading-1">Frequently Asked Questions</h1>
      </div>
      <p className="text-body text-lg mb-10">Everything you need to know about shopping with us.</p>

      <div className="space-y-10">
        {faqSections.map(section => (
          <div key={section.title}>
            <h2 className="heading-3 mb-4">{section.title}</h2>
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-6">
              {section.items.map(item => (
                <FaqItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8">
        <p className="text-[var(--color-text-muted)] mb-4">Still have questions?</p>
        <a
          href="https://wa.me/254700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Chat on WhatsApp
        </a>
      </div>
    </>
  );
}
