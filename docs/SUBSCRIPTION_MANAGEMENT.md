# MealClaw Subscription Management - Technical Plan

## Overview
After subscribing, users need to know they're Pro members, see their benefits, and manage/cancel their subscription.

---

## Current State
- User can subscribe via `/pricing` or `/upgrade`
- Subscription data stored in `user_profiles` table: `subscription_tier`, `subscription_status`
- Webhook updates user profile when subscription changes

---

## Proposed Changes

### 1. Subscription Status Indicators

**Places to show Pro status:**
- Mobile nav: Show "⭐ Pro" badge when subscribed
- Header/Navbar: Show Pro badge
- Dashboard: Show "Pro Member" banner/badge
- Settings page: Show subscription status

**Implementation:**
- Use existing `useSubscription` hook to check `subscription?.tier === 'pro'`
- Add visual badges (crown icon, gold color, etc.)

---

### 2. Remove "Upgrade to Pro" When Already Subscribed

**Current behavior:**
- "Upgrade to Pro" shows in mobile nav "More" menu for all logged-in users

**New behavior:**
- Check subscription tier
- If Pro + active: Show "Manage Subscription" instead
- If Free: Show "Upgrade to Pro"

**Files to modify:**
- `src/components/mobile-nav.tsx` - Conditional rendering

---

### 3. New "Manage Subscription" Page (`/subscription`)

**Page content:**
```
┌─────────────────────────────┐
│  ⭐ You're a Pro Member    │
│  $7/month                  │
│  Status: Active            │
└─────────────────────────────┘

Your Pro Benefits:
✓ Unlimited wheel spins
✓ Unlimited pantry items  
✓ Advanced recipe filters
✓ Auto shopping lists
✓ Weekly meal plans
✓ Nutritional info

Next billing date: [DATE]

[Cancel Subscription] (red button)
[Back to Dashboard]
```

**Features:**
- Show current plan details
- Show next billing date
- Show all Pro benefits (reinforce value)
- Button to cancel (opens Stripe portal)
- Button to manage payment method (Stripe portal)

---

### 4. Cancel Subscription Flow

**Option A: Stripe Customer Portal (Easiest)**
- Use existing `/api/stripe/portal` route
- Opens Stripe's hosted portal where user can:
  - Cancel subscription
  - Update payment method
  - View invoice history

**Option B: In-app cancellation**
- More complex, requires Stripe API calls
- Would need to handle proration, refunds, etc.

**Recommendation:** Use Option A - Stripe Portal

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/subscription/page.tsx` | New subscription management page |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/mobile-nav.tsx` | Show "Manage Subscription" for Pro users |
| `src/app/settings/page.tsx` section |
| `src/app/dashboard/page.tsx | Add subscription status` | Add Pro badge/banner |

### API Routes (already exist)
- `/api/stripe/portal` - Opens Stripe billing portal for cancellation

---

## Database (already done)
- `subscription_tier` - 'free' | 'pro' | 'family'
- `subscription_status` - 'active' | 'canceled' | 'past_due'
- `plan_expires_at` - timestamp

---

## UI Mockup - Subscription Page

```jsx
// /subscription page

// If Pro + Active
<Card>
  <CardHeader>
    <CrownIcon className="w-12 h-12 text-yellow-500" />
    <Title>You're a Pro Member!</Title>
    <Subtitle>$7/month • Next billing: Jan 6, 2025</Subtitle>
  </CardHeader>
  <CardContent>
    <h3>Your Pro Benefits</h3>
    <ul>
      <li>✓ Unlimited wheel spins</li>
      <li>✓ Unlimited pantry items</li>
      <li>✓ Advanced recipe filters</li>
      <li>✓ Auto shopping lists</li>
      <li>✓ Weekly meal plans</li>
      <li>✓ Nutritional info</li>
    </ul>
    
    <Button variant="outline" onClick={openStripePortal}>
      Manage Billing / Cancel
    </Button>
  </CardContent>
</Card>

// If Free
<Card>
  <CardContent>
    <Title>Free Plan</Title>
    <p>3 spins/day, 50 pantry items</p>
    <Button onClick={() => router.push('/upgrade')}>
      Upgrade to Pro
    </Button>
  </CardContent>
</Card>
```

---

## User Flow

1. **User clicks "More" in mobile nav**
   - If Free: Shows "Upgrade to Pro"
   - If Pro: Shows "Manage Subscription"

2. **User clicks "Manage Subscription"**
   - Goes to `/subscription` page
   - Sees Pro status, benefits, next billing date
   - Can click "Cancel" → opens Stripe portal

3. **User cancels in Stripe portal**
   - Stripe sends webhook → updates user profile
   - User status changes to 'canceled'
   - On next login, sees Free plan

---

## Testing Checklist

- [ ] Login as Free user → see "Upgrade to Pro"
- [ ] Subscribe via Stripe test mode
- [ ] Return to app → see Pro badge
- [ ] Click "More" → see "Manage Subscription"
- [ ] Go to /subscription → see all benefits
- [ ] Click "Cancel" → Stripe portal opens
- [ ] Cancel in Stripe → return to app as Free user

---

## Questions Before Implementation

1. Should the Pro badge be visible on the landing page (not logged in)?
2. Do you want email notifications when subscription status changes?
3. Any specific colors for Pro badges? (gold/yellow theme?)
