'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Crown, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CUISINES = [
  'Italian', 'Mexican', 'Asian', 'American', 'Indian', 
  'Mediterranean', 'French', 'Japanese', 'Thai', 'Chinese'
];

const DIETARY = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Nut-Free'
];

const DIFFICULTY = ['Easy', 'Medium', 'Hard'];

const TIME_RANGES = [
  { label: 'Under 15 min', min: 0, max: 15 },
  { label: '15-30 min', min: 15, max: 30 },
  { label: '30-60 min', min: 30, max: 60 },
  { label: 'Over 60 min', min: 60, max: 999 },
];

export interface FilterState {
  cuisine: string[];
  dietary: string[];
  timeRange: string | null;
  difficulty: string[];
}

interface RecipeFiltersProps {
  isPro: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function RecipeFilters({ isPro, filters, onFilterChange }: RecipeFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  const toggleCuisine = (cuisine: string) => {
    const newCuisine = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter(c => c !== cuisine)
      : [...filters.cuisine, cuisine];
    onFilterChange({ ...filters, cuisine: newCuisine });
  };

  const toggleDietary = (dietary: string) => {
    const newDietary = filters.dietary.includes(dietary)
      ? filters.dietary.filter(d => d !== dietary)
      : [...filters.dietary, dietary];
    onFilterChange({ ...filters, dietary: newDietary });
  };

  const toggleDifficulty = (difficulty: string) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty];
    onFilterChange({ ...filters, difficulty: newDifficulty });
  };

  const clearFilters = () => {
    onFilterChange({
      cuisine: [],
      dietary: [],
      timeRange: null,
      difficulty: [],
    });
  };

  const hasActiveFilters = filters.cuisine.length > 0 || 
                          filters.dietary.length > 0 || 
                          filters.timeRange !== null || 
                          filters.difficulty.length > 0;

  if (!isPro) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="text-center py-6 px-4">
            <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Advanced Filters are for Pro Members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unlock cuisine, dietary, cooking time, and difficulty filters
            </p>
            <Button size="sm" onClick={() => router.push('/upgrade')}>
              Upgrade to Pro - $7/month
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                Active
              </Badge>
            )}
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
              <Crown className="w-3 h-3 mr-1" /> Pro
            </Badge>
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        
        {/* Cuisine Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Cuisine</h4>
          <div className="flex flex-wrap gap-2">
            {CUISINES.slice(0, showAllCuisines ? CUISINES.length : 5).map(cuisine => (
              <Badge
                key={cuisine}
                variant={filters.cuisine.includes(cuisine) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleCuisine(cuisine)}
              >
                {cuisine}
              </Badge>
            ))}
            {CUISINES.length > 5 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowAllCuisines(!showAllCuisines)}
                className="h-auto p-0 text-xs"
              >
                {showAllCuisines ? 'Show less' : `+${CUISINES.length - 5} more`}
              </Button>
            )}
          </div>
        </div>

        {/* Dietary Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Dietary</h4>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map(diet => (
              <Badge
                key={diet}
                variant={filters.dietary.includes(diet) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleDietary(diet)}
              >
                {diet}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cooking Time Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Cooking Time</h4>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map(range => (
              <Badge
                key={range.label}
                variant={filters.timeRange === range.label ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => onFilterChange({
                  ...filters, 
                  timeRange: filters.timeRange === range.label ? null : range.label
                })}
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <h4 className="text-sm font-medium mb-2">Difficulty</h4>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY.map(diff => (
              <Badge
                key={diff}
                variant={filters.difficulty.includes(diff) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleDifficulty(diff)}
              >
                {diff}
              </Badge>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Clear all filters
          </Button>
        )}

      </CollapsibleContent>
    </Collapsible>
  );
}
