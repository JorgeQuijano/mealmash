/**
 * MealMash Seed Script - 350 Unique Recipes
 * Uses template-based generation to create 350 recipes
 * 100 Breakfast, 100 Lunch, 100 Dinner, 25 Snacks, 25 Desserts
 * 
 * Run: cd /home/jquijanoq/.openclaw/workspace/mealmash && node scripts/seed-350-recipes.js
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
// BASE INGREDIENTS - Using your existing 740+ ingredients
// ============================================================

const proteins = ['Chicken Breast', 'Ground Beef', 'Bacon', 'Salmon', 'Shrimp', 'Tofu', 'Turkey', 'Sausage', 'Tuna', 'Cod', 'Ham', 'Duck', 'Lamb', 'Pork Chop', 'Egg', 'Turkey', 'Chorizo', 'Pancetta', 'Turkey Bacon', 'Canadian Bacon', 'Prosciutto', 'Crab', 'Lobster', 'Scallop', 'Mussels', 'Chicken Thigh', 'Ground Turkey', 'Venison', 'Tilapia', 'Halibut', 'Trout', 'Catfish', 'Sea Bass', 'Mahi Mahi', 'Swordfish']

const dairy = ['Milk', 'Butter', 'Cheddar Cheese', 'Mozzarella', 'Parmesan', 'Cream Cheese', 'Sour Cream', 'Heavy Cream', 'Yogurt', 'Feta Cheese', 'Goat Cheese', 'Swiss Cheese', 'Brie', 'Ricotta', 'Gruyere', 'Monterey Jack', 'Blue Cheese', 'Cottage Cheese', 'Buttermilk', 'Half and Half', 'Mascarpone', 'Provolone', 'Pepper Jack']

const produce = ['Onion', 'Garlic', 'Tomato', 'Potato', 'Carrot', 'Bell Pepper', 'Broccoli', 'Spinach', 'Lettuce', 'Cucumber', 'Mushroom', 'Zucchini', 'Celery', 'Avocado', 'Lemon', 'Lime', 'Orange', 'Apple', 'Banana', 'Strawberry', 'Blueberry', 'Raspberry', 'Basil', 'Cilantro', 'Parsley', 'Mint', 'Rosemary', 'Thyme', 'Oregano', 'Ginger', 'Jalapeño', 'Sweet Potato', 'Corn', 'Pea', 'Green Bean', 'Asparagus', 'Cabbage', 'Cauliflower', 'Brussels Sprout', 'Kale', 'Arugula', 'Bok Choy', 'Eggplant', 'Artichoke', 'Beet', 'Radish', 'Butternut Squash', 'Pumpkin', 'Coconut', 'Mango', 'Pineapple', 'Peach', 'Pear', 'Grape', 'Watermelon', 'Kiwi', 'Cantaloupe', 'Honeydew', 'Plum', 'Cherry', 'Blackberry', 'Date', 'Fig', 'Pomegranate', 'Raisin', 'Cranberry', 'Olive', 'Pickle', 'Sun-Dried Tomato', 'Green Onion', 'Shallot', 'Leek', 'Fennel', 'Okra', 'Turnip', 'Watercress', 'Endive', 'Romaine', 'Bean Sprout', 'Snow Pea']

const grains = ['Flour', 'Rice', 'Pasta', 'Bread', 'Tortilla', 'Bread Crumb', 'Oats', 'Quinoa', 'Couscous', 'Noodle', 'Rice Noodle', 'Egg Noodle', 'Basmati Rice', 'Brown Rice', 'Arborio Rice', 'Farro', 'Barley', 'Bulgur', 'Polenta', 'Baguette', 'Ciabatta', 'Focaccia', 'Pita', 'Naan', 'Ramen', 'Soba Noodle', 'Udon', 'Lasagna', 'Penne', 'Spaghetti', 'Macaroni', 'Rigatoni', 'Fusilli', 'Orzo', 'Cappellini']

const pantry = ['Sugar', 'Brown Sugar', 'Powdered Sugar', 'Honey', 'Maple Syrup', 'Olive Oil', 'Vegetable Oil', 'Coconut Oil', 'Sesame Oil', 'Vinegar', 'Balsamic Vinegar', 'Red Wine Vinegar', 'Rice Vinegar', 'Apple Cider Vinegar', 'Soy Sauce', 'Fish Sauce', 'Oyster Sauce', 'Worcestershire Sauce', 'Hot Sauce', 'Salsa', 'Ketchup', 'Mustard', 'Mayonnaise', 'BBQ Sauce', 'Tahini', 'Peanut Butter', 'Jam', 'Almond', 'Walnut', 'Pecan', 'Cashew', 'Peanut', 'Pistachio', 'Macadamia', 'Hazelnut', 'Chia Seeds', 'Flax Seeds', 'Sunflower Seeds', 'Pumpkin Seeds', 'Sesame Seeds', 'Cocoa Powder', 'Chocolate', 'Chocolate Chips', 'Vanilla Extract', 'Baking Soda', 'Baking Powder', 'Yeast', 'Cornstarch', 'Cinnamon', 'Nutmeg', 'Cumin', 'Paprika', 'Chili Powder', 'Cayenne', 'Curry Powder', 'Turmeric', 'Garam Masala', 'Cloves', 'Allspice', 'Cardamom', 'Saffron', 'Red Pepper Flake', 'Black Pepper', 'Salt', 'Chicken Stock', 'Beef Stock', 'Vegetable Stock', 'Coconut Milk', 'Tomato Paste', 'Tomato Sauce', 'Crushed Tomato', 'Diced Tomato', 'Cannellini Beans', 'Black Beans', 'Kidney Beans', 'Chickpeas', 'Lentils', 'Black-eyed Peas', 'Navy Beans', 'Pinto Beans', 'Lima Beans']

// ============================================================
// RECIPE TEMPLATES BY CATEGORY
// ============================================================

const breakfastTemplates = [
  // Egg dishes (15)
  { name: "Classic Scrambled Eggs", prep: 5, cook: 5, servings: 2, instructions: ["Crack eggs into bowl and whisk with salt and pepper", "Heat butter in non-stick pan over medium-low heat", "Pour in eggs and let sit", "Gently push eggs from edges to center", "Continue until just set", "Remove from heat immediately"] },
  { name: "Fluffy Scrambled Eggs", prep: 5, cook: 5, servings: 2, instructions: ["Whisk eggs with milk", "Heat butter in pan", "Add eggs and stir gently", "Remove when still moist"] },
  { name: "French Omelette", prep: 10, cook: 5, servings: 1, instructions: ["Beat eggs with chives", "Heat butter in pan", "Pour eggs and stir with fork", "Roll onto plate"] },
  { name: "American Omelette", prep: 10, cook: 10, servings: 1, instructions: ["Sauté vegetables first", "Pour beaten eggs over", "Add cheese", "Fold in half"] },
  { name: "Poached Eggs", prep: 5, cook: 5, servings: 2, instructions: ["Bring water to gentle simmer", "Add splash of vinegar", "Crack egg into cup", "Slide into water", "Cook 3-4 minutes"] },
  { name: "Eggs Benedict", prep: 20, cook: 15, servings: 2, instructions: ["Make hollandaise with egg yolks and butter", "Poach eggs", "Toast English muffins", "Layer muffin, ham, poached egg", "Drizzle with hollandaise"] },
  { name: "Eggs Florentine", prep: 20, cook: 15, servings: 2, instructions: ["Make hollandaise sauce", "Sauté spinach", "Poach eggs", "Layer muffin, spinach, egg, sauce"] },
  { name: "Hard Boiled Eggs", prep: 5, cook: 12, servings: 4, instructions: ["Place eggs in cold water", "Bring to boil", "Turn off heat, cover 12 minutes", "Transfer to ice bath", "Peel and serve"] },
  { name: "Deviled Eggs", prep: 15, cook: 12, servings: 6, instructions: ["Boil eggs and cool", "Remove yolks", "Mix with mayo, mustard, salt", "Pipe filling back into whites"] },
  { name: "Egg Salad", prep: 15, cook: 0, servings: 4, instructions: ["Chop hard boiled eggs", "Mix with mayo, mustard, salt, pepper", "Add diced celery", "Serve on bread"] },
  { name: "Breakfast Casserole", prep: 20, cook: 45, servings: 8, instructions: ["Layer bread, eggs, cheese, meat", "Refrigerate overnight", "Bake at 350°F for 45 minutes"] },
  { name: "Quiche Lorraine", prep: 20, cook: 45, servings: 6, instructions: ["Prepare pie crust", "Layer bacon and cheese", "Pour egg custard over", "Bake at 375°F until set"] },
  { name: "Spinach Frittata", prep: 10, cook: 20, servings: 4, instructions: ["Sauté spinach and onions", "Beat eggs with cheese", "Pour over vegetables", "Cook stovetop, finish under broiler"] },
  { name: "Shakshuka", prep: 10, cook: 25, servings: 4, instructions: ["Sauté onions, garlic, peppers", "Add tomatoes and spices", "Simmer until thick", "Crack eggs into sauce", "Cover and cook until eggs set"] },
  { name: "Baked Eggs", prep: 5, cook: 15, servings: 2, instructions: ["Butter ramekins", "Crack eggs into dish", "Add cream and cheese", "Bake at 375°F until whites set"] },

  // Pancakes & Waffles (15)
  { name: "Classic Buttermilk Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Mix flour, baking powder, salt, sugar", "Whisk buttermilk, egg, melted butter", "Combine wet and dry", "Cook on griddle until bubbly", "Flip and cook until golden"] },
  { name: "Blueberry Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Make classic pancake batter", "Fold in fresh blueberries", "Cook on griddle", "Serve with maple syrup"] },
  { name: "Banana Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Mash ripe bananas", "Mix into pancake batter", "Cook on griddle", "Top with honey"] },
  { name: "Apple Cinnamon Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Dice apples", "Mix into batter with cinnamon", "Cook on griddle", "Serve with warm maple syrup"] },
  { name: "Pumpkin Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Add pumpkin puree to batter", "Mix in cinnamon and nutmeg", "Cook on griddle"] },
  { name: "Chocolate Chip Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Fold chocolate chips into batter", "Cook on griddle", "Top with whipped cream"] },
  { name: "Oatmeal Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Blend oats into flour", "Make batter", "Cook until golden"] },
  { name: "Cornmeal Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Add cornmeal to batter", "Cook until crispy outside"] },
  { name: "Whole Wheat Pancakes", prep: 10, cook: 15, servings: 4, instructions: ["Use whole wheat flour", "Add honey", "Cook on griddle"] },
  { name: "Classic Waffles", prep: 10, cook: 15, servings: 4, instructions: ["Make waffle batter", "Cook in waffle iron", "Serve with butter and syrup"] },
  { name: "Belgian Waffles", prep: 15, cook: 15, servings: 4, instructions: ["Make yeast batter", "Let rise 15 minutes", "Cook in iron"] },
  { name: "Chocolate Waffles", prep: 10, cook: 15, servings: 4, instructions: ["Add cocoa to batter", "Cook in iron", "Top with cream"] },
  { name: "Banana Waffles", prep: 10, cook: 15, servings: 4, instructions: ["Mash banana into batter", "Cook in iron"] },
  { name: "Berry Waffles", prep: 10, cook: 15, servings: 4, instructions: ["Fold mixed berries into batter", "Cook in iron"] },
  { name: "Bacon Waffles", prep: 10, cook: 15, servings: 4, instructions: ["Crumble cooked bacon into batter", "Cook in iron"] },

  // Toast & Sandwiches (15)
  { name: "Avocado Toast", prep: 5, cook: 3, servings: 1, instructions: ["Toast bread until golden", "Mash avocado with lime, salt, pepper", "Spread on toast"] },
  { name: "Avocado Toast with Egg", prep: 5, cook: 5, servings: 1, instructions: ["Make avocado toast", "Top with fried or poached egg"] },
  { name: "Avocado Toast with Salmon", prep: 5, cook: 3, servings: 1, instructions: ["Make avocado toast", "Top with smoked salmon"] },
  { name: "Avocado Toast with Tomato", prep: 5, cook: 3, servings: 1, instructions: ["Make avocado toast", "Add sliced tomatoes"] },
  { name: "Peanut Butter Toast", prep: 2, cook: 2, servings: 1, instructions: ["Toast bread", "Spread peanut butter"] },
  { name: "PB and Banana Toast", prep: 5, cook: 3, servings: 1, instructions: ["Spread peanut butter", "Add banana slices", "Drizzle with honey"] },
  { name: "PB and Jelly Toast", prep: 5, cook: 3, servings: 1, instructions: ["Spread peanut butter", "Add your favorite jelly"] },
  { name: "Cream Cheese Bagel", prep: 5, cook: 5, servings: 1, instructions: ["Toast bagel", "Spread cream cheese"] },
  { name: "Lox and Cream Cheese", prep: 5, cook: 5, servings: 1, instructions: ["Toast bagel", "Spread cream cheese", "Layer smoked salmon", "Add capers and onion"] },
  { name: "French Toast", prep: 10, cook: 10, servings: 4, instructions: ["Whisk eggs, milk, vanilla, cinnamon", "Dip bread slices", "Cook in butter until golden", "Serve with syrup"] },
  { name: "Cinnamon Roll French Toast", prep: 10, cook: 10, servings: 4, instructions: ["Make French toast batter", "Add extra cinnamon", "Cook until golden", "Top with cream cheese glaze"] },
  { name: "Brioche French Toast", prep: 10, cook: 10, servings: 4, instructions: ["Use thick brioche slices", "Dip in egg mixture", "Cook slowly", "Serve with berries"] },
  { name: "Breakfast Sandwich", prep: 10, cook: 10, servings: 1, instructions: ["Toast English muffin", "Cook egg and bacon", "Layer with cheese", "Add tomato if desired"] },
  { name: "Breakfast Burrito", prep: 15, cook: 15, servings: 2, instructions: ["Scramble eggs with sausage", "Warm tortillas", "Roll with beans, cheese, salsa"] },
  { name: "Breakfast Quesadilla", prep: 10, cook: 10, servings: 2, instructions: ["Fill tortilla with eggs and cheese", "Cook until crispy", "Serve with salsa"] },

  // Oatmeal & Grains (15)
  { name: "Classic Oatmeal", prep: 5, cook: 10, servings: 2, instructions: ["Bring water and milk to boil", "Add oats", "Cook 5 minutes", "Add toppings"] },
  { name: "Steel Cut Oats", prep: 5, cook: 30, servings: 4, instructions: ["Bring water to boil", "Add oats", "Simmer 25 minutes", "Stir occasionally"] },
  { name: "Overnight Oats", prep: 5, cook: 0, servings: 1, instructions: ["Mix oats, milk, yogurt", "Add honey and chia seeds", "Refrigerate overnight", "Top with fruit"] },
  { name: "Banana Oatmeal", prep: 5, cook: 10, servings: 2, instructions: ["Cook oatmeal", "Top with sliced banana", "Add honey and walnuts"] },
  { name: "Berry Oatmeal", prep: 5, cook: 10, servings: 2, instructions: ["Cook oatmeal", "Top with mixed berries", "Drizzle with honey"] },
  { name: "Apple Cinnamon Oatmeal", prep: 5, cook: 10, servings: 2, instructions: ["Cook oatmeal", "Add diced apple", "Sprinkle with cinnamon"] },
  { name: "Peanut Butter Oatmeal", prep: 5, cook: 10, servings: 2, instructions: ["Cook oatmeal", "Stir in peanut butter", "Top with banana"] },
  { name: "Cream of Wheat", prep: 5, cook: 10, servings: 2, instructions: ["Bring milk to simmer", "Add cream of wheat", "Cook until thick", "Add butter and sugar"] },
  { name: "Grits", prep: 5, cook: 20, servings: 4, instructions: ["Bring water to boil", "Add grits", "Cook 15-20 minutes", "Add butter and cheese"] },
  { name: "Shrimp and Grits", prep: 15, cook: 25, servings: 4, instructions: ["Cook grits", "Sauté shrimp with garlic", "Add bacon grease", "Serve over grits"] },
  { name: "Congee", prep: 5, cook: 60, servings: 4, instructions: ["Cook rice in lots of water", "Simmer until creamy", "Serve with soy sauce and ginger"] },
  { name: "Rice Pudding", prep: 5, cook: 30, servings: 4, instructions: ["Cook rice in milk", "Add sugar and vanilla", "Stir until thick", "Serve warm or cold"] },
  { name: "Muesli", prep: 5, cook: 0, servings: 1, instructions: ["Mix oats, nuts, dried fruit", "Add milk or yogurt", "Let sit 5 minutes", "Top with fresh fruit"] },
  { name: "Granola Bowl", prep: 5, cook: 0, servings: 1, instructions: ["Layer granola in bowl", "Add yogurt", "Top with berries", "Drizzle with honey"] },
  { name: "Acai Bowl", prep: 10, cook: 0, servings: 1, instructions: ["Blend frozen acai with banana", "Pour into bowl", "Top with granola, coconut, berries"] },

  // Smoothies & Drinks (10)
  { name: "Berry Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend berries with banana", "Add milk and honey", "Blend until smooth"] },
  { name: "Banana Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend banana with milk", "Add peanut butter", "Blend until creamy"] },
  { name: "Green Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend spinach with banana", "Add apple and ginger", "Blend with coconut water"] },
  { name: "Mango Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend mango with yogurt", "Add honey", "Serve cold"] },
  { name: "Peach Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend peach with yogurt", "Add honey and vanilla", "Blend until smooth"] },
  { name: "Blueberry Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend blueberries with yogurt", "Add honey", "Serve immediately"] },
  { name: "Tropical Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend mango and pineapple", "Add coconut milk", "Blend until smooth"] },
  { name: "Protein Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend banana with protein powder", "Add milk and peanut butter", "Blend until smooth"] },
  { name: "Coffee Smoothie", prep: 5, cook: 0, servings: 1, instructions: ["Blend cold brew with banana", "Add protein and milk", "Blend until frothy"] },
  { name: "Hot Chocolate", prep: 5, cook: 5, servings: 2, instructions: ["Heat milk", "Whisk in cocoa and sugar", "Add vanilla", "Top with marshmallows"] },

  // Pastries & Baked (10)
  { name: "Croissant", prep: 30, cook: 20, servings: 6, instructions: ["Make laminated dough", "Roll and fold with butter", "Shape and proof", "Bake at 400°F"] },
  { name: "Blueberry Muffins", prep: 15, cook: 25, servings: 12, instructions: ["Mix dry ingredients", "Combine wet ingredients", "Fold in blueberries", "Bake at 375°F"] },
  { name: "Banana Bread", prep: 15, cook: 60, servings: 8, instructions: ["Mash bananas", "Mix wet and dry ingredients", "Combine", "Bake at 350°F for 1 hour"] },
  { name: "Zucchini Bread", prep: 15, cook: 60, servings: 8, instructions: ["Shred zucchini", "Mix ingredients", "Bake at 350°F"] },
  { name: "Coffee Cake", prep: 20, cook: 45, servings: 8, instructions: ["Make batter", "Add streusel topping", "Bake at 350°F"] },
  { name: "Cinnamon Rolls", prep: 30, cook: 25, servings: 12, instructions: ["Make dough and let rise", "Roll with cinnamon sugar", "Cut and proof", "Bake and glaze"] },
  { name: "Danish Pastry", prep: 30, cook: 20, servings: 8, instructions: ["Make laminated dough", "Shape with fruit filling", "Proof and bake"] },
  { name: "Scones", prep: 15, cook: 20, servings: 8, instructions: ["Cut butter into flour", "Add cream", "Shape and bake at 425°F"] },
  { name: "Puff Pastry Turnovers", prep: 20, cook: 20, servings: 4, instructions: ["Cut puff pastry", "Fill with fruit", "Bake at 400°F"] },
  { name: "Crepes", prep: 10, cook: 15, servings: 4, instructions: ["Make thin batter", "Pour into hot pan", "Fill with fruit or savory", "Fold and serve"] },
]

// ============================================================
// LUNCH RECIPES (100)
// ============================================================

const lunchRecipes = [
  // Salads (20)
  { name: "Caesar Salad", prep: 15, cook: 10, servings: 2, instructions: ["Chop romaine lettuce", "Make Caesar dressing", "Toss with croutons and parmesan"] },
  { name: "Chicken Caesar Salad", prep: 15, cook: 15, servings: 2, instructions: ["Grill chicken breast", "Chop lettuce", "Toss with Caesar dressing", "Top with chicken"] },
  { name: "Greek Salad", prep: 15, cook: 0, servings: 2, instructions: ["Chop tomatoes, cucumbers, peppers", "Add olives and feta", "Dress with olive oil and oregano"] },
  { name: "Cobb Salad", prep: 20, cook: 15, servings: 2, instructions: ["Arrange chicken, bacon, egg, avocado", "Add blue cheese", "Dress with ranch"] },
  { name: "Garden Salad", prep: 10, cook: 0, servings: 2, instructions: ["Mix mixed greens", "Add tomatoes, cucumbers, carrots", "Serve with dressing"] },
  { name: "Spinach Salad", prep: 10, cook: 0, servings: 2, instructions: ["Wash baby spinach", "Add hard boiled eggs", "Dress with warm bacon vinaigrette"] },
  { name: "Asian Salad", prep: 15, cook: 0, servings: 2, instructions: ["Shred napa cabbage", "Add edamame and mandarin oranges", "Dress with sesame ginger"] },
  { name: "Mediterranean Salad", prep: 15, cook: 0, servings: 2, instructions: ["Combine chickpeas, tomatoes, cucumber", "Add feta and olives", "Dress with lemon"] },
  { name: "Waldorf Salad", prep: 15, cook: 0, servings: 4, instructions: ["Dice apples and celery", "Add walnuts and grapes", "Mix with mayo"] },
  { name: "Coleslaw", prep: 15, cook: 0, servings: 4, instructions: ["Shred cabbage and carrots", "Mix with creamy dressing", "Refrigerate before serving"] },
  { name: "Potato Salad", prep: 20, cook: 20, servings: 6, instructions: ["Boil and cube potatoes", "Mix with mayo, mustard, celery", "Add hard boiled eggs"] },
  { name: "Pasta Salad", prep: 20, cook: 15, servings: 6, instructions: ["Cook pasta and cool", "Add vegetables and cheese", "Toss with Italian dressing"] },
  { name: "Chicken Salad", prep: 15, cook: 0, servings: 4, instructions: ["Shred cooked chicken", "Mix with mayo and celery", "Season with salt and pepper"] },
  { name: "Tuna Salad", prep: 10, cook: 0, servings: 2, instructions: ["Drain tuna", "Mix with mayo and celery", "Serve on bread or lettuce"] },
  { name: "Egg Salad", prep: 15, cook: 12, servings: 4, instructions: ["Chop hard boiled eggs", "Mix with mayo and mustard", "Season and serve"] },
  { name: "Shrimp Salad", prep: 15, cook: 10, servings: 2, instructions: ["Cook and peel shrimp", "Mix with mayo, celery, lemon", "Serve on greens"] },
  { name: "Caprese Salad", prep: 10, cook: 0, servings: 2, instructions: ["Slice tomatoes and mozzarella", "Layer with basil", "Drizzle with balsamic"] },
  { name: "Niçoise Salad", prep: 20, cook: 15, servings: 2, instructions: ["Arrange tuna, eggs, green beans", "Add potatoes and olives", "Dress with vinaigrette"] },
  { name: "Chef Salad", prep: 15, cook: 0, servings: 2, instructions: ["Layer ham, turkey, cheese", "Add lettuce and vegetables", "Serve with dressing"] },
  { name: "Southwest Salad", prep: 15, cook: 0, servings: 2, instructions: ["Combine romaine and corn", "Add black beans and avocado", "Dress with chipotle ranch"] },

  // Sandwiches (20)
  { name: "BLT Sandwich", prep: 10, cook: 10, servings: 1, instructions: ["Toast bread", "Cook bacon until crispy", "Layer bacon, lettuce, tomato", "Add mayo"] },
  { name: "Club Sandwich", prep: 15, cook: 10, servings: 1, instructions: ["Toast bread", "Layer turkey, bacon, cheese", "Add lettuce, tomato, mayo"] },
  { name: "Grilled Cheese", prep: 5, cook: 10, servings: 1, instructions: ["Butter bread", "Fill with cheese", "Cook until golden on both sides"] },
  { name: "Turkey Club", prep: 10, cook: 10, servings: 1, instructions: ["Toast bread", "Layer turkey, bacon, cheese", "Add lettuce and tomato"] },
  { name: "Reuben Sandwich", prep: 10, cook: 10, servings: 1, instructions: ["Butter bread", "Layer corned beef, sauerkraut, cheese", "Grill until golden"] },
  { name: "Rueben Sandwich", prep: 10, cook: 10, servings: 1, instructions: ["Butter bread", "Layer corned beef, sauerkraut, swiss", "Grill until cheese melts"] },
  { name: "Monte Cristo", prep: 10, cook: 10, servings: 1, instructions: ["Layer ham and turkey", "Dip in egg batter", "French toast style"] },
  { name: "Philly Cheesesteak", prep: 15, cook: 15, servings: 2, instructions: ["Sauté onions and peppers", "Cook sliced beef", "Top with melted cheese"] },
  { name: "French Dip", prep: 10, cook: 15, servings: 2, instructions: ["Cook roast beef thin", "Toast hoagie roll", "Serve with au jus"] },
  { name: "Meatball Sub", prep: 20, cook: 25, servings: 2, instructions: ["Make and cook meatballs", "Simmer in marinara", "Serve on sub roll"] },
  { name: "Chicken Parmesan Sub", prep: 15, cook: 25, servings: 2, instructions: ["Bread and fry chicken cutlet", "Top with marinara and cheese", "Serve on sub roll"] },
  { name: "Tuna Melt", prep: 10, cook: 10, servings: 1, instructions: ["Mix tuna salad", "Top with cheese", "Grill until melted"] },
  { name: "Patty Melt", prep: 15, cook: 15, servings: 2, instructions: ["Cook burger patties", "Sauté onions", "Layer with cheese on rye"] },
  { name: "Sloppy Joe", prep: 15, cook: 20, servings: 4, instructions: ["Brown ground beef", "Add sauce mixture", "Simmer until thick"] },
  { name: "Pulled Pork Sandwich", prep: 15, cook: 240, servings: 6, instructions: ["Slow cook pork shoulder", "Shred and sauce", "Serve on bun"] },
  { name: "BBQ Chicken Sandwich", prep: 15, cook: 30, servings: 2, instructions: ["Grill chicken breast", "Slice and toss with BBQ", "Serve on bun"] },
  { name: "Chicken Salad Sandwich", prep: 10, cook: 0, servings: 2, instructions: ["Make chicken salad", "Spread on bread", "Add lettuce"] },
  { name: "Egg Salad Sandwich", prep: 10, cook: 12, servings: 2, instructions: ["Make egg salad", "Spread on bread", "Add lettuce and tomato"] },
  { name: "Caprese Panini", prep: 10, cook: 10, servings: 1, instructions: ["Layer mozzarella and tomato", "Add basil pesto", "Grill until pressed"] },
  { name: "Veggie Wrap", prep: 10, cook: 0, servings: 1, instructions: ["Spread hummus on tortilla", "Add grilled vegetables", "Roll up tightly"] },

  // Soups (20)
  { name: "Chicken Noodle Soup", prep: 15, cook: 30, servings: 6, instructions: ["Cook chicken and shred", "Sauté vegetables", "Add broth and noodles", "Simmer until tender"] },
  { name: "Tomato Soup", prep: 10, cook: 25, servings: 4, instructions: ["Sauté onions and garlic", "Add tomatoes and broth", "Blend until smooth", "Add cream"] },
  { name: "Vegetable Soup", prep: 15, cook: 30, servings: 6, instructions: ["Sauté mirepoix", "Add vegetables and broth", "Simmer until tender"] },
  { name: "Beef Stew", prep: 20, cook: 120, servings: 6, instructions: ["Brown beef chunks", "Add vegetables and broth", "Simmer 2 hours until tender"] },
  { name: "Chili", prep: 15, cook: 45, servings: 6, instructions: ["Brown ground beef", "Add beans and tomatoes", "Season with chili powder", "Simmer 30 minutes"] },
  { name: "Clam Chowder", prep: 15, cook: 30, servings: 4, instructions: ["Cook bacon", "Add vegetables and potatoes", "Add clams and cream"] },
  { name: "Minestrone", prep: 15, cook: 35, servings: 6, instructions: ["Sauté vegetables", "Add beans and pasta", "Simmer in vegetable broth"] },
  { name: "Split Pea Soup", prep: 10, cook: 60, servings: 6, instructions: ["Rinse split peas", "Cook with ham hock", "Blend until smooth"] },
  { name: "Lentil Soup", prep: 10, cook: 35, servings: 4, instructions: ["Sauté onions and garlic", "Add lentils and broth", "Simmer until tender"] },
  { name: "Black Bean Soup", prep: 10, cook: 30, servings: 4, instructions: ["Sauté peppers and onions", "Add beans and broth", "Blend half for creaminess"] },
  { name: "Mushroom Soup", prep: 10, cook: 25, servings: 4, instructions: ["Sauté mushrooms", "Add broth and cream", "Blend until smooth"] },
  { name: "Broccoli Cheddar Soup", prep: 10, cook: 25, servings: 4, instructions: ["Cook broccoli", "Add cheese and cream", "Blend until smooth"] },
  { name: "French Onion Soup", prep: 15, cook: 45, servings: 4, instructions: ["Caramelize onions slowly", "Add beef broth", "Top with bread and cheese"] },
  { name: "Chicken Tortilla Soup", prep: 15, cook: 30, servings: 4, instructions: ["Simmer chicken in broth", "Add tomatoes and beans", "Serve with tortilla strips"] },
  { name: "Egg Drop Soup", prep: 5, cook: 10, servings: 2, instructions: ["Bring broth to boil", "Mix cornstarch and water", "Pour eggs slowly while stirring"] },
  { name: "Wonton Soup", prep: 20, cook: 20, servings: 4, instructions: ["Make wonton wrappers", "Fill with pork", "Cook in chicken broth"] },
  { name: "Miso Soup", prep: 5, cook: 10, servings: 2, instructions: ["Bring dashi to simmer", "Dissolve miso paste", "Add tofu and seaweed"] },
  { name: "Gazpacho", prep: 15, cook: