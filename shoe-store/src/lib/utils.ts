import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | null | undefined, currency = 'KES'): string {
  const safe = typeof amount === 'number' && isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe / 100);
}

export function formatPriceCompact(amount: number, currency = 'KES'): string {
  const formatted = formatPrice(amount, currency);
  return formatted.replace(/\s/g, '');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSKU(productSlug: string, size: string, color: string): string {
  const sizeClean = size.replace(/\./g, '').replace('/', '-');
  const colorClean = slugify(color);
  return `${productSlug}-${sizeClean}-${colorClean}`.toUpperCase();
}

export function calculateDeliveryFee(county: string, subtotal: number): number {
  const FREE_DELIVERY_THRESHOLD = 700000; // KES 7,000 in cents
  
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  
  const fees: Record<string, number> = {
    nairobi: 20000,      // KES 200
    mombasa: 45000,      // KES 450
    kisumu: 45000,
    nakuru: 40000,
    eldoret: 40000,
    thika: 30000,
    kiambu: 30000,
    machakos: 35000,
    kajiado: 35000,
  };
  
  const normalized = county.toLowerCase().replace(/\s+/g, '');
  return fees[normalized] || 40000; // Default KES 400
}

export function getDeliveryZones() {
  return {
    nairobi_cbd: { 
      areas: ['CBD', 'Upper Hill', 'Kilimani', 'Westlands', 'Kileleshwa', 'Lavington'], 
      baseFee: 20000, codFee: 5000, days: 'same-day' 
    },
    westlands: { 
      areas: ['Westlands', 'Parklands', 'Kitisuru', 'Spring Valley'], 
      baseFee: 25000, codFee: 5000, days: 'same-day' 
    },
    karen: { 
      areas: ['Karen', 'Langata', 'Ngong Road', 'Rongai'], 
      baseFee: 30000, codFee: 10000, days: 'next-day' 
    },
    eastlands: { 
      areas: ['Embakasi', 'Donholm', 'Utawala', 'Syokimau', 'Airport'], 
      baseFee: 30000, codFee: 10000, days: 'next-day' 
    },
    thika_road: { 
      areas: ['Kasarani', 'Roysambu', 'Garden Estate', 'Thika Road'], 
      baseFee: 30000, codFee: 10000, days: 'next-day' 
    },
    outer: { 
      areas: ['Ruiru', 'Juja', 'Kiambu', 'Limuru', 'Ngong Town'], 
      baseFee: 40000, codFee: 15000, days: '2-days' 
    },
  };
}

export function getZoneForArea(area: string) {
  const zones = getDeliveryZones();
  for (const [key, zone] of Object.entries(zones)) {
    if (zone.areas.some(a => a.toLowerCase().includes(area.toLowerCase()))) {
      return { zoneKey: key, ...zone };
    }
  }
  return { zoneKey: 'outer', ...zones.outer };
}

export function parseJsonSafe<T>(json: unknown, fallback: T): T {
  if (typeof json !== 'string') return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}