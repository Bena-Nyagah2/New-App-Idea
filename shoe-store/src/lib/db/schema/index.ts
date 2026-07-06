import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Products - Shoe models
export const products = sqliteTable('products', {
  id: text('id').primaryKey(), // slug: "nike-air-max-90"
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(), // running, lifestyle, basketball, etc.
  description: text('description'),
  basePrice: integer('base_price').notNull(), // in cents (KES)
  images: text('images').notNull(), // JSON array of Cloudinary URLs
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()).notNull(),
}, (table) => ({
  brandIdx: index('products_brand_idx').on(table.brand),
  categoryIdx: index('products_category_idx').on(table.category),
  activeIdx: index('products_active_idx').on(table.isActive),
}));

// Variants - Size/Color combinations with stock
export const variants = sqliteTable('variants', {
  id: text('id').primaryKey(), // "nike-air-max-90-10-black"
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  size: text('size').notNull(), // "10", "10.5", "EU44"
  color: text('color').notNull(),
  colorHex: text('color_hex'), // "#000000"
  sku: text('sku').unique().notNull(), // Internal SKU
  stock: integer('stock').default(0).notNull(),
  costPrice: integer('cost_price'), // What you paid (cents)
  barcode: text('barcode'), // Optional barcode
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()).notNull(),
}, (table) => ({
  productIdx: index('variants_product_idx').on(table.productId),
  skuIdx: index('variants_sku_idx').on(table.sku),
}));

// Suppliers - Where you source shoes
export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  phone: text('phone'),
  email: text('email'),
  location: text('location'), // Area in Nairobi
  paymentTerms: text('payment_terms'), // cash, mpesa, bank, credit days
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
});

// Supplier-Product mapping with cost prices
export const supplierProducts = sqliteTable('supplier_products', {
  id: text('id').primaryKey(),
  supplierId: text('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: text('variant_id').references(() => variants.id, { onDelete: 'cascade' }),
  costPrice: integer('cost_price').notNull(), // Supplier price per unit
  minOrderQty: integer('min_order_qty').default(1),
  leadTimeDays: integer('lead_time_days').default(0),
  isPreferred: integer('is_preferred', { mode: 'boolean' }).default(false),
});

// Orders
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(), // Paystack reference or UUID
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  shippingAddress: text('shipping_address'), // JSON
  county: text('county'), // Nairobi, Mombasa, etc.
  deliveryType: text('delivery_type').notNull(), // 'boda' | 'courier' | 'pickup'
  deliveryFee: integer('delivery_fee').default(0).notNull(),
  status: text('status', { enum: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'] }).default('pending').notNull(),
  paymentMethod: text('payment_method', { enum: ['paystack', 'cod', 'mpesa'] }).notNull(),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending').notNull(),
  paystackReference: text('paystack_reference').unique(),
  subtotal: integer('subtotal').notNull(), // in cents
  tax: integer('tax').default(0).notNull(),
  total: integer('total').notNull(),
  notes: text('notes'), // Customer notes
  adminNotes: text('admin_notes'), // Internal notes
  confirmedAt: integer('confirmed_at', { mode: 'timestamp' }),
  shippedAt: integer('shipped_at', { mode: 'timestamp' }),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(new Date()).notNull(),
}, (table) => ({
  emailIdx: index('orders_email_idx').on(table.customerEmail),
  statusIdx: index('orders_status_idx').on(table.status),
  paystackRefIdx: index('orders_paystack_ref_idx').on(table.paystackReference),
  createdIdx: index('orders_created_idx').on(table.createdAt),
}));

// Order Items
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  variantId: text('variant_id').references(() => variants.id).notNull(),
  productName: text('product_name').notNull(), // Snapshot
  variantSize: text('variant_size').notNull(),
  variantColor: text('variant_color').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(), // Price at time of order (cents)
  totalPrice: integer('total_price').notNull(),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
  variantIdx: index('order_items_variant_idx').on(table.variantId),
}));

// Payouts to suppliers
export const payouts = sqliteTable('payouts', {
  id: text('id').primaryKey(),
  supplierId: text('supplier_id').references(() => suppliers.id).notNull(),
  amount: integer('amount').notNull(), // in cents
  status: text('status', { enum: ['pending', 'paid', 'failed'] }).default('pending').notNull(),
  method: text('method', { enum: ['mpesa', 'bank', 'cash'] }),
  reference: text('reference'), // M-Pesa transaction ID
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()).notNull(),
});

// Payout items - which orders/suppliers this payout covers
export const payoutItems = sqliteTable('payout_items', {
  id: text('id').primaryKey(),
  payoutId: text('payout_id').references(() => payouts.id, { onDelete: 'cascade' }).notNull(),
  orderId: text('order_id').references(() => orders.id).notNull(),
  supplierId: text('supplier_id').references(() => suppliers.id).notNull(),
  amount: integer('amount').notNull(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
  supplierProducts: many(supplierProducts),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, { fields: [variants.productId], references: [products.id] }),
  supplierProducts: many(supplierProducts),
  orderItems: many(orderItems),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  supplierProducts: many(supplierProducts),
  payouts: many(payouts),
}));

export const supplierProductsRelations = relations(supplierProducts, ({ one }) => ({
  supplier: one(suppliers, { fields: [supplierProducts.supplierId], references: [suppliers.id] }),
  product: one(products, { fields: [supplierProducts.productId], references: [products.id] }),
  variant: one(variants, { fields: [supplierProducts.variantId], references: [variants.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payoutItems: many(payoutItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(variants, { fields: [orderItems.variantId], references: [variants.id] }),
}));

export const payoutsRelations = relations(payouts, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [payouts.supplierId], references: [suppliers.id] }),
  items: many(payoutItems),
}));

export const payoutItemsRelations = relations(payoutItems, ({ one }) => ({
  payout: one(payouts, { fields: [payoutItems.payoutId], references: [payouts.id] }),
  order: one(orders, { fields: [payoutItems.orderId], references: [orders.id] }),
  supplier: one(suppliers, { fields: [payoutItems.supplierId], references: [suppliers.id] }),
}));

// Types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Variant = typeof variants.$inferSelect;
export type NewVariant = typeof variants.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payout = typeof payouts.$inferSelect;