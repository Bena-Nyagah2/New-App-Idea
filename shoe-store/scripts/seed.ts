import { db } from '@/lib/db';
import { products, variants, suppliers } from '@/lib/db/schema';
import { slugify, generateSKU } from '@/lib/utils';

const SEED_PRODUCTS = [
  {
    name: 'Air Max 90',
    brand: 'Nike',
    category: 'lifestyle',
    description: 'Classic Nike Air Max 90 sneakers with visible Air cushioning. Perfect for everyday wear.',
    basePrice: 350000, // KES 3,500
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1/samples/sheep',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/breakfast',
    ],
    variants: [
      { size: '40', color: 'Black', stock: 3, costPrice: 300000 },
      { size: '41', color: 'Black', stock: 2, costPrice: 300000 },
      { size: '42', color: 'Black', stock: 4, costPrice: 300000 },
      { size: '43', color: 'Black', stock: 1, costPrice: 300000 },
      { size: '40', color: 'White', stock: 2, costPrice: 300000 },
      { size: '41', color: 'White', stock: 3, costPrice: 300000 },
      { size: '42', color: 'White', stock: 1, costPrice: 300000 },
    ],
  },
  {
    name: 'Ultraboost 23',
    brand: 'Adidas',
    category: 'running',
    description: 'Adidas Ultraboost 23 running shoes with responsive Boost cushioning.',
    basePrice: 450000, // KES 4,500
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1/samples/beach',
    ],
    variants: [
      { size: '40', color: 'Core Black', stock: 2, costPrice: 380000 },
      { size: '41', color: 'Core Black', stock: 3, costPrice: 380000 },
      { size: '42', color: 'Core Black', stock: 2, costPrice: 380000 },
      { size: '43', color: 'Core Black', stock: 1, costPrice: 380000 },
      { size: '44', color: 'Core Black', stock: 2, costPrice: 380000 },
    ],
  },
  {
    name: 'Air Jordan 1 Mid',
    brand: 'Jordan',
    category: 'basketball',
    description: 'Air Jordan 1 Mid basketball shoes. Iconic style with modern comfort.',
    basePrice: 520000,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1/samples/balloons',
    ],
    variants: [
      { size: '41', color: 'Red/Black', stock: 1, costPrice: 450000 },
      { size: '42', color: 'Red/Black', stock: 2, costPrice: 450000 },
      { size: '43', color: 'Red/Black', stock: 1, costPrice: 450000 },
      { size: '41', color: 'White/Grey', stock: 2, costPrice: 450000 },
      { size: '42', color: 'White/Grey', stock: 3, costPrice: 450000 },
      { size: '44', color: 'White/Grey', stock: 1, costPrice: 450000 },
    ],
  },
  {
    name: 'New Balance 574',
    brand: 'New Balance',
    category: 'lifestyle',
    description: 'New Balance 574 classic. Timeless design with premium suede & mesh.',
    basePrice: 320000,
    images: [],
    variants: [
      { size: '40', color: 'Grey', stock: 3, costPrice: 260000 },
      { size: '41', color: 'Grey', stock: 4, costPrice: 260000 },
      { size: '42', color: 'Grey', stock: 2, costPrice: 260000 },
      { size: '43', color: 'Grey', stock: 3, costPrice: 260000 },
      { size: '40', color: 'Navy', stock: 2, costPrice: 260000 },
      { size: '42', color: 'Navy', stock: 1, costPrice: 260000 },
    ],
  },
  {
    name: 'Puma Suede Classic',
    brand: 'Puma',
    category: 'lifestyle',
    description: 'Puma Suede Classic sneakers. Retro style since 1968.',
    basePrice: 250000,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1/samples/deer',
    ],
    variants: [
      { size: '39', color: 'Black', stock: 2, costPrice: 200000 },
      { size: '40', color: 'Black', stock: 4, costPrice: 200000 },
      { size: '41', color: 'Black', stock: 3, costPrice: 200000 },
      { size: '42', color: 'Black', stock: 2, costPrice: 200000 },
      { size: '40', color: 'Red', stock: 1, costPrice: 200000 },
      { size: '41', color: 'Red', stock: 2, costPrice: 200000 },
    ],
  },
  {
    name: 'Nike Revolution 6',
    brand: 'Nike',
    category: 'running',
    description: 'Nike Revolution 6 running shoes. Breathable mesh, cushioned comfort.',
    basePrice: 280000,
    images: [],
    variants: [
      { size: '41', color: 'Grey', stock: 3, costPrice: 220000 },
      { size: '42', color: 'Grey', stock: 5, costPrice: 220000 },
      { size: '43', color: 'Grey', stock: 2, costPrice: 220000 },
      { size: '44', color: 'Grey', stock: 3, costPrice: 220000 },
    ],
  },
  {
    name: 'Vans Old Skool',
    brand: 'Vans',
    category: 'lifestyle',
    description: 'Vans Old Skool classic skate shoes. Iconic side stripe design.',
    basePrice: 220000,
    images: [],
    variants: [
      { size: '39', color: 'Black/White', stock: 4, costPrice: 180000 },
      { size: '40', color: 'Black/White', stock: 5, costPrice: 180000 },
      { size: '41', color: 'Black/White', stock: 3, costPrice: 180000 },
      { size: '42', color: 'Black/White', stock: 4, costPrice: 180000 },
      { size: '43', color: 'Black/White', stock: 2, costPrice: 180000 },
    ],
  },
  {
    name: 'Converse Chuck Taylor',
    brand: 'Converse',
    category: 'lifestyle',
    description: 'Converse Chuck Taylor All Star high tops. Timeless canvas sneakers.',
    basePrice: 200000,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1/samples/buildings',
    ],
    variants: [
      { size: '39', color: 'White', stock: 3, costPrice: 160000 },
      { size: '40', color: 'White', stock: 4, costPrice: 160000 },
      { size: '41', color: 'White', stock: 2, costPrice: 160000 },
      { size: '42', color: 'White', stock: 3, costPrice: 160000 },
      { size: '40', color: 'Red', stock: 2, costPrice: 160000 },
      { size: '41', color: 'Red', stock: 1, costPrice: 160000 },
    ],
  },
  {
    name: 'Adidas Forum Low',
    brand: 'Adidas',
    category: 'lifestyle',
    description: 'Adidas Forum Low basketball-inspired sneakers. 80s design, modern comfort.',
    basePrice: 320000,
    images: [],
    variants: [
      { size: '41', color: 'White/Blue', stock: 2, costPrice: 270000 },
      { size: '42', color: 'White/Blue', stock: 3, costPrice: 270000 },
      { size: '43', color: 'White/Blue', stock: 2, costPrice: 270000 },
      { size: '41', color: 'Black', stock: 4, costPrice: 270000 },
      { size: '42', color: 'Black', stock: 1, costPrice: 270000 },
    ],
  },
  {
    name: 'Skechers Go Walk 6',
    brand: 'Skechers',
    category: 'training',
    description: 'Skechers Go Walk 6 walking shoes with Ultra Go cushioning.',
    basePrice: 240000,
    images: [],
    variants: [
      { size: '40', color: 'Grey', stock: 3, costPrice: 190000 },
      { size: '41', color: 'Grey', stock: 4, costPrice: 190000 },
      { size: '42', color: 'Grey', stock: 2, costPrice: 190000 },
      { size: '43', color: 'Grey', stock: 3, costPrice: 190000 },
      { size: '41', color: 'Black', stock: 2, costPrice: 190000 },
      { size: '42', color: 'Black', stock: 1, costPrice: 190000 },
    ],
  },
];

const SEED_SUPPLIERS = [
  {
    name: 'Nairobi Sneaker Source',
    contactName: 'Alex Mutua',
    phone: '+254712345678',
    email: 'alex@sneakersource.co.ke',
    location: 'CBD',
    paymentTerms: 'mpesa',
    notes: 'Good supplier for Nike and Adidas. Weekly payouts.',
  },
  {
    name: 'Footwear Africa',
    contactName: 'Jane Wanjiku',
    phone: '+254723456789',
    email: 'jane@footwearafrica.com',
    location: 'Westlands',
    paymentTerms: 'consignment',
    notes: 'Takes shoes on consignment - pay after sale. Good for variety.',
  },
  {
    name: 'Bata Distributor',
    contactName: 'Peter Ochieng',
    phone: '+254734567890',
    location: 'Industrial Area',
    paymentTerms: 'net_15',
    notes: 'Bulk supplier. Credit terms available.',
  },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Is database already seeded?
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log('⚠️  Products already exist. Skipping seed.');
    console.log('   Use pnpm db:push --force to reset, then seed again.');
    process.exit(0);
  }

  // Seed suppliers
  console.log('📦 Adding suppliers...');
  for (const supplier of SEED_SUPPLIERS) {
    const id = slugify(supplier.name);
    await db.insert(suppliers).values({
      id,
      name: supplier.name,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email || null,
      location: supplier.location,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes || null,
    });
    console.log(`  ✓ ${supplier.name}`);
  }

  console.log('\n👟 Adding shoes...');
  let totalVariants = 0;
  
  for (const product of SEED_PRODUCTS) {
    const slug = slugify(`${product.brand}-${product.name}`);
    
    // Create product
    await db.insert(products).values({
      id: slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      basePrice: product.basePrice,
      images: JSON.stringify(product.images),
    });

    // Create variants
    for (const variant of product.variants) {
      const variantId = slugify(`${slug}-${variant.size}-${variant.color}`);
      const sku = generateSKU(slug, variant.size, variant.color);

      await db.insert(variants).values({
        id: variantId,
        productId: slug,
        size: variant.size,
        color: variant.color,
        sku,
        stock: variant.stock,
        costPrice: variant.costPrice,
      });
      totalVariants++;
    }
    console.log(`  ✓ ${product.brand} ${product.name} (${product.variants.length} variants)`);
  }

  const productCount = SEED_PRODUCTS.length;
  console.log(`\n✅ Seed complete: ${productCount} products, ${totalVariants} variants, ${SEED_SUPPLIERS.length} suppliers`);
  console.log(`   Run \`pnpm dev\` to see the storefront.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error.message || error);
  process.exit(1);
});