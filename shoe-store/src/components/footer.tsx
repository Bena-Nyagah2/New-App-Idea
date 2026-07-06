import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="text-xl font-bold text-white">Shoe Store</span>
            </Link>
            <p className="text-sm">Quality shoes at great prices. Nairobi&apos;s favorite shoe store.</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shoes" className="hover:text-primary-400 transition-colors">All Shoes</Link></li>
              <li><Link href="/shoes?category=running" className="hover:text-primary-400 transition-colors">Running</Link></li>
              <li><Link href="/shoes?category=lifestyle" className="hover:text-primary-400 transition-colors">Lifestyle</Link></li>
              <li><Link href="/shoes?category=basketball" className="hover:text-primary-400 transition-colors">Basketball</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Delivery Info</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Nairobi, Kenya</li>
              <li>📞 +254 7XX XXX XXX</li>
              <li>✉️ hello@shoestore.ke</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Shoe Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}