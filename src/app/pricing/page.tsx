'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for trying things out',
    features: [
      { text: 'Spin the wheel (5x/day)', included: true },
      { text: 'Basic recipe search', included: true },
      { text: '1 pantry list', included: true },
      { text: 'Manual shopping list', included: true },
      { text: 'Advanced recipe filters', included: false },
      { text: 'Unlimited pantry lists', included: false },
      { text: 'Auto shopping lists', included: false },
      { text: 'Weekly meal plans', included: false },
      { text: 'Nutritional info', included: false },
    ],
    priceId: null,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: 4,
    description: 'For serious home cooks',
    popular: true,
    features: [
      { text: 'Spin the wheel (unlimited)', included: true },
      { text: 'Basic recipe search', included: true },
      { text: '1 pantry list', included: true },
      { text: 'Manual shopping list', included: true },
      { text: 'Advanced recipe filters', included: true },
      { text: 'Unlimited pantry lists', included: true },
      { text: 'Auto shopping lists', included: true },
      { text: 'Weekly meal plans', included: true },
      { text: 'Nutritional info', included: true },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    cta: 'Go Pro',
  },
  {
    name: 'Family',
    price: 9,
    description: 'The whole family covered',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 5 family members', included: true },
      { text: 'Family favorites list', included: true },
      { text: 'Meal prep scheduling', included: true },
      { text: 'Priority support', included: true },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID,
    cta: 'Get Family Plan',
  },
];

export default function PricingPage() {
  const { subscription, isPro, isFamily, loading, createCheckoutSession, createPortalSession } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null | undefined, planName: string) => {
    if (!priceId) return;
    
    setLoadingPlan(planName);
    try {
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan('portal');
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getCurrentPlanBadge = (planName: string) => {
    if (subscription?.tier === 'free' || !subscription) return null;
    
    const isCurrentPlan = 
      (planName === 'Pro' && subscription.tier === 'pro') ||
      (planName === 'Family' && subscription.tier === 'family');
    
    if (isCurrentPlan && subscription.status === 'active') {
      return <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Current Plan</span>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-lg">
            Choose the plan that works for you. Cancel anytime.
          </p>
          {subscription && subscription.tier !== 'free' && (
            <div className="mt-4">
              <button
                onClick={handleManageSubscription}
                disabled={loadingPlan === 'portal'}
                className="text-blue-500 hover:underline"
              >
                {loadingPlan === 'portal' ? 'Loading...' : 'Manage my subscription'}
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = 
              (plan.name === 'Pro' && subscription?.tier === 'pro') ||
              (plan.name === 'Family' && subscription?.tier === 'family');

            return (
              <div
                key={plan.name}
                className={`relative bg-card border rounded-xl p-8 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loadingPlan === plan.name || isCurrentPlan || loading || !plan.priceId}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingPlan === plan.name 
                    ? 'Loading...' 
                    : isCurrentPlan 
                      ? 'Current Plan'
                      : plan.priceId 
                        ? plan.cta 
                        : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 text-muted-foreground">
          <p>All prices in USD.</p>
          <p className="mt-2">Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
