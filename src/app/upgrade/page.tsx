'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Check, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export default function UpgradePage() {
  const router = useRouter();
  const { subscription, loading: subLoading, createCheckoutSession } = useSubscription();
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnUrl=/upgrade');
      }
    }
    checkAuth();
  }, [router]);

  const handleUpgrade = async () => {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      alert('Subscription service is not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade. Please try again.');
      setLoading(false);
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If already Pro, show success message
  if (subscription?.tier === 'pro' && subscription.status === 'active') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">You're a Pro!</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for subscribing to MealClaw Pro. You now have unlimited access to all features.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Upgrade to Pro</CardTitle>
            <CardDescription>
              Unlock unlimited meal planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold">$7</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Unlimited wheel spins</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Unlimited pantry items</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Advanced recipe filters</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Auto shopping lists</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Weekly meal plans</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Nutritional info</span>
              </li>
            </ul>

            <Button 
              onClick={handleUpgrade} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Now - $7/month'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Cancel anytime. Secure payment via Stripe.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
