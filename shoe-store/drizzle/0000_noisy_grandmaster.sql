CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`product_name` text NOT NULL,
	`variant_size` text NOT NULL,
	`variant_color` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`total_price` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_variant_idx` ON `order_items` (`variant_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_email` text NOT NULL,
	`customer_name` text,
	`customer_phone` text,
	`shipping_address` text,
	`county` text,
	`delivery_type` text NOT NULL,
	`delivery_fee` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`paystack_reference` text,
	`subtotal` integer NOT NULL,
	`tax` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`notes` text,
	`admin_notes` text,
	`confirmed_at` integer,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer DEFAULT '"2026-07-11T13:55:42.956Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-11T13:55:42.956Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_paystack_reference_unique` ON `orders` (`paystack_reference`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`customer_email`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_paystack_ref_idx` ON `orders` (`paystack_reference`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `payout_items` (
	`id` text PRIMARY KEY NOT NULL,
	`payout_id` text NOT NULL,
	`order_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`payout_id`) REFERENCES `payouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`supplier_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`method` text,
	`reference` text,
	`paid_at` integer,
	`notes` text,
	`created_at` integer DEFAULT '"2026-07-11T13:55:42.956Z"' NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`base_price` integer NOT NULL,
	`sale_price` integer,
	`on_sale` integer DEFAULT false NOT NULL,
	`images` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT '"2026-07-11T13:55:42.954Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-11T13:55:42.954Z"' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_active_idx` ON `products` (`is_active`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-11T13:55:42.956Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supplier_products` (
	`id` text PRIMARY KEY NOT NULL,
	`supplier_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`cost_price` integer NOT NULL,
	`min_order_qty` integer DEFAULT 1,
	`lead_time_days` integer DEFAULT 0,
	`is_preferred` integer DEFAULT false,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_name` text,
	`phone` text,
	`email` text,
	`location` text,
	`payment_terms` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT '"2026-07-11T13:55:42.956Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`size` text NOT NULL,
	`color` text NOT NULL,
	`color_hex` text,
	`sku` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`cost_price` integer,
	`barcode` text,
	`created_at` integer DEFAULT '"2026-07-11T13:55:42.955Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-07-11T13:55:42.955Z"' NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_sku_unique` ON `variants` (`sku`);--> statement-breakpoint
CREATE INDEX `variants_product_idx` ON `variants` (`product_id`);--> statement-breakpoint
CREATE INDEX `variants_sku_idx` ON `variants` (`sku`);