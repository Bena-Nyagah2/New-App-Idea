import { db, client } from '@/lib/db';
import { products, variants, suppliers } from '@/lib/db/schema';
import { slugify, generateSKU } from '@/lib/utils';

const SEED_PRODUCTS = [
  {
    name: 'Air Max 90',
    brand: 'Nike',
    category: 'lifestyle',
    description: 'Classic Nike Air Max 90 sneakers with visible Air cushioning. Perfect for everyday wear.',
    basePrice: 350000, // KES 3,500
    onSale: true,
    salePrice: 280000, // KES 2,800
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=800&fit=crop',
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
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
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
    onSale: true,
    salePrice: 420000, // KES 4,200
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&h=800&fit=crop',
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
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&h=800&fit=crop',
    ],
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
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=800&fit=crop',
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
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&h=800&fit=crop',
    ],
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
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    ],
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
      'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1470468969717-61d5d54fd036?w=800&h=800&fit=crop',
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
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&h=800&fit=crop',
    ],
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
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&q=80',
    ],
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

  // Clear existing data for a clean seed
  console.log('🗑️  Clearing existing data...');
  await client.execute('DELETE FROM order_items');
  await client.execute('DELETE FROM orders');
  await client.execute('DELETE FROM payout_items');
  await client.execute('DELETE FROM payouts');
  await client.execute('DELETE FROM supplier_products');
  await client.execute('DELETE FROM variants');
  await client.execute('DELETE FROM products');
  await client.execute('DELETE FROM suppliers');

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