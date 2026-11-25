# FocusWaves Billing & Auth Setup (Supabase + Stripe on Vercel)

FocusWaves mirrors the exact **RunIQ** serverless billing pattern (`/api/*` on Vercel + Supabase Auth + Stripe Checkout + Stripe Customer Portal + Webhook sync).

---

## 1. Supabase Setup
1. Create (or reuse) a Supabase project and enable **Email/Password** (and optionally **Google OAuth**) under **Authentication → Providers**.
2. Under **Authentication → URL Configuration**, set **Site URL** to `https://focus-waves.vercel.app` and add `https://focus-waves.vercel.app/**` to Redirect URLs.
3. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql) to create the `subscriptions` table, RLS policy, and `update_user_subscription` RPC.

---

## 2. Stripe Setup
1. In **Stripe Dashboard → Products**, create a product **FocusWaves Pro** with two recurring prices:
   - **Annual**: `$49.99 USD` / year → copy its `price_...` ID into `STRIPE_PRICE_ANNUAL`
   - **Monthly**: `$7.99 USD` / month → copy its `price_...` ID into `STRIPE_PRICE_MONTHLY`
2. Enable **Customer Portal** under **Settings → Billing → Customer portal** (allow users to cancel, switch between Annual/Monthly, and update payment methods).
3. Under **Developers → Webhooks**, add an endpoint:
   - URL: `https://focus-waves.vercel.app/api/stripe-webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

---

## 3. Vercel Environment Variables
Add these in **Vercel Project → Settings → Environment Variables** (see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ANNUAL`
- `STRIPE_PRICE_MONTHLY`
- `APP_URL` (`https://focus-waves.vercel.app`)

Redeploy once added. Both Annual (`$49.99/yr`) and Monthly (`$7.99/mo`) automatically start with a **7-day free trial**, and signed-in subscribers get a **Manage Subscription** button in the top bar. Private Founder Codes (`DTE-FOUNDER`, `FOCUSWAVES-PRO`, `DTE-VIP`) remain active for giving friends complimentary Pro access.
