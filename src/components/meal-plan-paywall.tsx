'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Check, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MealPlanPaywall() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Meal Plans are for Pro Members</h2>
          <p className="text-muted-foreground mb-6">
            Plan your entire week of meals with MealClaw Pro
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">⭐ Pro Benefits</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-yellow-600" />
                <span>Weekly meal planning</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-yellow-600" />
                <span>Never forget what to cook</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-yellow-600" />
                <span>Auto-generate shopping lists</span>
              </li>
            </ul>
          </div>

          <Button 
            onClick={() => router.push('/upgrade')}
            className="w-full"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro - $7/month
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
