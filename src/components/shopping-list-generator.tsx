'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Crown, Wand2, Calendar, ShoppingCart } from 'lucide-react';

interface ShoppingListGeneratorProps {
  isPro: boolean;
  onGenerateFromRecipes: () => void;
  onGenerateFromMealPlan: () => void;
}

export default function ShoppingListGenerator({ 
  isPro, 
  onGenerateFromRecipes,
  onGenerateFromMealPlan 
}: ShoppingListGeneratorProps) {
  const router = useRouter();

  // Free user - show paywall
  if (!isPro) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Auto-Generate Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Auto Shopping Lists are for Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate shopping lists from your recipes and meal plans automatically
            </p>
            <Button onClick={() => router.push('/upgrade')}>
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pro user - show options
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Auto-Generate Shopping List
          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
            <Crown className="w-3 h-3 mr-1" /> Pro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onGenerateFromRecipes}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          From Recipes
        </Button>
        <Button variant="outline" onClick={onGenerateFromMealPlan}>
          <Calendar className="w-4 h-4 mr-2" />
          From Meal Plan
        </Button>
      </CardContent>
    </Card>
  );
}
