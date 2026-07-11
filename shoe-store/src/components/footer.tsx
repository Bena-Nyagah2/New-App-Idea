'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from '@/components/icons/social-icons';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

const socialLinks = [
  {
    icon: WhatsAppIcon,
    href: 'https://wa.me/254700000000',
    label: 'WhatsApp',
    hoverColor: 'hover:bg-green-500',
  },
  {
    icon: InstagramIcon,
    href: 'https://instagram.com/shoestore',
    label: 'Instagram',
    hoverColor: 'hover:bg-pink-500',
  },
  {
    icon: FacebookIcon,
    href: 'https://facebook.com/shoestore',
    label: 'Facebook',
    hoverColor: 'hover:bg-blue-600',
  },
];

const quickLinks = [
  { href: '/shoes', label: 'All Shoes' },
  { href: '/shoes?category=running', label: 'Running' },
  { href: '/shoes?category=lifestyle', label: 'Lifestyle' },
  { href: '/shoes?category=basketball', label: 'Basketball' },
];

const supportLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/delivery-info', label: 'Delivery Info' },
  { href: '/returns', label: 'Returns' },
  { href: '/faq', label: 'FAQ' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-white font-[var(--font-heading)] group-hover:text-primary-400 transition-colors">
                Shoe Store
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Quality shoes at great prices. Nairobi&apos;s favorite shoe store.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white ${social.hoverColor} transition-all duration-200`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 font-[var(--font-heading)]">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4 font-[var(--font-heading)]">Support</h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 font-[var(--font-heading)]">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-gray-400">
                <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Phone size={16} className="text-primary-500 flex-shrink-0" />
                <a href="tel:+254700000000" className="hover:text-primary-400 transition-colors">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Mail size={16} className="text-primary-500 flex-shrink-0" />
                <a href="mailto:hello@shoestore.ke" className="hover:text-primary-400 transition-colors">
                  hello@shoestore.ke
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Shoe Store. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-secondary-600"
            >
              ❤️
            </motion.span>
            <span>in Nairobi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
