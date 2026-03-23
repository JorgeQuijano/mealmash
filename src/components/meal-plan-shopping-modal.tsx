'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ShoppingCart, Calendar, Check } from 'lucide-react';
import { consolidateIngredients, normalizeQuantity, normalizeUnit, unitsMatch } from '@/lib/shopping-list';

interface MealPlan {
  id: string;
  recipe_id: string;
  planned_date: string;
  meal_type: string;
  recipe?: {
    id: string;
    name: string;
    recipe_ingredients?: {
      ingredient_id: string;
      quantity: string;
      quantity_num: number;
      unit: string;
      ingredients: {
        id: string;
        name: string;
      };
    }[];
  };
}

interface PantryItem {
  id: string;
  name: string;
  ingredient_id: string | null;
}

interface MissingIngredient {
  ingredient_id: string | null;
  name: string;
  quantity: number;
  unit: string;
  recipeNames: string[];
  inPantry: boolean;
}

interface DateRangeOption {
  label: string;
  getDates: () => { start: string; end: string };
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    label: 'This Week (Mon-Sun)',
    getDates: () => {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
    }
  },
  {
    label: 'Next Week',
    getDates: () => {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) + 7;
      const monday = new Date(today);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
    }
  },
  {
    label: 'This Weekend (Sat-Sun)',
    getDates: () => {
      const today = new Date();
      const day = today.getDay();
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - day));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return { start: saturday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
    }
  },
  {
    label: 'Next 2 Weeks',
    getDates: () => {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today);
      monday.setDate(diff);
      const twoWeeksLater = new Date(monday);
      twoWeeksLater.setDate(monday.getDate() + 13);
      return { start: monday.toISOString().split('T')[0], end: twoWeeksLater.toISOString().split('T')[0] };
    }
  },
];

interface Props {
  userId: string;
  mealPlans: MealPlan[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MealPlanShoppingModal({ userId, mealPlans, onClose, onSuccess }: Props) {
  const [selectedRange, setSelectedRange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [missingIngredients, setMissingIngredients] = useState<MissingIngredient[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);
  const [step, setStep] = useState<'range' | 'preview'>('range');

  const dateRange = DATE_RANGE_OPTIONS[selectedRange].getDates();

  // Get recipes for selected date range
  const getRecipesForRange = async () => {
    const plansInRange = mealPlans.filter(mp => 
      mp.planned_date >= dateRange.start && mp.planned_date <= dateRange.end
    );
    
    const recipeIds = [...new Set(plansInRange.map(mp => mp.recipe_id))];
    
    if (recipeIds.length === 0) return { recipeIngredients: [], plansInRange };
    
    // Fetch recipe ingredients
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('quantity, quantity_num, unit, recipe_id, ingredients(id, name)')
      .in('recipe_id', recipeIds);
    
    return { recipeIngredients: recipeIngredients || [], plansInRange };
  };

  // Get user's pantry
  const getPantryItems = async () => {
    const { data } = await supabase
      .from('pantry_items')
      .select('name, ingredient_id')
      .eq('user_id', userId);
    
    return data || [];
  };

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      const [recipesData, pantryItems] = await Promise.all([
        getRecipesForRange(),
        getPantryItems()
      ]);
      
      if (!recipesData || recipesData.recipeIngredients.length === 0) {
        setMissingIngredients([]);
        setLoading(false);
        return;
      }
      
      // Get recipe names for each recipe
      const recipeNamesMap = new Map<string, string>();
      for (const mp of recipesData.plansInRange) {
        if (mp.recipe && !recipeNamesMap.has(mp.recipe_id)) {
          recipeNamesMap.set(mp.recipe_id, mp.recipe.name);
        }
      }
      
      const pantryNames = new Set(pantryItems.map(p => p.name.toLowerCase()));
      const pantryIngredientIds = new Set(pantryItems.map(p => p.ingredient_id).filter(Boolean));
      
      // Prepare ingredients for consolidation
      const ingredientsToConsolidate = (recipesData.recipeIngredients as any[]).map((ri: any) => ({
        ingredient_id: ri.ingredients?.id || null,
        item_name: ri.ingredients?.name || '',
        quantity: ri.quantity_num || 1,
        unit: ri.unit || 'piece',
        _recipe_id: ri.recipe_id, // extra field for tracking
      }));
      
      // Use consolidation utility to combine same ingredients
      const consolidated = consolidateIngredients(
        ingredientsToConsolidate.map(i => ({
          ingredient_id: i.ingredient_id,
          item_name: i.item_name,
          quantity: i.quantity.toString(),
          unit: i.unit,
        }))
      );
      
      // Build aggregated map with recipe tracking
      const aggregated = new Map<string, MissingIngredient>();
      
      for (const ri of recipesData.recipeIngredients as any[]) {
        const ingName = ri.ingredients?.name;
        if (!ingName) continue;
        
        const key = ingName.toLowerCase();
        const recipeName = recipeNamesMap.get(ri.recipe_id) || 'Recipe';
        const inPantry = pantryNames.has(key) || pantryIngredientIds.has(ri.ingredients?.id);
        
        if (aggregated.has(key)) {
          const existing = aggregated.get(key)!;
          existing.quantity += ri.quantity_num || 1;
          if (!existing.recipeNames.includes(recipeName)) {
            existing.recipeNames.push(recipeName);
          }
        } else {
          aggregated.set(key, {
            ingredient_id: ri.ingredients?.id || null,
            name: ingName,
            quantity: ri.quantity_num || 1,
            unit: ri.unit || '',
            recipeNames: [recipeName],
            inPantry
          });
        }
      }
      
      // Filter to only missing (not in pantry)
      const missing = Array.from(aggregated.values())
        .filter(item => !item.inPantry)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setMissingIngredients(missing);
      setSelectedItems(new Set(missing.map(m => m.name)));
      setStep('preview');
    } catch (error) {
      console.error('Error generating list:', error);
    }
    
    setLoading(false);
  };

  const handleAddToList = async () => {
    setLoading(true);
    
    try {
      const itemsToAdd = missingIngredients.filter(m => selectedItems.has(m.name));
      
      // Get date range and find all meal plan IDs in range
      const dateRange = DATE_RANGE_OPTIONS[selectedRange].getDates();
      const plansInRange = mealPlans.filter(mp => 
        mp.planned_date >= dateRange.start && mp.planned_date <= dateRange.end
      );
      const mealPlanIds = plansInRange.map(p => p.id);
      
      // Fetch existing shopping list items to check for consolidation
      const { data: existingItems } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', userId)
        .eq('is_checked', false);
      
      const existingShoppingList = existingItems || [];
      
      // Build a lookup map for existing items by ingredient key
      const existingByKey = new Map();
      for (const item of existingShoppingList) {
        const key = item.ingredient_id 
          ? `id:${item.ingredient_id}` 
          : `name:${item.item_name.toLowerCase().trim()}`;
        
        if (!existingByKey.has(key)) {
          existingByKey.set(key, []);
        }
        existingByKey.get(key).push(item);
      }
      
      // Process each item - consolidate or insert
      const contributions = []; // Track for meal_plan_shopping_contributions
      
      for (const item of itemsToAdd) {
        const key = item.ingredient_id 
          ? `id:${item.ingredient_id}` 
          : `name:${item.name.toLowerCase().trim()}`;
        
        // Find matching existing item with same unit
        const candidates = existingByKey.get(key) || [];
        const matchingItem = candidates.find((c: any) => 
          unitsMatch(c.unit, item.unit)
        );
        
        if (matchingItem) {
          // Combine with existing - update quantity
          const existingQty = normalizeQuantity(matchingItem.quantity);
          const newQty = existingQty + item.quantity;
          
          await supabase
            .from('shopping_list')
            .update({ quantity: newQty.toString() })
            .eq('id', matchingItem.id);
          
          // Track contribution for each meal plan that contributed this ingredient
          for (const mp of plansInRange) {
            const { data: recipeIng } = await supabase
              .from('recipe_ingredients')
              .select('quantity_num')
              .eq('recipe_id', mp.recipe_id)
              .eq('ingredient_id', item.ingredient_id)
              .maybeSingle();
            
            if (recipeIng) {
              contributions.push({
                meal_plan_id: mp.id,
                shopping_list_id: matchingItem.id,
                ingredient_id: item.ingredient_id,
                quantity_contributed: recipeIng.quantity_num || 1,
              });
            }
          }
        } else {
          // Insert new item
          const { data: newItem } = await supabase
            .from('shopping_list')
            .insert({
              user_id: userId,
              item_name: item.name,
              quantity: item.quantity.toString(),
              unit: item.unit,
              is_checked: false,
              ingredient_id: item.ingredient_id,
            })
            .select()
            .single();
          
          if (newItem) {
            // Track contribution for each meal plan
            for (const mp of plansInRange) {
              const { data: recipeIng } = await supabase
                .from('recipe_ingredients')
                .select('quantity_num')
                .eq('recipe_id', mp.recipe_id)
                .eq('ingredient_id', item.ingredient_id)
                .maybeSingle();
              
              if (recipeIng) {
                contributions.push({
                  meal_plan_id: mp.id,
                  shopping_list_id: newItem.id,
                  ingredient_id: item.ingredient_id,
                  quantity_contributed: recipeIng.quantity_num || 1,
                });
              }
            }
          }
        }
      }
      
      // Save contributions to track recipe -> shopping_list mappings
      if (contributions.length > 0) {
        await supabase.from('meal_plan_shopping_contributions').insert(contributions);
      }
      
      // Mark all meal plans in this date range as processed
      if (mealPlanIds.length > 0) {
        await supabase
          .from('meal_plans')
          .update({ shopping_list_added: true })
          .in('id', mealPlanIds);
      }
      
      setAdded(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error adding to list:', error);
    }
    
    setLoading(false);
  };

  const toggleItem = (name: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === missingIngredients.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(missingIngredients.map(m => m.name)));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add to Shopping List
          </DialogTitle>
        </DialogHeader>
        
        {step === 'range' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date Range</label>
              <div className="space-y-2">
                {DATE_RANGE_OPTIONS.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedRange === idx ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedRange(idx)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Shopping List'
              )}
            </Button>
          </div>
        )}
        
        {step === 'preview' && (
          <div className="space-y-4">
            {missingIngredients.length === 0 ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold">You have everything!</p>
                <p className="text-sm text-muted-foreground">
                  All ingredients for this period are in your pantry.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedItems.size} of {missingIngredients.length} items selected
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={toggleSelectAll}
                  >
                    {selectedItems.size === missingIngredients.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="space-y-1 max-h-60 overflow-auto border rounded-lg p-2">
                  {missingIngredients.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded"
                    >
                      <Checkbox
                        checked={selectedItems.has(item.name)}
                        onCheckedChange={() => toggleItem(item.name)}
                      />
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({item.quantity} {item.unit})
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.recipeNames[0]}
                        {item.recipeNames.length > 1 && ` +${item.recipeNames.length - 1}`}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleAddToList} 
                  disabled={loading || selectedItems.size === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : added ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added!
                    </>
                  ) : (
                    `Add ${selectedItems.size} Items to Shopping List`
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setStep('range')}
                  className="w-full"
                >
                  Change Date Range
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
