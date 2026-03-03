/**
 * MealMash Seed Script - 350 Unique Recipes Generator
 * Creates 350 recipes: 100 Breakfast, 100 Lunch, 100 Dinner, 25 Snacks, 25 Desserts
 * Uses variations to generate unique recipes programmatically
 * 
 * Run: cd /home/jquijanoq/.openclaw/workspace/mealmash && node scripts/seed-350.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================
// RECIPE GENERATORS - Creates unique recipes with variations
// ============================================================

function generateBreakfast() {
  const bases = [
    'Scrambled Eggs', 'Fried Eggs', 'Poached Eggs', 'Omelette', 'French Toast', 
    'Pancakes', 'Waffles', 'Bagel', 'Toast', 'Oatmeal', 'Smoothie Bowl',
    'Parfait', 'Muffins', 'Breakfast Burrito', 'Quesadilla', 'Casserole',
    'Quiche', 'Frittata', 'Strata', 'Croissant', 'Danish', 'Scone',
    'Crepe', 'Smoothie', 'Acai Bowl', 'Overnight Oats', 'Granola',
    'Congee', 'Shakshuka', 'Menemen', 'Huevos Rancheros', 'Chilaquiles'
  ]
  const styles = [
    'Classic', 'Loaded', 'Healthy', 'Spicy', 'Cheesy', 'Crispy', 'Creamy',
    'Fresh', 'Hearty', 'Light', 'Supreme', 'Deluxe', 'Garden', 'Rustic',
    'Traditional', 'Modern', 'Gourmet', 'Simple', 'Quick', 'Premium'
  ]
  const proteins = ['', 'with Bacon', 'with Sausage', 'with Ham', 'with Salmon', 'with Turkey', 'with Chorizo']
  const fruits = ['', 'with Banana', 'with Berries', 'with Apple', 'with Strawberry', 'with Blueberry', 'with Mango']
  const extras = ['', 'Extra Cheese', 'Avocado', 'Sour Cream', 'Fresh Herbs', 'Nuts', 'Seeds']
  
  let recipes = []
  let id = 1
  
  for (let i = 0; i < 100; i++) {
    const base = bases[i % bases.length]
    const style = styles[i % styles.length]
    const protein = proteins[i % proteins.length]
    const fruit = fruits[i % fruits.length]
    const extra = extras[i % extras.length]
    
    let name = style + ' ' + base
    if (protein && base.toLowerCase().includes('egg')) name += ' ' + protein
    if (fruit && (base.toLowerCase().includes('pancake') || base.toLowerCase().includes('toast') || base.toLowerCase().includes('bowl') || base.toLowerCase().includes('parfait'))) name += ' ' + fruit
    if (extra) name += ' ' + extra
    
    recipes.push({
      name: name.trim(),
      category: 'breakfast',
      prep: Math.floor(Math.random() * 15) + 5,
      cook: Math.floor(Math.random() * 20) + 5,
      servings: Math.floor(Math.random() * 3) + 2,
      instructions: generateInstructions(base)
    })
  }
  return recipes
}

function generateLunch() {
  const bases = [
    'Salad', 'Sandwich', 'Wrap', 'Soup', 'Panini', 'Pita', 'Bowl',
    'Taco', 'Burrito', 'Quesadilla', 'Club', 'Sub', 'Roll', 'Pizza',
    'Pasta Salad', 'Coleslaw', 'Potato Salad', 'Egg Salad', 'Chicken Salad', 'Tuna Salad'
  ]
  const styles = [
    'Classic', 'Grilled', 'Fresh', 'Hearty', 'Light', 'Crispy', 'Warm', 
    'Cold', 'Mediterranean', 'Asian', 'Mexican', 'Italian', 'American',
    'Garden', 'Caesar', 'Greek', 'Southwest', 'Supreme', 'Deluxe'
  ]
  const proteins = ['', 'with Chicken', 'with Beef', 'with Turkey', 'with Ham', 'with Tuna', 'with Shrimp', 'with Egg']
  const extras = ['', 'Extra Cheese', 'Avocado', 'Bacon', 'Extra Veggies', 'Pickles', 'Hot Sauce']
  
  let recipes = []
  for (let i = 0; i < 100; i++) {
    const base = bases[i % bases.length]
    const style = styles[i % styles.length]
    const protein = proteins[i % proteins.length]
    const extra = extras[i % extras.length]
    
    let name = style + ' ' + base
    if (protein) name += ' ' + protein
    if (extra) name += ' ' + extra
    
    recipes.push({
      name: name.trim(),
      category: 'lunch',
      prep: Math.floor(Math.random() * 15) + 10,
      cook: Math.floor(Math.random() * 25) + 5,
      servings: Math.floor(Math.random() * 3) + 2,
      instructions: generateInstructions(base)
    })
  }
  return recipes
}

function generateDinner() {
  const bases = [
    'Pasta', 'Rice Bowl', 'Stir Fry', 'Curry', 'Tacos', 'Burrito', 'Stew',
    'Roast', 'Grilled Chicken', 'Fish', 'Steak', 'Pork Chops', 'Meatballs',
    'Casserole', 'Lasagna', 'Enchiladas', 'Fried Rice', 'Noodles', 'Risotto',
    'Chili', 'BBQ Ribs', 'Roasted Vegetables', 'Shrimp Scampi', 'Chicken Parmesan',
    'Beef Stroganoff', 'Shepherd\'s Pie', 'Chicken Fajitas', 'Pad Thai', 'Lo Mein'
  ]
  const styles = [
    'Classic', 'Creamy', 'Spicy', 'Savory', 'Sweet', 'Tangy', 'Smoky',
    'Mediterranean', 'Asian', 'Mexican', 'Italian', 'Indian', 'French',
    'Thai', 'Chinese', 'Japanese', 'Korean', 'Greek', 'Moroccan'
  ]
  const proteins = ['Chicken', 'Beef', 'Pork', 'Shrimp', 'Salmon', 'Tofu', 'Lamb', 'Duck', 'Turkey', 'Cod']
  
  let recipes = []
  for (let i = 0; i < 100; i++) {
    const base = bases[i % bases.length]
    const style = styles[i % styles.length]
    const protein = proteins[i % proteins.length]
    
    let name = style + ' ' + protein + ' ' + base
    if (base.toLowerCase().includes('vegetable') || base.toLowerCase().includes('roast')) {
      name = style + ' ' + base
    }
    
    recipes.push({
      name: name.trim(),
      category: 'dinner',
      prep: Math.floor(Math.random() * 20) + 10,
      cook: Math.floor(Math.random() * 45) + 15,
      servings: Math.floor(Math.random() * 3) + 2,
      instructions: generateInstructions(base)
    })
  }
  return recipes
}

function generateSnacks() {
  const bases = [
    'Hummus', 'Guacamole', 'Salsa', 'Dip', 'Chips', 'Nuts', 'Trail Mix',
    'Energy Balls', 'Bruschetta', 'Caprese Skewers', 'Fruit Salad', 'Veggie Platter',
    'Cheese Board', 'Crackers', 'Popcorn', 'Smoothie', 'Toast', 'Mousse'
  ]
  const styles = [
    'Classic', 'Spicy', 'Garlic', 'Herb', 'Citrus', 'Smoky', 'Sweet', 'Tangy',
    'Loaded', 'Fresh', 'Crunchy', 'Creamy', 'Zesty', 'Mediterranean', 'Southwest'
  ]
  
  let recipes = []
  for (let i = 0; i < 25; i++) {
    const base = bases[i % bases.length]
    const style = styles[i % styles.length]
    
    recipes.push({
      name: style + ' ' + base,
      category: 'snack',
      prep: Math.floor(Math.random() * 15) + 5,
      cook: Math.floor(Math.random() * 10),
      servings: Math.floor(Math.random() * 4) + 2,
      instructions: generateInstructions(base)
    })
  }
  return recipes
}

function generateDesserts() {
  const bases = [
    'Cake', 'Pie', 'Cookies', 'Brownies', 'Mousse', 'Pudding', 'Ice Cream',
    'Cheesecake', 'Tiramisu', 'Crumble', 'Tart', 'Bars', 'Parfait', 'Cobbler',
    'Crepes', 'Fried Dessert', 'Custard', 'Gelato', 'Sorbet', 'Macarons',
    'Cupcakes', 'Muffins', 'Bread Pudding', 'Flan', 'Panna Cotta'
  ]
  const flavors = [
    'Chocolate', 'Vanilla', 'Lemon', 'Strawberry', 'Blueberry', 'Caramel',
    'Peach', 'Apple', 'Berry', 'Coconut', 'Coffee', 'Peanut Butter',
    'Almond', 'Orange', 'Raspberry', 'Mango', 'Cherry', 'Pistachio',
    'Hazelnut', 'Mint', 'Spiced', 'Classic', 'New York', 'French'
  ]
  
  let recipes = []
  for (let i = 0; i < 25; i++) {
    const base = bases[i % bases.length]
    const flavor = flavors[i % flavors.length]
    
    recipes.push({
      name: flavor + ' ' + base,
      category: 'dessert',
      prep: Math.floor(Math.random() * 25) + 15,
      cook: Math.floor(Math.random() * 45) + 15,
      servings: Math.floor(Math.random() * 4) + 4,
      instructions: generateInstructions(base)
    })
  }
  return recipes
}

function generateInstructions(base) {
  const prepMethods = {
    'Salad': ['Wash and chop vegetables', 'Make dressing', 'Combine in bowl', 'Toss gently', 'Season to taste'],
    'Sandwich': ['Toast bread if desired', 'Spread condiments', 'Layer ingredients', 'Add toppings', 'Serve'],
    'Soup': ['Sauté vegetables', 'Add broth', 'Simmer until tender', 'Season well', 'Serve hot'],
    'Pasta': ['Cook pasta al dente', 'Prepare sauce', 'Toss pasta with sauce', 'Add cheese', 'Serve immediately'],
    'Stir Fry': ['Prep all ingredients', 'Heat wok or pan', 'Stir fry protein', 'Add vegetables', 'Add sauce and serve'],
    'Curry': ['Sauté aromatics', 'Add protein and vegetables', 'Pour in coconut milk', 'Add curry paste', 'Simmer and serve'],
    'Rice Bowl': ['Cook rice', 'Prepare protein', 'Cook vegetables', 'Assemble bowl', 'Add sauce'],
    'Tacos': ['Prepare filling', 'Warm tortillas', 'Fill tortillas', 'Add toppings', 'Serve with salsa'],
    'Salmon': ['Season salmon fillet', 'Sear or bake', 'Make sauce', 'Prepare side', 'Plate and serve'],
    'Steak': ['Season steak', 'Rest at room temperature', 'Sear on high heat', 'Rest before slicing', 'Slice and serve'],
    'Chicken': ['Season chicken', 'Cook to internal temp', 'Rest chicken', 'Make sauce', 'Slice and serve'],
    'Cookies': ['Cream butter and sugar', 'Mix in dry ingredients', 'Fold in extras', 'Scoop and bake', 'Cool on rack'],
    'Cake': ['Cream butter and sugar', 'Add eggs and vanilla', 'Mix dry and wet', 'Bake at 350°F', 'Cool and frost'],
    'Pie': ['Make and chill dough', 'Prepare filling', 'Assemble pie', 'Bake until golden', 'Cool before serving'],
    'Mousse': ['Melt chocolate', 'Whip cream', 'Fold together', 'Chill until set', 'Serve with topping'],
    'Pudding': ['Mix dry ingredients', 'Cook with milk', 'Stir until thick', 'Chill', 'Serve with cream'],
    'Hummus': ['Blend chickpeas', 'Add tahini and lemon', 'Season with garlic', 'Drizzle with oil', 'Serve with pita'],
    'Guacamole': ['Mash avocados', 'Add lime juice', 'Mix in onion and tomato', 'Season with cilantro', 'Serve with chips'],
    'Smoothie': ['Add frozen fruit', 'Pour in liquid', 'Blend until smooth', 'Add sweetener if needed', 'Pour and serve'],
    'Parfait': ['Layer yogurt', 'Add granola', 'Top with fruit', 'Drizzle with honey', 'Serve immediately'],
    'Bowl': ['Cook grain', 'Add protein', 'Add vegetables', 'Add sauce', 'Mix and eat'],
  }
  
  const defaultInstructions = ['Prepare ingredients', 'Cook or assemble', 'Season to taste', 'Plate nicely', 'Serve']
  
  for (const key in prepMethods) {
    if (base.toLowerCase().includes(key.toLowerCase())) {
      return prepMethods[key]
    }
  }
  return defaultInstructions
}

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function seedRecipes() {
  console.log('🍳 Generating 350 unique recipes...')
  
  const allRecipes = [
    ...generateBreakfast(),
    ...generateLunch(),
    ...generateDinner(),
    ...generateSnacks(),
    ...generateDesserts()
  ]
  
  console.log(`✅ Generated ${allRecipes.length} recipes`)
  console.log(`   - Breakfast: ${allRecipes.filter(r => r.category === 'breakfast').length}`)
  console.log(`   - Lunch: ${allRecipes.filter(r => r.category === 'lunch').length}`)
  console.log(`   - Dinner: ${allRecipes.filter(r => r.category === 'dinner').length}`)
  console.log(`   - Snacks: ${allRecipes.filter(r => r.category === 'snack').length}`)
  console.log(`   - Desserts: ${allRecipes.filter(r => r.category === 'dessert').length}`)
  
  console.log('\n📡 Connecting to Supabase...')
  
  // First, ensure ingredients exist
  console.log('📦 Checking ingredients table...')
  const { data: existingIngredients } = await supabase
    .from('ingredients')
    .select('name')
    .limit(1)
  
  if (!existingIngredients) {
    console.log('⚠️ No ingredients found. Please run seed-ingredients.sql first.')
    return
  }
  
  console.log('✅ Ingredients table ready')
  
  // Insert recipes
  console.log('\n📝 Inserting recipes into database...')
  
  let successCount = 0
  let errorCount = 0
  
  // Batch insert for efficiency
  const batchSize = 50
  for (let i = 0; i < allRecipes.length; i += batchSize) {
    const batch = allRecipes.slice(i, i + batchSize)
    
    const recipeData = batch.map(r => ({
      name: r.name,
      description: `${r.name} - delicious homemade recipe`,
      ingredients: JSON.stringify([]), // Can be populated later with recipe_ingredients
      instructions: r.instructions,
      category: r.category,
      prep_time_minutes: r.prep,
      cook_time_minutes: r.cook,
      servings: r.servings,
      image_url: ''
    }))
    
    const { error } = await supabase
      .from('recipes')
      .insert(recipeData)
    
    if (error) {
      console.error('❌ Error inserting batch:', error.message)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`   Inserted ${Math.min(i + batchSize, allRecipes.length)}/${allRecipes.length}`)
    }
  }
  
  console.log(`\n✅ Seed complete!`)
  console.log(`   Successful: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  
  // Show final counts
  const { count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📊 Total recipes in database: ${count}`)
}

// Run the seed
seedRecipes()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
