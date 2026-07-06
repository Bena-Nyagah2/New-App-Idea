'use client';

import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { CartDrawer } from './cart-drawer';
import Link from 'next/link';

export function Header() {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  
  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Shoe Store Home">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <span className="text-xl font-bold text-gray-900">Shoe Store</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shoes" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Shop</Link>
            <Link href="/shoes?category=running" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Running</Link>
            <Link href="/shoes?category=lifestyle" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Lifestyle</Link>
            <Link href="/shoes?category=basketball" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Basketball</Link>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/shoes" className="hidden sm:block text-gray-700 hover:text-primary-600 font-medium">Shop All</Link>
            
            {/* Cart Button */}
            <button
              onClick={() => useCartStore.getState().toggleCart()}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={`Cart, ${totalItems} items`}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around text-sm">
          <Link href="/" className="text-gray-700 hover:text-primary-600">Home</Link>
          <Link href="/shoes" className="text-gray-700 hover:text-primary-600">Shop</Link>
          <Link href="/cart" className="text-gray-700 hover:text-primary-600">Cart</Link>
        </div>
      </div>
      
      <CartDrawer />
    </header>
  );
}