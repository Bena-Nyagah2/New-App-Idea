import { siteConfig } from './site-config';

const CBD_AREAS = [
  'CBD',
  'upper hill',
  'kilimani',
  'westlands',
  'kileleshwa',
  'lavington',
  'cbd',
  'central',
];

/**
 * Checks if an area falls within Nairobi CBD
 */
export function isCbdArea(area: string): boolean {
  const normalized = area.toLowerCase().replace(/\s+/g, '');
  return CBD_AREAS.some(cbd => normalized.includes(cbd));
}

/**
 * Calculates delivery fee based on:
 * - Nairobi CBD: FREE
 * - Nairobi outside CBD: KES 200
 * - Kenya (countrywide): KES 400
 * - Worldwide: KES 1,000+
 */
export function calculateDeliveryFee(county: string, area: string): number {
  const countyNorm = county.toLowerCase().replace(/\s+/g, '');
  const areaNorm = area.toLowerCase().replace(/\s+/g, '');

  // Nairobi CBD
  if (countyNorm === 'nairobi' && (areaNorm === '' || isCbdArea(areaNorm))) {
    return 0;
  }

  // Nairobi outside CBD
  if (countyNorm === 'nairobi') {
    return 20000; // KES 200
  }

  // Kenya (countrywide)
  if (countyNorm === 'kiambu' || countyNorm === 'thika' || countyNorm === 'machakos' || countyNorm === 'kajiado') {
    return 35000; // KES 350
  }

  // Rest of world or upcountry
  return 50000; // Default KES 500
}

/**
 * Gets user-friendly label for delivery zone
 */
export function getDeliveryLabel(county: string, area: string): string {
  const countyNorm = county.toLowerCase().replace(/\s+/g, '');
  
  if (countyNorm === 'nairobi' && isCbdArea(area)) {
    return 'Free – Nairobi CBD';
  }
  
  if (countyNorm === 'nairobi') {
    return 'KES 200 – Nairobi outside CBD';
  }
  
  const kenyanCounties = ['kiambu', 'thika', 'machakos', 'kajiado'];
  if (kenyanCounties.includes(countyNorm)) {
    return 'KES 350 – Kenya (countrywide)';
  }
  
  return 'KES 500+ – Worldwide';
}