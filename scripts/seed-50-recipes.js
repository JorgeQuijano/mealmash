import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 50 Real Recipes - 10 per category
const recipes = [
  // ========== BREAKFAST (10) ==========
  {
    name: "Classic French Toast",
    description: "Crispy on the outside, soft on the inside French toast",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 10,
    servings: 4,
    instructions: ["Whisk eggs, milk, vanilla, and cinnamon", "Heat butter in skillet", "Dip bread in egg mixture", "Cook until golden, 2-3 min per side", "Serve with maple syrup"]
  },
  {
    name: "Veggie Omelette",
    description: "Fluffy omelette with fresh vegetables and cheese",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    servings: 1,
    instructions: ["Beat eggs with milk, salt, pepper", "Sauté bell peppers, onions, mushrooms", "Pour eggs over vegetables", "Cook until edges set, fold in half", "Serve with toast"]
  },
  {
    name: "Breakfast Burrito",
    description: "Hearty burrito with eggs, beans, cheese, and salsa",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 2,
    instructions: ["Brown sausage in skillet", "Scramble eggs with sausage", "Warm tortillas", "Layer eggs, beans, cheese, salsa", "Roll up tightly"]
  },
  {
    name: "Blueberry Pancakes",
    description: "Fluffy pancakes with fresh blueberries",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: ["Mix flour, sugar, baking powder, salt", "Whisk milk, egg, butter", "Fold in blueberries", "Cook on griddle until bubbles form", "Flip and serve"]
  },
  {
    name: "Avocado Toast",
    description: "Toasted bread topped with mashed avocado",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 3,
    servings: 2,
    instructions: ["Toast sourdough bread", "Mash avocado with lemon, salt, pepper", "Spread on toast", "Top with eggs or tomato", "Season with red pepper flakes"]
  },
  {
    name: "Overnight Oats",
    description: "Creamy no-cook oats prepared the night before",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    instructions: ["Combine oats, milk, yogurt, chia seeds", "Add honey and vanilla", "Refrigerate overnight", "Top with berries and nuts", "Enjoy cold or heated"]
  },
  {
    name: "Shakshuka",
    description: "Middle Eastern poached eggs in spiced tomato sauce",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    instructions: ["Sauté onions, garlic, peppers in olive oil", "Add tomatoes, cumin, paprika", "Simmer until thick", "Crack eggs into sauce", "Cover until eggs set"]
  },
  {
    name: "Smoked Salmon Bagel",
    description: "Classic lox and bagel with cream cheese and capers",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 1,
    instructions: ["Toast bagel", "Spread cream cheese", "Layer smoked salmon", "Add red onion, capers, dill", "Squeeze lemon over top"]
  },
  {
    name: "Biscuits and Gravy",
    description: "Fluffy biscuits with creamy sausage gravy",
    category: "breakfast",
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 4,
    instructions: ["Make and bake biscuits", "Brown sausage", "Add flour, stir", "Pour in milk, simmer until thick", "Ladle gravy over biscuits"]
  },
  {
    name: "Berry Parfait",
    description: "Layered yogurt, granola, and fresh berries",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    instructions: ["Layer yogurt in glass", "Add granola layer", "Top with berries", "Repeat layers", "Drizzle with honey"]
  },

  // ========== LUNCH (10) ==========
  {
    name: "Chicken Caesar Salad",
    description: "Classic Caesar salad with grilled chicken",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 2,
    instructions: ["Season and grill chicken", "Slice chicken", "Toss lettuce with Caesar dressing", "Add parmesan and croutons", "Top with chicken"]
  },
  {
    name: "Tomato Basil Soup",
    description: "Creamy roasted tomato soup with fresh basil",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    servings: 4,
    instructions: ["Roast tomatoes with garlic", "Sauté onions in butter", "Add tomatoes and broth", "Blend until smooth", "Stir in cream, garnish with basil"]
  },
  {
    name: "Club Sandwich",
    description: "Triple-decker sandwich with turkey, bacon",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 5,
    servings: 1,
    instructions: ["Toast three bread slices", "Cook bacon until crispy", "Layer turkey, bacon, lettuce, tomato", "Secure with toothpicks", "Cut diagonally"]
  },
  {
    name: "Chicken Wrap",
    description: "Flour tortilla with grilled chicken and veggies",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 10,
    servings: 2,
    instructions: ["Grill and slice chicken", "Spread hummus on tortilla", "Add greens, cucumber, tomato", "Place chicken in center", "Roll tightly"]
  },
  {
    name: "Greek Salad",
    description: "Fresh Mediterranean salad with feta and olives",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    servings: 2,
    instructions: ["Chop tomatoes, cucumber, onion", "Add olives and peppers", "Crumble feta over top", "Drizzle with olive oil", "Season with oregano"]
  },
  {
    name: "BLT Sandwich",
    description: "Classic bacon, lettuce, and tomato sandwich",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    servings: 1,
    instructions: ["Cook bacon until crispy", "Toast bread", "Spread mayo", "Layer lettuce, tomato, bacon", "Top with toast"]
  },
  {
    name: "Minestrone Soup",
    description: "Hearty Italian vegetable soup with pasta",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 35,
    servings: 6,
    instructions: ["Sauté carrots, celery, onion", "Add tomatoes and broth", "Add beans and pasta", "Add zucchini and greens", "Season with Italian herbs"]
  },
  {
    name: "Cobb Salad",
    description: "American classic with chicken, bacon, egg, avocado",
    category: "lunch",
    prep_time_minutes: 20,
    cook_time_minutes: 10,
    servings: 4,
    instructions: ["Grill and slice chicken", "Cook bacon, crumble", "Hard boil eggs, quarter", "Arrange greens, top with rows", "Serve with blue cheese dressing"]
  },
  {
    name: "Lentil Soup",
    description: "Hearty and healthy lentil soup",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 40,
    servings: 6,
    instructions: ["Sauté carrots, celery, onion", "Add lentils and tomatoes", "Add broth and spices", "Simmer until tender", "Season with lemon"]
  },
  {
    name: "Tuna Salad Wrap",
    description: "Light tuna salad in spinach tortilla",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 2,
    instructions: ["Mix tuna with yogurt, celery, onion", "Season with lemon and dill", "Spread on tortilla", "Add arugula", "Roll up tightly"]
  },

  // ========== DINNER (10) ==========
  {
    name: "Spaghetti Bolognese",
    description: "Classic Italian pasta with rich meat sauce",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 45,
    servings: 4,
    instructions: ["Brown beef with onions and garlic", "Add tomatoes, paste, herbs", "Simmer 30 minutes", "Cook spaghetti", "Serve with parmesan"]
  },
  {
    name: "Grilled Salmon",
    description: "Perfectly grilled salmon with lemon and herbs",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 12,
    servings: 4,
    instructions: ["Season salmon with oil, salt, pepper", "Preheat grill", "Grill skin-side down 4-5 min", "Flip and cook 3-4 min", "Squeeze lemon over top"]
  },
  {
    name: "Chicken Stir Fry",
    description: "Quick Asian-style chicken with vegetables",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 4,
    instructions: ["Slice chicken into strips", "Make stir fry sauce", "Stir fry chicken, set aside", "Stir fry vegetables", "Return chicken, add sauce"]
  },
  {
    name: "Beef Tacos",
    description: "Seasoned ground beef tacos with toppings",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 4,
    instructions: ["Brown ground beef", "Add taco seasoning", "Warm taco shells", "Fill with beef", "Top with lettuce, tomato, cheese"]
  },
  {
    name: "Mushroom Risotto",
    description: "Creamy Italian rice with mixed mushrooms",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    servings: 4,
    instructions: ["Sauté mushrooms, set aside", "Sauté onion", "Add rice, toast 2 min", "Add broth one ladle at a time", "Fold in mushrooms and parmesan"]
  },
  {
    name: "Vegetable Curry",
    description: "Flavorful Indian-style vegetable curry",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    servings: 4,
    instructions: ["Sauté onion, garlic, ginger", "Add curry powder and turmeric", "Add vegetables and chickpeas", "Pour in coconut milk", "Simmer until tender, serve with rice"]
  },
  {
    name: "Lemon Herb Chicken",
    description: "Pan-seared chicken with lemon and herbs",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    instructions: ["Pound chicken thin", "Season with salt, pepper, herbs", "Sear in olive oil", "Add broth and lemon juice", "Simmer until cooked through"]
  },
  {
    name: "Shrimp Scampi",
    description: "Garlic butter shrimp over linguine",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: ["Cook pasta", "Sauté shrimp in garlic butter", "Add white wine and lemon", "Toss with pasta", "Garnish with parsley"]
  },
  {
    name: "Chicken Parmesan",
    description: "Breaded chicken with marinara and mozzarella",
    category: "dinner",
    prep_time_minutes: 20,
    cook_time_minutes: 25,
    servings: 4,
    instructions: ["Pound chicken thin", "Bread with flour, egg, crumbs", "Pan fry until golden", "Top with sauce and cheese", "Broil until cheese melts"]
  },
  {
    name: "Baked Ziti",
    description: "Cheesy baked pasta casserole",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    servings: 8,
    instructions: ["Cook ziti until al dente", "Mix with marinara and ricotta", "Pour into baking dish", "Top with mozzarella", "Bake until bubbly"]
  },

  // ========== SNACK (10) ==========
  {
    name: "Fresh Guacamole",
    description: "Homemade avocado dip with lime and cilantro",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 4,
    instructions: ["Mash avocados", "Add onion, tomato, jalapeño", "Squeeze in lime juice", "Add cilantro, salt, cumin", "Serve with chips"]
  },
  {
    name: "Classic Hummus",
    description: "Smooth Middle Eastern chickpea dip",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 6,
    instructions: ["Blend chickpeas with tahini", "Add lemon juice and garlic", "Add olive oil", "Season with cumin and salt", "Drizzle with oil, serve with pita"]
  },
  {
    name: "Homemade Trail Mix",
    description: "Mix of nuts, seeds, and dried fruit",
    category: "snack",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 8,
    instructions: ["Combine almonds, cashews, peanuts", "Add pumpkin and sunflower seeds", "Mix in dried cranberries, raisins", "Add chocolate chips if desired", "Store in airtight container"]
  },
  {
    name: "No-Bake Energy Balls",
    description: "Protein balls with oats and peanut butter",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    servings: 12,
    instructions: ["Mix oats, peanut butter, honey", "Add chocolate chips and flax", "Roll into small balls", "Refrigerate 30 minutes", "Store in fridge"]
  },
  {
    name: "Bruschetta",
    description: "Italian tomato and basil on toasted bread",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 5,
    servings: 6,
    instructions: ["Dice tomatoes, mix with basil, garlic, oil", "Season with balsamic and salt", "Let marinate", "Toast baguette", "Top toast with tomato mixture"]
  },
  {
    name: "Caprese Skewers",
    description: "Mini skewers with mozzarella, tomatoes, basil",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 8,
    instructions: ["Cut tomatoes in half", "Cut mozzarella into cubes", "Thread tomato, basil, mozzarella", "Drizzle with balsamic glaze", "Season with salt and pepper"]
  },
  {
    name: "Spinach Artichoke Dip",
    description: "Creamy warm dip with spinach and artichokes",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    servings: 8,
    instructions: ["Drain spinach and artichokes", "Mix with cream cheese, sour cream", "Add garlic and cheeses", "Bake at 350°F for 25 min", "Serve with chips or bread"]
  },
  {
    name: "Fruit Salsa",
    description: "Fresh tropical fruit salsa with cinnamon chips",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    servings: 6,
    instructions: ["Dice mango, pineapple, strawberries", "Add kiwi and red onion", "Mix with lime juice and cilantro", "Serve with cinnamon tortilla chips", "Enjoy immediately"]
  },
  {
    name: "Deviled Eggs",
    description: "Classic deviled eggs with paprika",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 12,
    servings: 6,
    instructions: ["Hard boil eggs, cool, peel", "Halve eggs, remove yolks", "Mash yolks with mayo, mustard, salt", "Pipe filling back into whites", "Sprinkle with paprika"]
  },
  {
    name: "Stuffed Mushrooms",
    description: "Cream cheese stuffed mushroom caps",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 8,
    instructions: ["Remove mushroom stems", "Mix cream cheese, garlic, herbs", "Stuff mushroom caps", "Bake at 375°F for 20 min", "Serve warm"]
  },

  // ========== DESSERT (10) ==========
  {
    name: "Chocolate Chip Cookies",
    description: "Classic homemade chocolate chip cookies",
    category: "dessert",
    prep_time_minutes: 15,
    cook_time_minutes: 11,
    servings: 48,
    instructions: ["Cream butter and sugars", "Beat in eggs and vanilla", "Mix flour, baking soda, salt", "Combine and add chocolate chips", "Bake at 375°F for 9-11 minutes"]
  },
  {
    name: "Brownies",
    description: "Rich and fudgy chocolate brownies",
    category: "dessert",
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    servings: 16,
    instructions: ["Melt butter", "Mix in sugar, eggs, vanilla", "Add cocoa, flour, salt", "Pour into greased pan", "Bake at 350°F for 25-30 min"]
  },
  {
    name: "Banana Bread",
    description: "Moist and delicious banana bread",
    category: "dessert",
    prep_time_minutes: 15,
    cook_time_minutes: 60,
    servings: 10,
    instructions: ["Mash bananas", "Mix in butter", "Add sugar, egg, vanilla", "Add baking soda and flour", "Bake at 350°F for 55-60 min"]
  },
  {
    name: "Cheesecake",
    description: "Creamy New York style cheesecake",
    category: "dessert",
    prep_time_minutes: 30,
    cook_time_minutes: 60,
    servings: 12,
    instructions: ["Beat cream cheese and sugar", "Add eggs one at a time", "Mix in vanilla, flour, sour cream", "Pour over crust", "Bake at 325°F for 1 hour"]
  },
  {
    name: "Apple Pie",
    description: "Classic American apple pie with cinnamon",
    category: "dessert",
    prep_time_minutes: 45,
    cook_time_minutes: 50,
    servings: 8,
    instructions: ["Slice apples", "Mix with sugar and spices", "Place in crust", "Dot with butter", "Cover and bake at 425°F"]
  },
  {
    name: "Tiramisu",
    description: "Italian coffee-flavored layered dessert",
    category: "dessert",
    prep_time_minutes: 45,
    cook_time_minutes: 0,
    servings: 8,
    instructions: ["Whisk yolks with sugar", "Mix in mascarpone", "Whip egg whites, fold in", "Dip ladyfingers in coffee", "Layer with cream, dust with cocoa"]
  },
  {
    name: "Chocolate Lava Cake",
    description: "Decadent molten chocolate cake",
    category: "dessert",
    prep_time_minutes: 15,
    cook_time_minutes: 12,
    servings: 4,
    instructions: ["Melt chocolate and butter", "Mix in powdered sugar and eggs", "Add flour", "Pour into greased ramekins", "Bake at 425°F for 12 min"]
  },
  {
    name: "Carrot Cake",
    description: "Moist spiced carrot cake with cream cheese frosting",
    category: "dessert",
    prep_time_minutes: 20,
    cook_time_minutes: 35,
    servings: 12,
    instructions: ["Mix grated carrots with oil, sugar, eggs", "Add flour, baking soda, spices", "Fold in walnuts", "Bake at 350°F", "Frost with cream cheese frosting"]
  },
  {
    name: "Panna Cotta",
    description: "Italian cream dessert with berry sauce",
    category: "dessert",
    prep_time_minutes: 10,
    cook_time_minutes: 5,
    servings: 6,
    instructions: ["Heat cream with sugar and vanilla", "Dissolve gelatin in warm cream", "Pour into molds", "Chill until set", "Serve with berry sauce"]
  },
  {
    name: "Crème Brûlée",
    description: "Classic French custard with caramelized sugar",
    category: "dessert",
    prep_time_minutes: 15,
    cook_time_minutes: 45,
    servings: 6,
    instructions: ["Heat cream and vanilla", "Whisk yolks with sugar", "Combine and strain", "Bake in water bath at 325°F", "Sprinkle sugar, torch until caramelized"]
  }
]

async function seedRecipes() {
  console.log('Starting seed...')
  
  // First, ensure we have the basic ingredients
  const commonIngredients = [
    { name: 'Eggs', category: 'dairy' },
    { name: 'Milk', category: 'dairy' },
    { name: 'Butter', category: 'dairy' },
    { name: 'Cheese', category: 'dairy' },
    { name: 'Chicken', category: 'meat' },
    { name: 'Ground Beef', category: 'meat' },
    { name: 'Bacon', category: 'meat' },
    { name: 'Salmon', category: 'meat' },
    { name: 'Shrimp', category: 'meat' },
    { name: 'Pork', category: 'meat' },
    { name: 'Flour', category: 'pantry' },
    { name: 'Sugar', category: 'pantry' },
    { name: 'Salt', category: 'pantry' },
    { name: 'Pepper', category: 'pantry' },
    { name: 'Olive Oil', category: 'pantry' },
    { name: 'Garlic', category: 'produce' },
    { name: 'Onion', category: 'produce' },
    { name: 'Tomato', category: 'produce' },
    { name: 'Lettuce', category: 'produce' },
    { name: 'Avocado', category: 'produce' }
  ]

  console.log('Creating ingredients...')
  for (const ing of commonIngredients) {
    await supabase.from('ingredients').upsert(ing, { onConflict: 'name' })
  }

  console.log('Inserting recipes...')
  // Insert recipes (without ingredients for now - just the basic recipe data)
  const recipeData = recipes.map(r => ({
    name: r.name,
    description: r.description,
    category: r.category,
    instructions: r.instructions,
    prep_time_minutes: r.prep_time_minutes,
    cook_time_minutes: r.cook_time_minutes,
    servings: r.servings,
    image_url: ''
  }))

  // Insert each recipe individually to handle duplicates gracefully
  let inserted = 0
  for (const recipe of recipeData) {
    const { error } = await supabase.from('recipes').insert(recipe)
    if (!error) inserted++
  }

  console.log(`✅ Successfully seeded ${inserted} recipes!`)
  console.log('Recipe categories:')
  const counts = {}
  recipes.forEach(r => {
    counts[r.category] = (counts[r.category] || 0) + 1
  })
  Object.entries(counts).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count}`)
  })
}

seedRecipes()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err))
