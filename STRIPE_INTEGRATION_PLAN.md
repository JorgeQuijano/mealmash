# MealClaw Stripe Integration Plan

## Overview
Implement Stripe payments for MealClaw with subscription billing (Free/Pro/Family tiers). Prices in USD.

---

## 1. What You Need to Do (Action Items)

### A. Stripe Account Setup
1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com) and sign up
   - Select Canada as your country
   - Verify your email and complete business verification
   - Enable 2FA on your Stripe account

2. **Get API Keys**
   - Navigate to Developers → API Keys
   - Copy your **Publishable Key** and **Secret Key**
   - Add them to Vercel environment variables (see Technical section)

3. **Configure Stripe Dashboard**
   - Go to Settings → Company: Add your business name, address, phone
   - Go to Settings → Taxes: Enable automatic tax calculation, set your province (e.g., Ontario = 13% HST)
   - Go to Settings → Branding: Upload your logo for Stripe-hosted pages

4. **Create Products & Prices** (in Stripe Dashboard)
   
   | Product | Price (CAD) | Price ID (create in Stripe) |
   |---------|-------------|----------------------------|
   | Free | $0 | (no stripe needed) |
   | Pro | $4/month | `price_pro_monthly` |
   | Family | $9/month | `price_family_monthly` |

   - Create each product in Stripe Dashboard → Products
   - Copy the **Price ID** for each (starts with `price_xxx`)

5. **Set Up Webhooks**
   - Go to Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the **Webhook Signing Secret**

### B. Vercel Environment Variables
Add these in Vercel Project Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_live_xxxxx (or sk_test_xxxxx for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_FAMILY_PRICE_ID=price_xxxxx
```

### C. Business & Legal
- [ ] Terms of Service page (if not already)
- [ ] Privacy Policy page (if not already)
- [ ] Refund policy (can set in Stripe Dashboard settings)
- [ ] Register for GST/HST if revenue exceeds $30,000/year (or register voluntarily)

---

## 2. Technical Implementation

### A. Install Stripe Packages
```bash
npm install stripe @stripe/stripe-js
```

### B. Database Changes

Add to your Supabase database:

```sql
-- Users table additions
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
```

### C. New API Routes

#### 1. `src/app/api/stripe/checkout/route.ts`
Creates a Stripe Checkout session for subscription

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const { priceId, userId } = await req.json();
  
  const supabase = createClient();
  
  // Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  // Create or get Stripe customer
  let customerId: string;
  
  // Check if user already has stripe customer
  const { data: existingCustomer } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (existingCustomer?.stripe_customer_id) {
    customerId = existingCustomer.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });
    customerId = customer.id;
    
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
    metadata: { userId },
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId },
    },
  });

  return NextResponse.json({ url: session.url });
}
```

#### 2. `src/app/api/stripe/portal/route.ts`
Creates customer portal session for managing subscriptions

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId } = await req.json();
  
  const supabase = createClient();
  
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
```

#### 3. `src/app/api/webhooks/stripe/route.ts`
Handles Stripe webhooks

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
  }

  const supabase = createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      const tier = priceId === process.env.STRIPE_FAMILY_PRICE_ID ? 'family' : 'pro';

      await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          subscription_id: subscriptionId,
          plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (!userId) break;

      const priceId = subscription.items.data[0].price.id;
      const tier = priceId === process.env.STRIPE_FAMILY_PRICE_ID ? 'family' : 
                   priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'free';

      await supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_status: subscription.status,
          plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (!userId) break;

      await supabase
        .from('users')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          subscription_id: null,
          plan_expires_at: null,
        })
        .eq('id', userId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('id', user.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

### D. Stripe Utility Library

#### `src/lib/stripe.ts`
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia', // Use latest API version
  typescript: true,
});
```

### E. Frontend Components

#### 1. Pricing Page Updates
Show current plan, upgrade/downgrade options, manage subscription button.

#### 2. Subscription Hook
```typescript
// src/hooks/useSubscription.ts
import { createClient } from '@/lib/supabase';

export function useSubscription() {
  const supabase = createClient();
  
  const getSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, plan_expires_at')
      .eq('id', user.id)
      .single();
    
    return data;
  };

  const createCheckoutSession = async (priceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId: user.id }),
    });

    const { url } = await res.json();
    window.location.href = url;
  };

  const createPortalSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });

    const { url } = await res.json();
    window.location.href = url;
  };

  return { getSubscription, createCheckoutSession, createPortalSession };
}
```

### F. Feature Gating

Check subscription tier before allowing premium features:

```typescript
// src/lib/feature-gate.ts
export function canUseFeature(userTier: string, feature: string): boolean {
  const features = {
    free: ['wheel_basic', 'search_basic', 'pantry_single'],
    pro: ['wheel_unlimited', 'search_advanced', 'pantry_unlimited', 'shopping_auto', 'meal_plans', 'nutrition'],
    family: ['wheel_unlimited', 'search_advanced', 'pantry_unlimited', 'shopping_auto', 'meal_plans', 'nutrition', 'family_members'],
  };
  
  return features[userTier as keyof typeof features]?.includes(feature) ?? false;
}
```

---

## 3. Testing Checklist

### A. Test Cards (Stripe)
Use Stripe test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0000 0000 3220`

### B. Test Flow
1. Create test account
2. Go to pricing page
3. Click "Go Pro"
4. Enter test card details
5. Complete checkout
6. Verify webhook updates database
7. Check user has pro access
8. Test portal (cancel, update payment)
9. Test failed payment handling

### C. Test Mode vs Live Mode
- Always test in **test mode** first
- Switch to **live mode** only after full testing
- Keep test keys separate from live keys

---

## 4. Canadian-Specific Considerations

### A. Currency
- All prices in **CAD** (Canadian Dollars)
- Set default price currency in Stripe to CAD

### B. Taxes (GST/HST)
- **Ontario**: 13% HST ⭐ (Jorge's province)
- **British Columbia**: 5% GST + 7% PST = 12% total
- **Alberta**: 5% GST only
- **Quebec**: 5% GST + 9.975% QST = 14.975% total
- **Other provinces**: Check provincial rates

Enable automatic tax in Stripe:
1. Stripe Dashboard → Settings → Taxes
2. Enable "Calculate tax automatically"
3. Set your province as home jurisdiction
4. Stripe will add appropriate tax to invoices

### C. Payment Methods
Stripe Canada supports:
- Visa, Mastercard, American Express
- Debit cards (Visa Debit, Mastercard Debit)
- Apple Pay, Google Pay (on supported devices)

### D. Payouts
- Stripe pays out to your Canadian bank account
- Typically 2-7 business days
- Can set payout schedule in Stripe settings

---

## 5. Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_xxxxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_xxxxx` |
| `STRIPE_PRO_PRICE_ID` | Pro plan price ID | `price_xxxxx` |
| `STRIPE_FAMILY_PRICE_ID` | Family plan price ID | `price_xxxxx` |
| `NEXT_PUBLIC_URL` | Your app URL | `https://mealclaw.com` |

---

## 6. Files to Create/Modify

### New Files
- `src/lib/stripe.ts` - Stripe client
- `src/app/api/stripe/checkout/route.ts` - Checkout session
- `src/app/api/stripe/portal/route.ts` - Customer portal
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/hooks/useSubscription.ts` - Subscription utilities
- `src/lib/feature-gate.ts` - Feature gating

### Modified Files
- `src/app/pricing/page.tsx` - Add Stripe checkout buttons
- `src/app/dashboard/page.tsx` - Show current plan, gate features
- `src/app/settings/page.tsx` - Add subscription management
- Database schema - Add user subscription fields

---

## 7. Timeline Estimate

1. **Day 1**: Stripe account setup, products/prices creation
2. **Day 2**: Backend API routes (checkout, portal, webhooks)
3. **Day 3**: Frontend integration (pricing page, subscription hook)
4. **Day 4**: Feature gating, database updates
5. **Day 5**: Testing in Stripe test mode
6. **Day 6**: Go live with test mode, verify everything works
7. **Day 7**: Switch to live mode, monitor first payments

---

## Questions to Answer Before Implementation

1. Which Canadian province are you in? (determines tax rate)
2. Do you want to charge taxes manually or let Stripe handle it?
3. Do you need annual billing options in addition to monthly?
4. Should existing users be migrated to a specific tier?
5. What's your refund policy?
