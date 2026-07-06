import { z } from 'zod';

export const cartItemSchema = z.object({
  variantId: z.string(),
  productId: z.string(),
  productName: z.string(),
  productSlug: z.string(),
  variantSize: z.string(),
  variantColor: z.string(),
  variantColorHex: z.string().optional(),
  image: z.string(),
  unitPrice: z.number(), // in cents
  costPrice: z.number().optional(),
  quantity: z.number().min(1).max(10),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
  county: z.string().min(2),
  area: z.string().min(2),
  address: z.string().min(5),
  deliveryType: z.enum(['boda', 'courier', 'pickup']),
  paymentMethod: z.enum(['paystack', 'cod']),
  notes: z.string().optional(),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;

export const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'blue' },
  { value: 'confirmed', label: 'Confirmed', color: 'purple' },
  { value: 'shipped', label: 'Shipped', color: 'indigo' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'returned', label: 'Returned', color: 'orange' },
] as const;

export const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'orange' },
] as const;

export const CATEGORIES = [
  'running',
  'lifestyle',
  'basketball',
  'football',
  'training',
  'outdoor',
  'kids',
] as const;

export const BRANDS = [
  'Nike',
  'Adidas',
  'Puma',
  'New Balance',
  'Asics',
  'Reebok',
  'Under Armour',
  'Skechers',
  'Vans',
  'Converse',
  'Jordan',
  'Other',
] as const;

export const SIZES_EU = Array.from({ length: 18 }, (_, i) => (36 + i * 0.5).toString().replace('.0', ''));
export const SIZES_US = Array.from({ length: 16 }, (_, i) => (i + 4).toString());
export const SIZES_UK = Array.from({ length: 16 }, (_, i) => (i + 3).toString());