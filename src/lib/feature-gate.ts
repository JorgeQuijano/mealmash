// Feature gating based on subscription tier

export type SubscriptionTier = 'free' | 'pro' | 'family';

export interface FeatureAccess {
  wheelSpin: boolean;
  wheelUnlimited: boolean;
  searchBasic: boolean;
  searchAdvanced: boolean;
  pantrySingle: boolean;
  pantryUnlimited: boolean;
  shoppingManual: boolean;
  shoppingAuto: boolean;
  mealPlans: boolean;
  nutrition: boolean;
  familyMembers: boolean;
}

export const FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    wheelSpin: true,
    wheelUnlimited: false,
    searchBasic: true,
    searchAdvanced: false,
    pantrySingle: true,
    pantryUnlimited: false,
    shoppingManual: true,
    shoppingAuto: false,
    mealPlans: false,
    nutrition: false,
    familyMembers: false,
  },
  pro: {
    wheelSpin: true,
    wheelUnlimited: true,
    searchBasic: true,
    searchAdvanced: true,
    pantrySingle: true,
    pantryUnlimited: true,
    shoppingManual: true,
    shoppingAuto: true,
    mealPlans: true,
    nutrition: true,
    familyMembers: false,
  },
  family: {
    wheelSpin: true,
    wheelUnlimited: true,
    searchBasic: true,
    searchAdvanced: true,
    pantrySingle: true,
    pantryUnlimited: true,
    shoppingManual: true,
    shoppingAuto: true,
    mealPlans: true,
    nutrition: true,
    familyMembers: true,
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
  return access[feature];
}

// Helper to check if user can use a feature
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

export function canUseFamilyMembers(tier: SubscriptionTier | null | undefined): boolean {
  return canAccessFeature(tier, 'familyMembers');
}

// Get the number of wheel spins allowed per day
export function getWheelSpinLimit(tier: SubscriptionTier | null | undefined): number {
  if (!tier || tier === 'free') return 5;
  return -1; // unlimited
}
