import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-bold text-gray-900 font-mono text-sm">
                🛒 Admin
              </Link>
              <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Orders
              </Link>
              <Link href="/admin/inventory" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Inventory
              </Link>
              <Link href="/admin/suppliers" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Suppliers
              </Link>
              <Link href="/admin/payouts" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Payouts
              </Link>
              <Link href="/admin/theme" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Theme
              </Link>
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