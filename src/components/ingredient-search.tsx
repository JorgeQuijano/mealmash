"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Ingredient = {
  id: string
  name: string
  category: string
}

type SelectedIngredient = {
  ingredient_id: string
  name: string
  quantity: string
  unit: string
  category: string
}

const UNITS = ["", "cups", "tbsp", "tsp", "oz", "lb", "g", "kg", "ml", "L", "pieces", "cloves", "slices", "whole"]

const CATEGORIES = ["produce", "dairy", "meat", "pantry", "frozen", "bakery", "other"]

interface IngredientSearchProps {
  selectedIngredients: SelectedIngredient[]
  onChange: (ingredients: SelectedIngredient[]) => void
}

export default function IngredientSearch({ selectedIngredients, onChange }: IngredientSearchProps) {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Ingredient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newIngredientName, setNewIngredientName] = useState("")
  const [newIngredientCategory, setNewIngredientCategory] = useState("other")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search ingredients as user types
  useEffect(() => {
    async function searchIngredients() {
      if (search.length < 2) {
        setResults([])
        return
      }
      
      setLoading(true)
      const { data } = await supabase
        .from("ingredients")
        .select("id, name, category")
        .ilike("name", `%${search}%`)
        .limit(10)
      
      setResults(data || [])
      setLoading(false)
    }

    const timeout = setTimeout(searchIngredients, 300)
    return () => clearTimeout(timeout)
  }, [search])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function selectIngredient(ingredient: Ingredient) {
    const newItem: SelectedIngredient = {
      ingredient_id: ingredient.id,
      name: ingredient.name,
      quantity: "",
      unit: "",
      category: ingredient.category
    }
    onChange([...selectedIngredients, newItem])
    
    // Set input to show selected ingredient name (as tag)
    if (inputRef.current) {
      inputRef.current.value = ingredient.name
    }
    setSearch(ingredient.name)
    setResults([])
    setShowDropdown(false)
  }

  async function createAndAddIngredient() {
    if (!newIngredientName.trim()) return

    // Check if ingredient already exists
    const { data: existing } = await supabase
      .from("ingredients")
      .select("id, name, category")
      .ilike("name", newIngredientName.trim())
      .limit(1)

    if (existing && existing.length > 0) {
      selectIngredient(existing[0])
      return
    }

    // Create new ingredient
    const { data: newIng, error } = await supabase
      .from("ingredients")
      .insert({ name: newIngredientName.trim(), category: newIngredientCategory })
      .select("id, name, category")
      .single()

    if (error) {
      alert("Error creating ingredient: " + error.message)
      return
    }

    selectIngredient(newIng)
    setNewIngredientName("")
    setShowNewForm(false)
  }

  function updateIngredient(index: number, field: keyof SelectedIngredient, value: string) {
    const updated = [...selectedIngredients]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  function removeIngredient(index: number) {
    const updated = selectedIngredients.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search ingredients..."
          className="w-full"
        />
        
        {/* Dropdown Results */}
        {showDropdown && search.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">Searching...</div>
            ) : results.length > 0 ? (
              results.map((ing) => (
                <div
                  key={ing.id}
                  onClick={() => selectIngredient(ing)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between cursor-pointer"
                >
                  <span>{ing.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{ing.category}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground">No ingredients found</div>
            )}
            
            {/* Create New Option */}
            <div
              onClick={() => {
                setShowNewForm(true)
                setShowDropdown(false)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-primary border-t cursor-pointer"
            >
              + Create "{search}"
            </div>
          </div>
        )}
      </div>

      {/* New Ingredient Form */}
      {showNewForm && (
        <div className="bg-muted p-3 rounded-md space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              placeholder="Ingredient name"
              className="flex-1"
            />
            <select
              value={newIngredientCategory}
              onChange={(e) => setNewIngredientCategory(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={createAndAddIngredient}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Ingredients:</label>
          {selectedIngredients.map((ing, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
              <span className="flex-1 text-sm font-medium">{ing.name}</span>
              <Input
                value={ing.quantity}
                onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                placeholder="Qty"
                className="w-20 h-8"
              />
              <select
                value={ing.unit}
                onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u || "Unit"}</option>
                ))}
              </select>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeIngredient(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
