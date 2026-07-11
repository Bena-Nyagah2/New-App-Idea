'use client';

import { motion, type Variants } from 'framer-motion';
import { Zap, ShieldCheck, BadgeCheck, Banknote } from 'lucide-react';

const indicators = [
  {
    icon: Zap,
    label: 'Fast Nairobi Delivery',
    description: 'Same/next day via Uber Boda',
  },
  {
    icon: ShieldCheck,
    label: 'Secure Payments',
    description: 'Paystack & M-Pesa',
  },
  {
    icon: BadgeCheck,
    label: 'Quality Guaranteed',
    description: '100% authentic shoes',
  },
  {
    icon: Banknote,
    label: 'Cash on Delivery',
    description: 'Pay when it arrives',
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function TrustIndicators() {
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {indicators.map((item) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-primary-50/50 transition-colors"
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <item.icon size={22} className="text-primary-600" />
              </motion.div>
              <div>
                <p className="font-semibold text-gray-900 text-sm font-[var(--font-heading)]">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
