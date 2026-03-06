'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Check, Crown, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import MobileNav from '@/components/mobile-nav';

function SubscriptionContent() {
  const router = useRouter();
  const { subscription, loading: subLoading, createPortalSession } = useSubscription();
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?returnUrl=/subscription');
      }
    }
    checkAuth();
  }, [router]);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Free user - show upgrade option
  if (!subscription || subscription.tier === 'free') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>
                Your current plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-4">
                  Limited to 3 spins/day and 50 pantry items
                </p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span>Upgrade to unlock everything!</span>
                  </li>
                </ul>
                <Button onClick={() => router.push('/upgrade')} className="w-full">
                  ⭐ Upgrade to Pro - $7/month
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <MobileNav />
      </div>
    );
  }

  // Pro user - show subscription status
  const isPro = subscription.tier === 'pro';
  const isActive = subscription.status === 'active';
  const isCanceled = subscription.status === 'canceled';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-600">
              {isActive ? "You're a Pro Member!" : "Pro Plan (Canceled)"}
            </CardTitle>
            <CardDescription>
              {isActive ? "$7/month" : "Access ends on " + formatDate(subscription.expiresAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isActive && (
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Next billing date: <strong>{formatDate(subscription.expiresAt)}</strong>
                </p>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                ⭐ Your Pro Benefits
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Unlimited wheel spins</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Unlimited pantry items</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Advanced recipe filters</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Weekly meal plans</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleManageBilling} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage Billing / Cancel Subscription'
                )}
              </Button>

              <Button 
                onClick={() => router.push('/dashboard')}
                variant="secondary"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Secure payment via Stripe
            </p>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
