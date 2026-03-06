# MealClaw Subscription Page - Technical Plan

## Current State
You already have a pricing page at `/pricing` but it needs environment variables to work.

---

## What's Needed

### 1. Environment Variables (in Vercel)

Add these to your Vercel project settings:

```
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx (from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID=price_xxx (from Stripe Dashboard)
```

**How to get these:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Click on your "Pro" product → Copy the Price ID (starts with `price_`)
3. Do the same for "Family"

### 2. Test Mode vs Live Mode

**For testing:**
- Use test API keys (start with `sk_test_` / `pk_test_`)
- Use test price IDs
- Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)

**For production:**
- Switch to live keys (start with `sk_live_` / `pk_live_`)
- Use live price IDs

### 3. Access the Pricing Page

The page already exists at: `https://mealclaw.com/pricing`

**Ways to access:**
- Direct link: users go to `/pricing`
- Add link in navigation (currently shows inline on landing page)
- Add "Upgrade" button in dashboard for free users

---

## Recommended: Add Upgrade Button in Dashboard

For logged-in free users, show an upgrade prompt:

1. Check user's subscription tier
2. If free, show "Upgrade to Pro" button
3. Clicking takes them to `/pricing` with their plan pre-selected

---

## Quick Checklist

- [ ] Get Pro price ID from Stripe
- [ ] Get Family price ID from Stripe  
- [ ] Add to Vercel environment variables
- [ ] Redeploy
- [ ] Test with Stripe test mode card
- [ ] Switch to live mode when ready

---

## Testing Flow

1. Go to `https://mealclaw.com/pricing`
2. Click "Go Pro" ($4/month)
3. Enter test card: `4242 4242 4242 4242`
4. Any future date + any 3 digits for CVC
5. Complete checkout
6. Should redirect to dashboard with Pro access

---

## What to do now

**Tell me your Stripe price IDs** (from Stripe Dashboard → Products → click each product → look for "Price ID" starting with `price_`) and I'll add them to Vercel environment variables for you.
