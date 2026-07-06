DROP INDEX "order_items_order_idx";--> statement-breakpoint
DROP INDEX "order_items_variant_idx";--> statement-breakpoint
DROP INDEX "orders_paystack_reference_unique";--> statement-breakpoint
DROP INDEX "orders_email_idx";--> statement-breakpoint
DROP INDEX "orders_status_idx";--> statement-breakpoint
DROP INDEX "orders_paystack_ref_idx";--> statement-breakpoint
DROP INDEX "orders_created_idx";--> statement-breakpoint
DROP INDEX "products_brand_idx";--> statement-breakpoint
DROP INDEX "products_category_idx";--> statement-breakpoint
DROP INDEX "products_active_idx";--> statement-breakpoint
DROP INDEX "variants_sku_unique";--> statement-breakpoint
DROP INDEX "variants_product_idx";--> statement-breakpoint
DROP INDEX "variants_sku_idx";--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.178Z"';--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_variant_idx` ON `order_items` (`variant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_paystack_reference_unique` ON `orders` (`paystack_reference`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`customer_email`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_paystack_ref_idx` ON `orders` (`paystack_reference`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_active_idx` ON `products` (`is_active`);--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_unique` ON `variants` (`sku`);--> statement-breakpoint
CREATE INDEX `variants_product_idx` ON `variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `variants_sku_idx` ON `variants` (`sku`);--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.178Z"';--> statement-breakpoint
ALTER TABLE `payouts` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.178Z"';--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.176Z"';--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.176Z"';--> statement-breakpoint
ALTER TABLE `suppliers` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.178Z"';--> statement-breakpoint
ALTER TABLE `variants` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.177Z"';--> statement-breakpoint
ALTER TABLE `variants` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT '"2026-07-06T17:43:38.177Z"';