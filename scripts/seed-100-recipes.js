import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 100 Real Recipes with 20 per category
const recipes = [
  // ========== BREAKFAST (20) ==========
  {
    name: "Classic French Toast",
    description: "Crispy on the outside, soft on the inside French toast perfect for weekend breakfasts",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 10,
    servings: 4,
    instructions: [
      "Whisk together eggs, milk, vanilla, and cinnamon in a shallow dish",
      "Heat butter in a large skillet over medium heat",
      "Dip bread slices into egg mixture, coating both sides",
      "Cook until golden brown, about 2-3 minutes per side",
      "Serve with maple syrup, fresh berries, or powdered sugar"
    ]
  },
  {
    name: "Veggie Omelette",
    description: "Fluffy omelette loaded with fresh vegetables and cheese",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    servings: 1,
    instructions: [
      "Beat eggs with milk, salt and pepper",
      "Sauté bell peppers, onions, mushrooms in butter",
      "Pour eggs over vegetables in pan",
      "Cook until edges set, then fold in half",
      "Serve hot with toast"
    ]
  },
  {
    name: "Breakfast Burrito",
    description: "Hearty burrito filled with eggs, beans, cheese, and salsa",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 2,
    instructions: [
      "Brown breakfast sausage in a skillet",
      "Scramble eggs with the sausage",
      "Warm tortillas in a dry pan",
      "Layer eggs, black beans, cheese, and salsa on tortilla",
      "Roll up tightly and serve with sour cream"
    ]
  },
  {
    name: "Acai Smoothie Bowl",
    description: "Thick and creamy smoothie bowl topped with fresh fruits and granola",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 1,
    instructions: [
      "Blend frozen acai packet with banana, berries, and almond milk",
      "Pour thick smoothie into a bowl",
      "Top with sliced bananas, strawberries, coconut flakes",
      "Add granola and drizzle with honey",
      "Serve immediately"
    ]
  },
  {
    name: "Blueberry Pancakes",
    description: "Fluffy pancakes studded with fresh blueberries",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Mix flour, sugar, baking powder, and salt",
      "Whisk milk, egg, and melted butter, then combine with dry ingredients",
      "Gently fold in fresh blueberries",
      "Cook on a griddle until bubbles form, then flip",
      "Serve with butter and maple syrup"
    ]
  },
  {
    name: "Avocado Toast",
    description: "Toasted bread topped with mashed avocado and poached eggs",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 5,
    servings: 2,
    instructions: [
      "Toast sourdough bread slices",
      "Mash avocado with lemon juice, salt, and pepper",
      "Poach eggs in simmering water with vinegar",
      "Spread avocado on toast",
      "Top with poached eggs and red pepper flakes"
    ]
  },
  {
    name: "Overnight Oats",
    description: "Creamy no-cook oats prepared the night before",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    instructions: [
      "Combine oats, milk, yogurt, chia seeds in a jar",
      "Add honey and vanilla, stir well",
      "Refrigerate overnight or at least 4 hours",
      "Top with fresh berries and nuts before serving",
      "Enjoy cold or heat briefly in microwave"
    ]
  },
  {
    name: "Breakfast Pizza",
    description: "Pizza dough topped with eggs, bacon, and cheese",
    category: "breakfast",
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 4,
    instructions: [
      "Roll out pizza dough to desired shape",
      "Cook bacon until crispy, crumble on sauce",
      "Add shredded mozzarella cheese",
      "Crack eggs on top, bake at 425°F until cheese melts",
      "Cook until eggs are set to your liking"
    ]
  },
  {
    name: "Banana Foster French Toast",
    description: "Decadent French toast with caramelized bananas",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Make caramel sauce with butter, brown sugar, and cinnamon",
      "Slice bananas and cook in caramel until softened",
      "Dip thick bread slices in egg custard mixture",
      "Cook on griddle until golden",
      "Top with bananas and caramel sauce"
    ]
  },
  {
    name: "Shakshuka",
    description: "Middle Eastern poached eggs in spiced tomato sauce",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    instructions: [
      "Sauté onions, garlic, and bell peppers in olive oil",
      "Add canned tomatoes, cumin, paprika, and cayenne",
      "Simmer until sauce thickens slightly",
      "Make wells in sauce and crack in eggs",
      "Cover and cook until eggs set, garnish with cilantro"
    ]
  },
  {
    name: "Breakfast Quesadilla",
    description: "Crispy tortilla filled with eggs, cheese, and bacon",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 10,
    servings: 2,
    instructions: [
      "Scramble eggs with salt and pepper",
      "Layer eggs, cheese, and bacon on flour tortilla",
      "Top with another tortilla and press down",
      "Cook in skillet until golden on both sides",
      "Cut into wedges and serve with salsa"
    ]
  },
  {
    name: "Cinnamon Roll Oatmeal",
    description: "Warm oatmeal with cream cheese glaze",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 10,
    servings: 1,
    instructions: [
      "Cook oats with milk and water according to package",
      "Stir in brown sugar and cinnamon",
      "Mix cream cheese with powdered sugar and milk for glaze",
      "Drizzle over oatmeal",
      "Serve warm"
    ]
  },
  {
    name: "Smoked Salmon Bagel",
    description: "Classic lox and bagel with cream cheese and capers",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 1,
    instructions: [
      "Toast a plain or everything bagel",
      "Spread cream cheese on both halves",
      "Layer smoked salmon slices",
      "Top with red onion, capers, and dill",
      "Squeeze fresh lemon juice over top"
    ]
  },
  {
    name: "Veggie Frittata",
    description: "Italian baked egg dish with vegetables and cheese",
    category: "breakfast",
    prep_time_minutes: 15,
    cook_time_minutes: 25,
    servings: 6,
    instructions: [
      "Preheat oven to 375°F",
      "Sauté vegetables in oven-safe skillet",
      "Beat eggs with milk, salt, and pepper",
      "Pour eggs over vegetables, add cheese",
      "Bake until set, about 20-25 minutes"
    ]
  },
  {
    name: "Potato Breakfast Hash",
    description: "Crispy potatoes with vegetables and eggs",
    category: "breakfast",
    prep_time_minutes: 15,
    cook_time_minutes: 25,
    servings: 4,
    instructions: [
      "Dice potatoes into small cubes, parboil",
      "Fry potatoes until crispy in butter",
      "Add diced bell peppers and onions",
      "Create wells and crack in eggs",
      "Cover and cook until eggs are done"
    ]
  },
  {
    name: "German Pancake",
    description: "Puffy oven-baked pancake perfect for sharing",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 20,
    servings: 4,
    instructions: [
      "Blend eggs, milk, flour, and vanilla until smooth",
      "Pour into hot buttered cast iron skillet",
      "Bake at 425°F until puffed and golden",
      "Squeeze lemon juice over top",
      "Dust with powdered sugar and serve"
    ]
  },
  {
    name: "Eggs Florentine",
    description: "Poached eggs on spinach with hollandaise sauce",
    category: "breakfast",
    prep_time_minutes: 15,
    cook_time_minutes: 10,
    servings: 2,
    instructions: [
      "Sauté fresh spinach until wilted, drain well",
      "Toast English muffins",
      "Poach eggs in simmering water",
      "Make hollandaise sauce",
      "Layer spinach, eggs, and hollandaise on muffins"
    ]
  },
  {
    name: "Biscuits and Gravy",
    description: "Fluffy biscuits smothered in creamy sausage gravy",
    category: "breakfast",
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 4,
    instructions: [
      "Make and bake buttermilk biscuits",
      "Brown breakfast sausage in skillet",
      "Sprinkle flour over sausage, stir",
      "Add milk and simmer until thick",
      "Split biscuits and ladle gravy over top"
    ]
  },
  {
    name: "Berry Parfait",
    description: "Layered yogurt, granola, and fresh berries",
    category: "breakfast",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    instructions: [
      "Layer Greek yogurt in a glass or bowl",
      "Add a layer of granola",
      "Top with mixed fresh berries",
      "Repeat layers",
      "Drizzle with honey before serving"
    ]
  },
  {
    name: "Croque Madame",
    description: "French ham and cheese sandwich with fried egg on top",
    category: "breakfast",
    prep_time_minutes: 10,
    cook_time_minutes: 10,
    servings: 2,
    instructions: [
      "Make béchamel sauce with butter, flour, and milk",
      "Spread on bread slices, add ham and gruyère",
      "Top with another bread slice",
      "Dip briefly in beaten egg, cook in butter until golden",
      "Fry an egg to place on top"
    ]
  },

  // ========== LUNCH (20) ==========
  {
    name: "Chicken Caesar Salad",
    description: "Classic Caesar salad with grilled chicken breast",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 2,
    instructions: [
      "Season chicken breasts with salt, pepper, and garlic powder",
      "Grill chicken until cooked through, let rest and slice",
      "Toss romaine lettuce with Caesar dressing",
      "Add shaved parmesan and croutons",
      "Top with sliced chicken and serve"
    ]
  },
  {
    name: "Tomato Basil Soup",
    description: "Creamy roasted tomato soup with fresh basil",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    servings: 4,
    instructions: [
      "Roast tomatoes with garlic at 400°F for 30 minutes",
      "Sauté onions in butter until soft",
      "Add roasted tomatoes and chicken broth",
      "Blend until smooth, stir in heavy cream",
      "Garnish with fresh basil and croutons"
    ]
  },
  {
    name: "Club Sandwich",
    description: "Triple-decker sandwich with turkey, bacon, and fixings",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 5,
    servings: 1,
    instructions: [
      "Toast three slices of bread",
      "Cook bacon until crispy",
      "Spread mayo on bread slices",
      "Layer turkey, bacon, lettuce, tomato between slices",
      "Secure with toothpicks and cut diagonally"
    ]
  },
  {
    name: "Chicken Wrap",
    description: "Flour tortilla wrapped with grilled chicken and fresh veggies",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 10,
    servings: 2,
    instructions: [
      "Grill chicken breast, slice thin",
      "Spread hummus on large flour tortillas",
      "Add mixed greens, sliced cucumber, tomatoes",
      "Place chicken in center, sprinkle feta cheese",
      "Roll tightly and cut in half to serve"
    ]
  },
  {
    name: "Greek Salad",
    description: "Fresh Mediterranean salad with feta, olives, and olive oil",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    servings: 2,
    instructions: [
      "Chop tomatoes, cucumber, and red onion",
      "Add kalamata olives and bell peppers",
      "Crumble feta cheese over top",
      "Drizzle with olive oil and red wine vinegar",
      "Season with oregano, salt, and pepper"
    ]
  },
  {
    name: "BLT Sandwich",
    description: "Classic bacon, lettuce, and tomato on toasted bread",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    servings: 1,
    instructions: [
      "Cook bacon until crispy",
      "Toast bread slices",
      "Spread mayo on toast",
      "Layer lettuce, tomato, and bacon",
      "Top with toast, serve immediately"
    ]
  },
  {
    name: "Minestrone Soup",
    description: "Hearty Italian vegetable soup with pasta and beans",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 35,
    servings: 6,
    instructions: [
      "Sauté diced carrots, celery, onion in olive oil",
      "Add garlic, diced tomatoes, and vegetable broth",
      "Add beans and pasta, simmer until pasta is cooked",
      "Add zucchini and leafy greens",
      "Season with Italian herbs, serve with parmesan"
    ]
  },
  {
    name: "Tuna Salad Wrap",
    description: "Light tuna salad wrapped in a spinach tortilla",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 2,
    instructions: [
      "Mix tuna with Greek yogurt, celery, red onion, dill",
      "Season with lemon juice, salt, and pepper",
      "Spread on large spinach tortilla",
      "Add arugula or mixed greens",
      "Roll up tightly and slice in half"
    ]
  },
  {
    name: "Caprese Panini",
    description: "Grilled sandwich with fresh mozzarella, tomatoes, and basil",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 8,
    servings: 1,
    instructions: [
      "Slice ciabatta bread in half",
      "Layer fresh mozzarella slices and tomato slices",
      "Add fresh basil leaves",
      "Drizzle with olive oil and balsamic glaze",
      "Grill in panini press or skillet until cheese melts"
    ]
  },
  {
    name: "Chicken Noodle Soup",
    description: "Comforting homemade soup with egg noodles and vegetables",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    servings: 6,
    instructions: [
      "Sauté diced carrots, celery, onion in large pot",
      "Add chicken broth and leftover cooked chicken",
      "Simmer for 15 minutes",
      "Add egg noodles and cook until tender",
      "Season with thyme, salt, pepper, and serve"
    ]
  },
  {
    name: "Cobb Salad",
    description: "American classic with chicken, bacon, egg, avocado, and blue cheese",
    category: "lunch",
    prep_time_minutes: 20,
    cook_time_minutes: 10,
    servings: 4,
    instructions: [
      "Grill chicken breast and slice",
      "Cook bacon until crispy, crumble",
      "Hard boil eggs and quarter",
      "Arrange greens in bowl, top with rows of ingredients",
      "Serve with blue cheese dressing"
    ]
  },
  {
    name: "Philly Cheesesteak",
    description: "Classic Philadelphia sandwich with ribeye and melted cheese",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 2,
    instructions: [
      "Slice ribeye steak very thin",
      "Sauté onions and bell peppers until soft",
      "Cook steak in same pan until browned",
      "Place on hoagie rolls",
      "Top with provolone and broil until melted"
    ]
  },
  {
    name: "Lentil Soup",
    description: "Hearty and healthy lentil soup with vegetables",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 40,
    servings: 6,
    instructions: [
      "Sauté diced carrots, celery, onion in olive oil",
      "Add rinsed lentils, diced tomatoes, and broth",
      "Add cumin, turmeric, and garlic",
      "Simmer until lentils are tender, about 30 minutes",
      "Season with lemon juice and serve with bread"
    ]
  },
  {
    name: "Grilled Cheese & Tomato Soup",
    description: "Classic combo of creamy soup and crispy sandwich",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 2,
    instructions: [
      "Make tomato soup by blending canned tomatoes with cream",
      "Butter bread slices on outside",
      "Fill with American or cheddar cheese",
      "Grill in skillet until golden and cheese melts",
      "Dip sandwich in soup and enjoy"
    ]
  },
  {
    name: "Asian Chicken Salad",
    description: "Crunchy salad with sesame ginger dressing",
    category: "lunch",
    prep_time_minutes: 20,
    cook_time_minutes: 10,
    servings: 2,
    instructions: [
      "Grill chicken breast, slice thin",
      "Shred napa cabbage and romaine lettuce",
      "Add sliced almonds, crispy wonton strips, edamame",
      "Whisk together sesame oil, rice vinegar, ginger, soy sauce",
      "Toss salad with dressing and top with chicken"
    ]
  },
  {
    name: "Cheese Quesadilla",
    description: "Cheesy quesadilla with peppers and onions",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 10,
    servings: 2,
    instructions: [
      "Sauté bell peppers and onions until soft",
      "Place flour tortilla in dry skillet",
      "Add shredded cheese and peppers to half",
      "Fold tortilla and cook until golden on both sides",
      "Cut into wedges, serve with salsa and sour cream"
    ]
  },
  {
    name: "Shrimp Cocktail",
    description: "Chilled shrimp with zesty cocktail sauce",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 5,
    servings: 4,
    instructions: [
      "Add shrimp to boiling water with Old Bay seasoning",
      "Cook just until pink, about 2-3 minutes",
      "Immediately transfer to ice bath to stop cooking",
      "Mix ketchup, horseradish, lemon juice for sauce",
      "Serve shrimp on lettuce with sauce"
    ]
  },
  {
    name: "Tortellini Soup",
    description: "Italian cheese tortellini in savory broth",
    category: "lunch",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    instructions: [
      "Sauté garlic and onion in olive oil",
      "Add chicken broth and diced tomatoes",
      "Simmer for 10 minutes",
      "Add cheese tortellini, cook until they float",
      "Add spinach, season, serve with parmesan"
    ]
  },
  {
    name: "Egg Salad Sandwich",
    description: "Creamy egg salad on soft bread",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 12,
    servings: 2,
    instructions: [
      "Hard boil eggs, cool, and peel",
      "Mash eggs with mayo, mustard, celery, chives",
      "Season with salt, pepper, and paprika",
      "Spread on bread slices with lettuce",
      "Serve with chips or salad"
    ]
  },
  {
    name: "BBQ Pulled Pork Sandwich",
    description: "Slow-cooked pulled pork with tangy BBQ sauce",
    category: "lunch",
    prep_time_minutes: 15,
    cook_time_minutes: 240,
    servings: 8,
    instructions: [
      "Rub pork shoulder with BBQ spice rub",
      "Slow cook in Crock Pot for 8 hours on low",
      "Shred pork with two forks",
      "Mix with BBQ sauce",
      "Serve on buns with coleslaw"
    ]
  },

  // ========== DINNER (20) ==========
  {
    name: "Spaghetti Bolognese",
    description: "Classic Italian pasta with rich meat sauce",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 45,
    servings: 4,
    instructions: [
      "Brown ground beef with onions and garlic",
      "Add diced tomatoes, tomato paste, and Italian herbs",
      "Simmer sauce for 30 minutes",
      "Cook spaghetti according to package directions",
      "Serve sauce over pasta with parmesan cheese"
    ]
  },
  {
    name: "Grilled Salmon",
    description: "Perfectly grilled salmon with lemon and herbs",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 12,
    servings: 4,
    instructions: [
      "Season salmon fillets with olive oil, salt, pepper, garlic powder",
      "Preheat grill to medium-high",
      "Grill salmon skin-side down for 4-5 minutes",
      "Flip and cook another 3-4 minutes",
      "Squeeze fresh lemon over top and serve"
    ]
  },
  {
    name: "Chicken Stir Fry",
    description: "Quick Asian-style chicken with vegetables",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Slice chicken breast into thin strips",
      "Make stir fry sauce: soy sauce, sesame oil, ginger, garlic",
      "Stir fry chicken until browned, remove",
      "Stir fry broccoli, bell peppers, carrots",
      "Return chicken, add sauce, toss, serve over rice"
    ]
  },
  {
    name: "Beef Tacos",
    description: "Seasoned ground beef tacos with fresh toppings",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Brown ground beef in skillet",
      "Add taco seasoning and water, simmer until thick",
      " oven",
      "Fill shells with seasoned beef",
      "Top with lettuce,Warm taco shells in tomato, cheese, salsa, sour cream"
    ]
  },
  {
    name: "Mushroom Risotto",
    description: "Creamy Italian rice dish with mixed mushrooms",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    servings: 4,
    instructions: [
      "Sauté mixed mushrooms in butter, set aside",
      "Sauté onion in same pan until soft",
      "Add arborio rice, toast for 2 minutes",
      "Add warm broth one ladle at a time, stirring constantly",
      "Fold in mushrooms, parmesan, and butter"
    ]
  },
  {
    name: "Vegetable Curry",
    description: "Flavorful Indian-style vegetable curry",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    servings: 4,
    instructions: [
      "Sauté onion, garlic, ginger in coconut oil",
      "Add curry powder and turmeric, toast briefly",
      "Add potatoes, cauliflower, chickpeas",
      "Pour in coconut milk, simmer until vegetables are tender",
      "Serve over rice with naan bread"
    ]
  },
  {
    name: "Lemon Herb Chicken",
    description: "Pan-seared chicken with bright lemon and herbs",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    instructions: [
      "Pound chicken breasts to even thickness",
      "Season with salt, pepper, garlic powder, herbs",
      "Sear in olive oil until golden",
      "Add chicken broth and lemon juice to pan",
      "Simmer until chicken is cooked through, serve with sauce"
    ]
  },
  {
    name: "Shrimp Scampi",
    description: "Garlic butter shrimp over linguine pasta",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Cook pasta according to package directions",
      "Sauté shrimp in garlic butter until pink",
      "Add white wine and lemon juice",
      "Toss with pasta and fresh parsley",
      "Serve with crusty bread"
    ]
  },
  {
    name: "Pan-Seared Pork Chops",
    description: "Perfectly seasoned and juicy pork chops",
    category: "dinner",
    prep_time_minutes: 5,
    cook_time_minutes: 15,
    servings: 2,
    instructions: [
      "Season pork chops with salt, pepper, garlic powder",
      "Let rest at room temperature for 15 minutes",
      "Sear in hot cast iron skillet until golden",
      "Flip and cook until internal temp reaches 145°F",
      "Rest 5 minutes before serving"
    ]
  },
  {
    name: "Fish Tacos",
    description: "Crispy fish tacos with cabbage slaw and lime crema",
    category: "dinner",
    prep_time_minutes: 20,
    cook_time_minutes: 10,
    servings: 4,
    instructions: [
      "Cut white fish into strips, season with cumin and chili powder",
      "Coat in flour or panko, pan fry until crispy",
      "Make slaw with cabbage, mayo, lime juice, cilantro",
      "Make crema with sour cream and lime zest",
      "Fill tortillas with fish, slaw, and crema"
    ]
  },
  {
    name: "Italian Meatballs",
    description: "Homemade meatballs in marinara sauce",
    category: "dinner",
    prep_time_minutes: 25,
    cook_time_minutes: 30,
    servings: 4,
    instructions: [
      "Mix ground beef with breadcrumbs, egg, parmesan, garlic, herbs",
      "Form into golf ball-sized meatballs",
      "Brown meatballs in skillet, set aside",
      "Add marinara sauce to pan, return meatballs",
      "Simmer 20 minutes, serve over pasta or with bread"
    ]
  },
  {
    name: "Chicken Parmesan",
    description: "Breaded chicken with marinara and melted mozzarella",
    category: "dinner",
    prep_time_minutes: 20,
    cook_time_minutes: 25,
    servings: 4,
    instructions: [
      "Pound chicken breasts thin",
      "Bread with flour, egg, and breadcrumbs",
      "Pan fry until golden and cooked through",
      "Top with marinara sauce and mozzarella",
      "Broil until cheese melts, serve with pasta"
    ]
  },
  {
    name: "Beef Stew",
    description: "Hearty slow-cooked beef stew with vegetables",
    category: "dinner",
    prep_time_minutes: 20,
    cook_time_minutes: 120,
    servings: 6,
    instructions: [
      "Cut beef into cubes, season and brown in pot",
      "Add onions, carrots, potatoes, celery",
      "Add beef broth, tomato paste, Worcestershire",
      "Simmer covered for 2 hours until beef is tender",
      "Season to taste and serve with crusty bread"
    ]
  },
  {
    name: "Pad Thai",
    description: "Thai stir-fried rice noodles with shrimp and peanuts",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Soak rice noodles in warm water until soft",
      "Make sauce: fish sauce, tamarind paste, sugar, lime",
      "Stir fry shrimp until pink, set aside",
      "Scramble eggs, add noodles and sauce",
      "Toss with bean sprouts, peanuts, green onions"
    ]
  },
  {
    name: "Baked Ziti",
    description: "Cheesy baked pasta casserole",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    servings: 8,
    instructions: [
      "Cook ziti pasta until just al dente",
      "Mix with marinara sauce and ricotta",
      "Pour into baking dish, top with mozzarella",
      "Cover with foil, bake at 375°F for 20 minutes",
      "Uncover, bake 10 more minutes until bubbly"
    ]
  },
  {
    name: "Honey Garlic Salmon",
    description: "Glazed salmon with sweet and savory honey garlic sauce",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Mix honey, soy sauce, garlic, ginger for glaze",
      "Season salmon with salt and pepper",
      "Sear salmon in skillet skin-side down",
      "Flip, pour glaze over top",
      "Cook until glazed and salmon is done"
    ]
  },
  {
    name: "Stuffed Bell Peppers",
    description: "Ground beef and rice stuffed peppers with cheese",
    category: "dinner",
    prep_time_minutes: 20,
    cook_time_minutes: 45,
    servings: 4,
    instructions: [
      "Cut tops off peppers, remove seeds",
      "Brown ground beef with onion and garlic",
      "Mix with cooked rice, tomatoes, and seasonings",
      "Stuff peppers, place in baking dish",
      "Bake at 375°F for 35 minutes, top with cheese last 10"
    ]
  },
  {
    name: "Butter Chicken",
    description: "Creamy Indian tomato-based curry with tender chicken",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    servings: 4,
    instructions: [
      "Marinate chicken in yogurt and spices briefly",
      "Grill or pan sear chicken, set aside",
      "Sauté onion, garlic, ginger, add tomato paste",
      "Add cream, butter, and garam masala",
      "Return chicken to sauce, simmer, serve over rice"
    ]
  },
  {
    name: "Vegetable Fried Rice",
    description: "Quick and easy vegetable fried rice",
    category: "dinner",
    prep_time_minutes: 10,
    cook_time_minutes: 15,
    servings: 4,
    instructions: [
      "Use day-old cold rice for best results",
      "Scramble eggs in hot wok, set aside",
      "Stir fry vegetables in sesame oil",
      "Add rice, soy sauce, and sesame oil",
      "Toss eggs back in, add green onions"
    ]
  },
  {
    name: "BBQ Baby Back Ribs",
    description: "Fall-off-the-bone tender ribs with BBQ sauce",
    category: "dinner",
    prep_time_minutes: 15,
    cook_time_minutes: 180,
    servings: 4,
    instructions: [
      "Remove membrane from back of ribs",
      "Rub with BBQ spice blend, refrigerate overnight",
      "Wrap in foil, bake at 275°F for 2.5 hours",
      "Unwrap, brush with BBQ sauce",
      "Broil or grill briefly to caramelize sauce"
    ]
  },

  // ========== SNACK (20) ==========
  {
    name: "Fresh Guacamole",
    description: "Homemade avocado dip with lime and cilantro",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 4,
    instructions: [
      "Mash ripe avocados in bowl",
      "Add diced red onion, tomato, jalapeño",
      "Squeeze in fresh lime juice",
      "Add cilantro, salt, and cumin",
      "Serve with tortilla chips"
    ]
  },
  {
    name: "Classic Hummus",
    description: "Smooth Middle Eastern chickpea dip",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 6,
    instructions: [
      "Blend chickpeas with tahini and lemon juice",
      "Add garlic, olive oil, and ice water",
      "Season with cumin and salt",
      "Drizzle with olive oil and paprika",
      "Serve with pita bread or vegetables"
    ]
  },
  {
    name: "Homemade Trail Mix",
    description: "Mix of nuts, seeds, and dried fruit",
    category: "snack",
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 8,
    instructions: [
      "Combine raw almonds, cashews, and peanuts",
      "Add pumpkin seeds and sunflower seeds",
      "Mix in dried cranberries, raisins, apricots",
      "Optional: add chocolate chips",
      "Store in airtight container"
    ]
  },
  {
    name: "No-Bake Energy Balls",
    description: "Protein balls with oats and peanut butter",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    servings: 12,
    instructions: [
      "Mix oats, peanut butter, honey, and chocolate chips",
      "Add flax seeds and vanilla extract",
      "Roll into small balls",
      "Refrigerate for 30 minutes to set",
      "Store in fridge for up to a week"
    ]
  },
  {
    name: "Bruschetta",
    description: "Italian tomato and basil on toasted bread",
    category: "snack",
    prep_time_minutes: 15,
    cook_time_minutes: 5,
    servings: 6,
    instructions: [
      "Dice tomatoes, mix with chopped basil, garlic, olive oil",
      "Season with balsamic vinegar and salt",
      "Let marinate for 15 minutes",
      "Toast baguette slices",
      "Top toast with tomato mixture, drizzle with balsamic"
    ]
  },
  {
    name: "Caprese Skewers",
    description: "Mini skewers with mozzarella, tomatoes, and basil",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 8,
    instructions: [
      "Cut cherry tomatoes in half",
      "Cut fresh mozzarella into cubes",
      "Thread tomato, basil leaf, and mozzarella on skewer",
      "Drizzle with balsamic glaze",
      "Season with salt and pepper"
    ]
  },
  {
    name: "Spinach Artichoke Dip",
    description: "Creamy warm dip with spinach and artichokes",
    category: "snack",
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    servings: 8,
    instructions: [
      "Thaw and drain frozen spinach",
      "Mix with artichoke hearts, cream cheese, sour cream",
      "Add garlic, parmesan, and mozzarella",
      "Bake at 350°F for 25 minutes until bubbly",
      "Serve with tortilla chips or bread"
    ]
  },
  {
