// Feature gating based on subscription tier

export type SubscriptionTier = 'free' | 'pro' | 'family';

export interface FeatureAccess {
  wheelSpin: boolean;
  wheelUnlimited: boolean;
  wheelSpinLimit: number; // -1 = unlimited
  searchBasic: boolean;
  searchAdvanced: boolean;
  pantryUnlimited: boolean;
  pantryItemLimit: number; // -1 = unlimited
  shoppingManual: boolean;
  shoppingAuto: boolean;
  mealPlans: boolean;
  nutrition: boolean;
}

export const FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    wheelSpin: true,
    wheelUnlimited: false,
    wheelSpinLimit: 3,
    searchBasic: true,
    searchAdvanced: false,
    pantryUnlimited: false,
    pantryItemLimit: 50,
    shoppingManual: true,
    shoppingAuto: false,
    mealPlans: false,
    nutrition: false,
  },
  pro: {
    wheelSpin: true,
    wheelUnlimited: true,
    wheelSpinLimit: -1,
    searchBasic: true,
    searchAdvanced: true,
    pantryUnlimited: true,
    pantryItemLimit: -1,
    shoppingManual: true,
    shoppingAuto: true,
    mealPlans: true,
    nutrition: true,
  },
  family: {
    wheelSpin: true,
    wheelUnlimited: true,
    wheelSpinLimit: -1,
    searchBasic: true,
    searchAdvanced: true,
    pantryUnlimited: true,
    pantryItemLimit: -1,
    shoppingManual: true,
    shoppingAuto: true,
    mealPlans: true,
    nutrition: true,
  },
};

export function getFeatureAccess(tier: SubscriptionTier | null | undefined): FeatureAccess {
  if (!tier || tier === 'free') {
    return FEATURES.free;
  }
  return FEATURES[tier] || FEATURES.free;
}

export function canAccessFeature(
  tier: SubscriptionTier | null | undefined,
  feature: keyof FeatureAccess
): boolean {
  const access = getFeatureAccess(tier);
  const value = access[feature];
  // Handle both boolean and number types
  if (typeof value === 'boolean') return value;
  return value > 0 || value === -1;
}

// Helper functions
export function canUseWheelUnlimited(tier: SubscriptionTier | null | undefined): boolean {
  return canAccessFeature(tier, 'wheelUnlimited');
}

export function canUseAdvancedSearch(tier: SubscriptionTier | null | undefined): boolean {
  return canAccessFeature(tier, 'searchAdvanced');
}

export function canUseAutoShoppingList(tier: SubscriptionTier | null | undefined): boolean {
  return canAccessFeature(tier, 'shoppingAuto');
}

export function canUseMealPlans(tier: SubscriptionTier | null | undefined): boolean {
  return canAccessFeature(tier, 'mealPlans');
}

export function canUseNutrition(tier: SubscriptionTier | null | undefined): boolean {
  return canAccessFeature(tier, 'nutrition');
}

// Get the number of wheel spins allowed per day
export function getWheelSpinLimit(tier: SubscriptionTier | null | undefined): number {
  const access = getFeatureAccess(tier);
  return access.wheelSpinLimit;
}

// Get the pantry item limit
export function getPantryItemLimit(tier: SubscriptionTier | null | undefined): number {
  const access = getFeatureAccess(tier);
  return access.pantryItemLimit;
}

// Check if user can add more pantry items
export function canAddPantryItem(tier: SubscriptionTier | null | undefined, currentCount: number): boolean {
  const limit = getPantryItemLimit(tier);
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}
