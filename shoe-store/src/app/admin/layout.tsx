'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/suppliers', label: 'Suppliers' },
  { href: '/admin/payouts', label: 'Payouts' },
  { href: '/admin/theme', label: 'Theme' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-bold text-gray-900 font-mono text-sm">
                Admin
              </Link>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-sm font-medium transition-colors ${
                      isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="admin-nav-indicator"
                        className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary-600"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                ← Store
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-sm text-gray-400 hover:text-red-600 transition-colors">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </div>
    </div>
  );
}
