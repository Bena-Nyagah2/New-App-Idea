export interface BrandConfig {
  name: string;
  logo: string;
  color: string;
}

export const brandLogos: Record<string, BrandConfig> = {
  Nike: {
    name: 'Nike',
    logo: '/brands/nike.svg',
    color: '#111827',
  },
  Adidas: {
    name: 'Adidas',
    logo: '/brands/adidas.svg',
    color: '#000000',
  },
  Jordan: {
    name: 'Jordan',
    logo: '/brands/jordan.svg',
    color: '#c41e3a',
  },
  'New Balance': {
    name: 'New Balance',
    logo: '/brands/new-balance.svg',
    color: '#c1272d',
  },
  Puma: {
    name: 'Puma',
    logo: '/brands/puma.svg',
    color: '#000000',
  },
  Vans: {
    name: 'Vans',
    logo: '/brands/vans.svg',
    color: '#1a1a1a',
  },
  Converse: {
    name: 'Converse',
    logo: '/brands/converse.svg',
    color: '#000000',
  },
  Skechers: {
    name: 'Skechers',
    logo: '/brands/skechers.svg',
    color: '#2d2d2d',
  },
  Asics: {
    name: 'Asics',
    logo: '/brands/asics.svg',
    color: '#003da5',
  },
  Reebok: {
    name: 'Reebok',
    logo: '/brands/reebok.svg',
    color: '#c41e3a',
  },
  'Under Armour': {
    name: 'Under Armour',
    logo: '/brands/under-armour.svg',
    color: '#1d1d1d',
  },
};

export function getBrandLogo(brand: string): BrandConfig | null {
  return brandLogos[brand] || null;
}
