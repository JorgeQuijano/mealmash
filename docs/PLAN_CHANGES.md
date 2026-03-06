# MealClaw Plan Changes - Technical Plan

## Proposed Changes

### Current Plans
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 5 wheel spins/day, basic search, 1 pantry |
| Pro | $4/mo | Unlimited spins, advanced search, unlimited pantries, auto shopping lists, meal plans, nutrition |
| Family | $9/mo | Everything in Pro + family features |

### New Plans
| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 3 wheel spins/day, basic search only, 1 pantry, manual shopping list |
| Pro | $7/mo | Unlimited everything - unlimited spins, advanced search, unlimited pantries, auto shopping lists, meal plans, nutrition |

---

## What You Need to Do

### 1. Stripe Dashboard Changes
- [ ] **Delete** the "Family" product (or just stop using it)
- [ ] **Update** Pro product price from $4 → $7
- [ ] **Get new Price ID** for the $7 Pro plan
- [ ] Update Vercel environment variable: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` with new Price ID
- [ ] Remove (or leave unused): `NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID`

### 2. Code Changes (I'll make)
- [ ] Remove Family plan from pricing page
- [ ] Update Free plan limits in feature-gate.ts
- [ ] Update pricing page to show $7 instead of $4
- [ ] Update documentation

### 3. Database (if needed)
- No database changes needed - existing subscription tiers will still work
- Users on Family plan will keep it until they cancel

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/pricing/page.tsx` | Remove Family plan, update Pro to $7 |
| `src/lib/feature-gate.ts` | Update Free plan limits (3 spins/day) |
| `src/config/site.ts` | Update pricing section |
| `docs/STRIPE_INTEGRATION_PLAN.md` | Update pricing info |

---

## After Changes

1. Deploy updated code
2. Update Pro price in Stripe to $7
3. Get new Price ID and update in Vercel
4. Test checkout flow
5. Switch to live mode when ready

---

## Impact on Existing Users

- **Free users**: Get reduced limits (3 spins/day instead of 5)
- **Pro users** (on $4): Stay on $4 until they cancel/resubscribe
- **Family users**: Stay on Family until they cancel

No forced migrations needed - users keep their current plan until they choose to change.
