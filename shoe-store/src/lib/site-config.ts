export const siteConfig = {
  name: 'Nurwins Store',
  tagline: 'Style is confidence',
  email: 'winnans254@gmail.com',
  whatsapp: '254769013517',
  phone: '254741386797',
  address: 'Nairobi CBD, Kenya',
  instagram: 'https://instagram.com/Nurwins_store254',
  tiktok: 'https://tiktok.com/@Nurwins_store254',
  aboutText: 'Your trusted destination for quality sneakers, footwear, and urban fashion',
  returnDays: 4,
  returnPolicyType: 'exchange-only' as const,
  freeDeliveryArea: 'Nairobi CBD',
  disclaimer:
    'We are independently under our own business name. We do not claim ownership, partnership, or affiliation with any brand shown on this page. Brand names, logos, and images are used solely for reference and product description. All intellectual property rights belong to their respective owners.',
  currency: {
    default: 'KES' as const,
    options: ['KES', 'USD'] as const,
    exchangeRate: 130,
  },
};

export type SiteConfig = typeof siteConfig;
