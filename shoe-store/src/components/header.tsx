'use client';

import { useCartStore } from '@/lib/cart-store';
import { CartDrawer } from './cart-drawer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/shoes', label: 'Shop' },
  { href: '/shoes?category=running', label: 'Running' },
  { href: '/shoes?category=lifestyle', label: 'Lifestyle' },
  { href: '/shoes?category=basketball', label: 'Basketball' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative group py-1 text-[var(--color-text)] hover:text-primary-600 font-semibold transition-colors"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 rounded-full group-hover:w-full transition-all duration-300 ease-out" />
    </Link>
  );
}

export function Header() {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-lg border-b border-[var(--color-border)] shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Shoe Store Home">
            <motion.span
              className="text-primary-600"
              whileHover={{ rotate: -10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <ShoppingBag size={28} />
            </motion.span>
            <span className="text-xl font-bold text-[var(--color-text)] font-[var(--font-heading)]">
              Shoe Store
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shoes"
              className="hidden sm:block text-[var(--color-text)] hover:text-primary-600 font-semibold transition-colors"
            >
              Shop All
            </Link>

            <ThemeToggle />

            <motion.button
              onClick={() => useCartStore.getState().toggleCart()}
              className="relative p-2.5 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors"
              aria-label={`Cart, ${totalItems} items`}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart size={22} className="text-[var(--color-text)]" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-0.5 -right-0.5 bg-secondary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              className="md:hidden p-2 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} className="text-[var(--color-text)]" /> : <Menu size={22} className="text-[var(--color-text)]" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2 text-[var(--color-text)] hover:text-primary-600 font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </header>
  );
}
