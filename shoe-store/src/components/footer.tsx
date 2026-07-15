'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '@/components/icons/social-icons';
import { MapPin, Phone, Mail, ArrowUpRight, Footprints, CircleDot, Sofa, Volleyball, HelpCircle, MessageCircle, TruckIcon, RotateCcw } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const socialLinks = [
  {
    icon: WhatsAppIcon,
    href: `https://wa.me/${siteConfig.whatsapp}`,
    label: 'WhatsApp',
    hoverColor: 'hover:bg-green-500',
  },
  {
    icon: InstagramIcon,
    href: siteConfig.instagram,
    label: 'Instagram',
    hoverColor: 'hover:bg-pink-500',
  },
  {
    icon: TikTokIcon,
    href: siteConfig.tiktok,
    label: 'TikTok',
    hoverColor: 'hover:bg-black',
  },
];

const quickLinks = [
  { href: '/shoes', label: 'All Shoes', icon: Footprints },
  { href: '/shoes?category=running', label: 'Running', icon: CircleDot },
  { href: '/shoes?category=lifestyle', label: 'Lifestyle', icon: Sofa },
  { href: '/shoes?category=basketball', label: 'Basketball', icon: Volleyball },
];

const supportLinks = [
  { href: '/contact', label: 'Contact Us', icon: MessageCircle },
  { href: '/delivery-info', label: 'Delivery Info', icon: TruckIcon },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] text-[var(--color-text-muted)] mt-auto border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-[var(--color-text)] font-[var(--font-heading)] group-hover:text-primary-500 transition-colors">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              {siteConfig.aboutText}. {siteConfig.tagline}.
            </p>

            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl bg-[var(--color-surface-elevated)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-white ${social.hoverColor} transition-all duration-200`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-text)] mb-4 font-[var(--font-heading)]">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-primary-500 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <Icon size={14} className="text-[var(--color-text-muted)] group-hover:text-primary-500 transition-colors" />
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-text)] mb-4 font-[var(--font-heading)]">Support</h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-primary-500 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <Icon size={14} className="text-[var(--color-text-muted)] group-hover:text-primary-500 transition-colors" />
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--color-text)] mb-4 font-[var(--font-heading)]">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary-500 flex-shrink-0" />
                <a href={`tel:+${siteConfig.phone}`} className="hover:text-primary-500 transition-colors">
                  +{siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary-500 flex-shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-primary-500 transition-colors">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-4">
          <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text)]">Disclaimer:</strong> {siteConfig.disclaimer}
          </p>
        </div>

        <div className="border-t border-[var(--color-border)] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-secondary-500"
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
