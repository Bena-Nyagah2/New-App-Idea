'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Truck, Palette, Store, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/admin/payouts', label: 'Payouts', icon: LayoutDashboard },
  { href: '/admin/theme', label: 'Theme', icon: Palette },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 font-bold text-[var(--color-text)] font-mono text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
              <span className="text-[var(--color-border)]">/</span>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/30'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="admin-nav-indicator"
                        className="absolute -bottom-[13px] left-3 right-3 h-0.5 bg-primary-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface-elevated)]"
              >
                <Store size={15} />
                Store
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-secondary-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface-elevated)]"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </div>
    </div>
  );
}
