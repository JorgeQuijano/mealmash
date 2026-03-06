'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Recipe {
  id: string;
  name: string;
  category: string[];
}

interface RecipeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (recipeIds: string[]) => void;
}

export default function RecipeSelector({ open, onOpenChange, onGenerate }: RecipeSelectorProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      loadRecipes();
    }
  }, [open]);

  async function loadRecipes() {
    setLoading(true);
    const { data } = await supabase
      .from('recipes')
      .select('id, name, category')
      .order('name');
    if (data) setRecipes(data);
    setLoading(false);
  }

  function toggleRecipe(id: string) {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Select Recipes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search recipes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {recipes
                .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
                .map(recipe => (
                  <div key={recipe.id} className="flex items-center gap-2">
                    <Checkbox 
                      checked={selected.includes(recipe.id)}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                    />
                    <span>{recipe.name}</span>
                  </div>
                ))}
            </div>
          )}

          <Button 
            onClick={() => onGenerate(selected)}
            disabled={selected.length === 0}
            className="w-full"
          >
            Generate List ({selected.length} recipes)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
