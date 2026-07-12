# Shoe Store — Template Setup Guide

A production-ready Next.js shoe store template with a full admin panel, Paystack payments, inventory management, and seasonal theming.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3.4 + CSS variables for theming |
| 3D / Motion | Framer Motion |
| ORM | Drizzle ORM |
| Database | Turso (LibSQL / SQLite) |
| State | Zustand (client cart) |
| Payments | Paystack |
| Notifications | Sonner (toasts) |
| Typography | Fredoka (headings) + Nunito (body) via `next/font` |

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd shoe-store
pnpm install        # or npm install
```

### 2. Environment variables

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables in `.env.local`:

```env
# ── Database (Turso) ──────────────────────────────
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# ── Admin Auth ────────────────────────────────────
ADMIN_PASSWORD=your-admin-password

# ── Paystack ──────────────────────────────────────
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# ── Cloudinary (product images) ──────────────────
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# ── Brevo (transactional email) ──────────────────
BREVO_API_KEY=your-key
BREVO_SENDER_EMAIL=admin@yourstore.com
BREVO_SENDER_NAME=Your Store

# ── App ──────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Getting Turso credentials:** Sign up at [turso.tech](https://turso.tech), create a database, and copy the URL + auth token from the dashboard.

### 3. Push the schema and seed data

```bash
pnpm db:push          # Create tables in Turso
pnpm db:seed          # Seed 10 sample products + 2 suppliers
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Database Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:push` | Push Drizzle schema to Turso (creates/updates tables) |
| `pnpm db:seed` | Clear all data and re-seed with sample products + suppliers |
| `pnpm db:studio` | Open Drizzle Studio (web-based data browser) |
| `pnpm db:generate` | Generate migration files from schema changes |

> **Note:** `db:seed` is idempotent — it clears existing data before inserting. Safe to run multiple times.

---

## Project Structure

```
src/
├── app/
│   ├── (storefront)/        # Public pages
│   │   ├── page.tsx         # Homepage
│   │   ├── shoes/           # Product listing + detail
│   │   ├── cart/            # Cart page
│   │   ├── checkout/        # Checkout + success
│   │   └── ...              # FAQ, returns, contact, delivery-info
│   ├── admin/               # Admin panel
│   │   ├── page.tsx         # Dashboard
│   │   ├── inventory/       # Product CRUD
│   │   ├── orders/          # Order management
│   │   ├── suppliers/       # Supplier CRUD
│   │   ├── payouts/         # Payout tracking
│   │   └── theme/           # Theme/appearance settings
│   └── api/                 # API routes
│       ├── payments/        # Paystack checkout
│       ├── webhooks/        # Paystack webhook
│       ├── admin/           # Admin CRUD endpoints
│       └── auth/            # Login/logout
├── components/
│   ├── ui/                  # Reusable UI (Button, Input, Select, etc.)
│   ├── admin/               # Admin-specific components
│   └── ...                  # Header, footer, cart drawer, etc.
├── lib/
│   ├── db/                  # Drizzle schema + connection
│   ├── cart-store.ts        # Zustand cart state
│   ├── themes.ts            # Seasonal theme definitions
│   ├── brands.ts            # Brand logo data
│   └── utils.ts             # Helpers (formatPrice, etc.)
└── hooks/                   # Custom React hooks
```

---

## Theming & Dark Mode

The template uses a **CSS-variable-based theming system** with dark mode support:

- **Theme variables** are defined in `src/app/globals.css` as `--color-*` CSS custom properties
- **Dark mode** uses `darkMode: 'class'` in Tailwind config, toggled via the `<ThemeProvider>`
- **Seasonal themes** (Christmas, Easter, Back-to-School, Black Friday) override the same CSS variables
- Admin users can switch themes and toggle dark mode from **Admin → Theme & Appearance**
- All components use semantic variables (`var(--color-text)`, `var(--color-surface)`, etc.) for automatic theme adaptation

---

## Payment Gateways

### Current: Paystack

The checkout flow uses **Paystack** for online payments. The architecture is:

1. **Checkout page** → calls `POST /api/payments` with order details
2. **`/api/payments`** → creates a pending order in the DB, then calls `Paystack.initializePayment()` to get an authorization URL
3. **Customer** → redirected to Paystack's hosted payment page to complete payment
4. **`/api/webhooks/paystack`** → receives Paystack's webhook, verifies the signature, and marks the order as paid

Cash on Delivery (COD) orders bypass Paystack entirely — they create an order with `paymentStatus: 'pending'` and `status: 'pending'`.

### Integrating M-Pesa (Daraja API)

To add native M-Pesa alongside Paystack:

1. **Create a new module** `src/lib/mpesa.ts`:
   - Implement OAuth token generation (`POST https://sandbox.safaricom.co.ke/oauth/v1/generate`)
   - Implement STK Push (`POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`)
   - Handle callback URL responses

2. **Add a new API route** `src/app/api/payments/mpesa/route.ts`:
   - Accept phone number + order details
   - Initiate STK push to the customer's phone
   - Return a pending order ID for polling

3. **Add a webhook/callback route** `src/app/api/webhooks/mpesa/route.ts`:
   - Safaricom sends the payment result to this endpoint
   - Verify the transaction and update the order status

4. **Update the checkout form** to offer M-Pesa as a payment option alongside Paystack and COD.

> **Tip:** Start with Safaricom's sandbox (`sandbox.safaricom.co.ke`) for testing, then switch to production (`api.safaricom.co.ke`) when ready.

### Integrating Stripe

To replace or supplement Paystack with Stripe:

1. **Install:** `pnpm add stripe @stripe/stripe-js`

2. **Create `src/lib/stripe.ts`:**
   - Server-side: `new Stripe(process.env.STRIPE_SECRET_KEY!)`
   - Client-side: `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)`

3. **Add API route** `src/app/api/payments/stripe/route.ts`:
   - Create a Stripe Checkout Session with line items from the cart
   - Return the session URL for redirect

4. **Add webhook route** `src/app/api/webhooks/stripe/route.ts`:
   - Verify Stripe's webhook signature
   - Listen for `checkout.session.completed` and update the order

5. **Update `src/app/checkout/page.tsx`** to support Stripe's `<Elements>` provider if using embedded checkout.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Set all environment variables in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

### Self-hosted

```bash
pnpm build
pnpm start
```

Ensure Node.js ≥ 18 and that your Turso database is accessible from your server.

---

## Key Notes for Developers

- **Prices are stored in cents** (KES × 100). Always divide by 100 for display; multiply by 100 for storage.
- **Product IDs are slugs** — the `id` field in the `products` table IS the slug (e.g., `nike-air-max-90`).
- **Images are stored as a JSON array** of URLs in the `images` text column. Use `parseJsonSafe()` to deserialize.
- **The cart is client-side only** (Zustand + localStorage). It does not persist across devices.
- **Stock is decremented at two points:** (1) when payment init succeeds (reverted on failure), (2) when the webhook confirms payment.
- **Webhook idempotency** is enforced via `paystackReference` uniqueness — duplicate webhooks are safely ignored.
