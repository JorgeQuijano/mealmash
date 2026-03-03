#!/usr/bin/env python3
"""
Populate recipe_ingredients table in Supabase
"""
import requests
import json
import uuid

SUPABASE_URL = "https://owmwdsypvvaxsckflbxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Recipe to ingredients mapping
# Format: recipe_name -> [(ingredient_name, quantity), ...]
RECIPE_INGREDIENTS = {
    # Breakfast - Eggs
    "Scrambled Eggs": [("Egg", "4"), ("Butter", "2 tbsp"), ("Salt", "to taste"), ("Black Pepper", "to taste"), ("Milk", "2 tbsp")],
    "Classic Scrambled Eggs": [("Egg", "4"), ("Butter", "2 tbsp"), ("Salt", "to taste"), ("Black Pepper", "to taste"), ("Milk", "2 tbsp")],
    "Fried Eggs": [("Egg", "2"), ("Butter", "1 tbsp"), ("Salt", "to taste"), ("Black Pepper", "to taste")],
    "Poached Eggs": [("Egg", "2"), ("Salt", "to taste"), ("White Vinegar", "1 tbsp")],
    "Omelette": [("Egg", "3"), ("Butter", "1 tbsp"), ("Cheddar", "2 tbsp"), ("Salt", "to taste"), ("Black Pepper", "to taste")],
    "French Toast": [("Egg", "2"), ("Milk", "1/2 cup"), ("Cinnamon", "1/2 tsp"), ("Vanilla Extract", "1/2 tsp"), ("Bread", "4 slices"), ("Butter", "2 tbsp")],
    "Pancakes": [("Flour", "1.5 cups"), ("Baking Powder", "1.5 tsp"), ("Salt", "1/2 tsp"), ("Sugar", "2 tbsp"), ("Milk", "1.25 cups"), ("Egg", "1"), ("Butter", "3 tbsp")],
    "Classic Pancakes": [("Flour", "2 cups"), ("Baking Powder", "2 tsp"), ("Salt", "1/2 tsp"), ("Sugar", "2 tbsp"), ("Milk", "1.5 cups"), ("Egg", "2"), ("Butter", "3 tbsp")],
    "Waffles": [("Flour", "1.5 cups"), ("Baking Powder", "1.5 tsp"), ("Salt", "1/2 tsp"), ("Sugar", "2 tbsp"), ("Milk", "1.5 cups"), ("Egg", "2"), ("Butter", "6 tbsp")],
    "Breakfast Burrito": [("Tortilla", "2"), ("Egg", "3"), ("Bacon", "2 strips"), ("Cheddar", "1/2 cup"), ("Bean", "1/2 cup"), ("Salsa", "2 tbsp")],
    "Quiche": [("Egg", "4"), ("Heavy Cream", "1 cup"), ("Pie Crust", "1"), ("Bacon", "4 strips"), ("Cheddar", "1 cup"), ("Spinach", "1 cup")],
    "Frittata": [("Egg", "6"), ("Bell Pepper", "1/2"), ("Onion", "1/4"), ("Mushroom", "1/2 cup"), ("Spinach", "1 cup"), ("Feta", "1/4 cup")],
    "Strata": [("Bread", "6 cups"), ("Egg", "6"), ("Milk", "2 cups"), ("Cheddar", "2 cups"), ("Ham", "1 cup")],
    "Shakshuka": [("Egg", "4"), ("Tomato", "2 cans"), ("Bell Pepper", "1"), ("Onion", "1"), ("Garlic", "3 cloves"), ("Cumin", "1 tsp"), ("Paprika", "1 tsp")],
    "Oatmeal": [("Oat", "1 cup"), ("Milk", "2 cups"), ("Honey", "2 tbsp"), ("Banana", "1"), ("Walnut", "1/4 cup")],
    "Smoothie Bowl": [("Frozen Fruit", "1.5 cups"), ("Banana", "1"), ("Greek Yogurt", "1/2 cup"), ("Granola", "1/4 cup"), ("Chia Seed", "1 tbsp")],
    "Parfait": [("Greek Yogurt", "1 cup"),("Granola", "1/2 cup"),("Strawberry", "1/2 cup"),("Blueberry", "1/4 cup"),("Honey", "1 tbsp")],
    "Bagel": [("Flour", "3 cups"), ("Yeast", "2.25 tsp"), ("Sugar", "1 tbsp"), ("Salt", "1.5 tsp"), ("Egg", "1")],
    "Muffin": [("Flour", "2 cups"), ("Sugar", "3/4 cup"), ("Baking Powder", "2 tsp"), ("Egg", "2"), ("Milk", "1 cup"), ("Butter", "1/3 cup")],
    "Scone": [("Flour", "2 cups"), ("Sugar", "1/4 cup"), ("Baking Powder", "2 tsp"), ("Butter", "1/3 cup"), ("Heavy Cream", "1/2 cup")],
    "Croissant": [("Flour", "4 cups"), ("Yeast", "2.25 tsp"), ("Butter", "1.5 cups"), ("Sugar", "1/4 cup"), ("Egg", "1")],
    "Danish": [("Flour", "2.5 cups"), ("Yeast", "2.25 tsp"), ("Butter", "1 cup"), ("Sugar", "1/2 cup"), ("Cream Cheese", "8 oz")],
    "Crepe": [("Flour", "1 cup"), ("Egg", "2"), ("Milk", "1 cup"), ("Butter", "2 tbsp"), ("Sugar", "1 tbsp")],
    "Quesadilla": [("Tortilla", "2"), ("Cheddar", "1 cup"), ("Butter", "1 tbsp")],
    "Casserole": [("Egg Noodle", "8 oz"), ("Egg", "4"), ("Milk", "2 cups"), ("Cheddar", "2 cups"), ("Bacon", "6 strips")],
    "Congee": [("Rice", "1 cup"), ("Chicken Stock", "6 cups"), ("Ginger", "1 inch"), ("Green Onion", "2"), ("Soy Sauce", "2 tbsp")],
    "Menemen": [("Egg", "3"), ("Tomato", "2"), ("Bell Pepper", "1"), ("Onion", "1"), ("Butter", "2 tbsp")],
    "Huevos Rancheros": [("Egg", "2"), ("Black Bean", "1 can"), ("Tortilla", "2"), ("Salsa", "1/2 cup"), ("Cheddar", "1/2 cup")],
    "Chilaquiles": [("Tortilla", "6"), ("Tomato Sauce", "1 cup"), ("Egg", "2"), ("Cheddar", "1 cup"), ("Sour Cream", "2 tbsp")],
    "Overnight Oats": [("Oat", "1 cup"), ("Milk", "1 cup"), ("Greek Yogurt", "1/2 cup"), ("Honey", "2 tbsp"), ("Chia Seed", "1 tbsp")],
    "Granola": [("Oat", "3 cups"), ("Honey", "1/4 cup"), ("Almond", "1/2 cup"), ("Walnut", "1/2 cup"), ("Cinnamon", "1 tsp")],
    
    # Lunch - Salads
    "Caesar Salad": [("Lettuce", "1 head"), ("Parmesan", "1/2 cup"), ("Bread Crumb", "1/2 cup"), ("Caesar Dressing", "1/4 cup"), ("Lemon", "1")],
    "Chicken Caesar Salad": [("Chicken Breast", "2"), ("Lettuce", "1 head"), ("Parmesan", "1/2 cup"), ("Bread Crumb", "1/2 cup"), ("Caesar Dressing", "1/4 cup")],
    "Greek Salad": [("Tomato", "2"), ("Cucumber", "1"), ("Red Onion", "1/2"), ("Feta", "1/2 cup"), ("Olive", "1/4 cup"), ("Olive Oil", "3 tbsp")],
    "Garden Salad": [("Lettuce", "1 head"), ("Tomato", "2"), ("Cucumber", "1"), ("Carrot", "2"), ("Bell Pepper", "1")],
    "Tuna Salad": [("Tuna", "2 cans"), ("Mayonnaise", "3 tbsp"), ("Celery", "2 stalks"), ("Lettuce", "4 leaves")],
    "Chicken Salad": [("Chicken Breast", "2"), ("Mayonnaise", "3 tbsp"), ("Celery", "2 stalks"), ("Grape", "1/2 cup")],
    "Egg Salad": [("Egg", "4"), ("Mayonnaise", "3 tbsp"), ("Mustard", "1 tsp"), ("Celery", "2 stalks")],
    "Potato Salad": [("Potato", "4"), ("Mayonnaise", "1/2 cup"), ("Egg", "2"), ("Mustard", "1 tbsp"), ("Pickle", "1/4 cup")],
    "Coleslaw": [("Cabbage", "1/2"), ("Carrot", "2"), ("Mayonnaise", "1/2 cup"), ("Apple Cider Vinegar", "2 tbsp")],
    "Pasta Salad": [("Pasta", "8 oz"), ("Tomato", "2"), ("Cucumber", "1"), ("Feta", "1/2 cup"), ("Olive Oil", "3 tbsp")],
    
    # Lunch - Sandwiches
    "Grilled Cheese": [("Bread", "2 slices"), ("Cheddar", "2 slices"), ("Butter", "2 tbsp")],
    "Turkey Club": [("Bread", "3 slices"), ("Turkey", "4 oz"), ("Bacon", "3 strips"), ("Lettuce", "2 leaves"), ("Tomato", "2 slices")],
    "BLT": [("Bread", "2 slices"), ("Bacon", "4 strips"), ("Lettuce", "2 leaves"), ("Tomato", "2 slices"), ("Mayonnaise", "2 tbsp")],
    "Tuna Sandwich": [("Bread", "2 slices"), ("Tuna", "1 can"), ("Mayonnaise", "2 tbsp"), ("Lettuce", "2 leaves")],
    "Chicken Sandwich": [("Bread", "2 slices"), ("Chicken Breast", "1"), ("Lettuce", "2 leaves"), ("Tomato", "2 slices")],
    "Beef Sandwich": [("Bread", "2 slices"), ("Beef Steak", "6 oz"), ("Onion", "1/2"), ("Bell Pepper", "1/2")],
    "Ham and Cheese": [("Bread", "2 slices"), ("Ham", "3 oz"), ("Cheddar", "2 slices"), ("Mustard", "1 tbsp")],
    "Veggie Sandwich": [("Bread", "2 slices"), ("Avocado", "1/2"), ("Tomato", "2 slices"), ("Lettuce", "2 leaves"), ("Cucumber", "1/2")],
    
    # Lunch - Wraps
    "Wrap": [("Tortilla", "1"), ("Lettuce", "1/2 cup"), ("Tomato", "1/4 cup"), ("Cheese", "2 tbsp")],
    "Chicken Wrap": [("Tortilla", "1"), ("Chicken Breast", "4 oz"), ("Lettuce", "1/2 cup"), ("Tomato", "1/4 cup")],
    "Beef Wrap": [("Tortilla", "1"), ("Ground Beef", "4 oz"), ("Bean", "1/4 cup"), ("Cheese", "2 tbsp")],
    "Veggie Wrap": [("Tortilla", "1"), ("Avocado", "1/2"), ("Spinach", "1/2 cup"), ("Tomato", "1/4 cup")],
    
    # Lunch - Bowls
    "Bowl": [("Rice", "1 cup"), ("Bean", "1/4 cup"), ("Corn", "1/4 cup"), ("Cheese", "2 tbsp")],
    "Rice Bowl": [("Rice", "1 cup"), ("Chicken Breast", "4 oz"), ("Broccoli", "1/2 cup"), ("Carrot", "1/4 cup")],
    "Poke Bowl": [("Rice", "1 cup"), ("Tuna", "4 oz"), ("Edamame", "1/4 cup"), ("Cucumber", "1/4 cup"), ("Soy Sauce", "2 tbsp")],
    
    # Lunch - Pizza
    "Pizza": [("Flour", "2 cups"), ("Yeast", "1 tsp"), ("Tomato Sauce", "1/2 cup"), ("Mozzarella", "1 cup")],
    
    # Lunch - Tacos
    "Taco": [("Tortilla", "2"), ("Ground Beef", "4 oz"), ("Lettuce", "1/4 cup"), ("Tomato", "1/4 cup"), ("Cheddar", "2 tbsp")],
    "Fish Taco": [("Tortilla", "2"), ("Cod", "4 oz"), ("Cabbage", "1/2 cup"), ("Sour Cream", "2 tbsp")],
    "Chicken Taco": [("Tortilla", "2"), ("Chicken Breast", "4 oz"), ("Onion", "1/4"), ("Cilantro", "2 tbsp")],
    
    # Lunch - Panini
    "Panini": [("Bread", "2 slices"), ("Cheese", "2 slices"), ("Ham", "2 oz"), ("Butter", "2 tbsp")],
    
    # Lunch - Soup
    "Soup": [("Chicken Stock", "4 cups"), ("Carrot", "2"), ("Celery", "2 stalks"), ("Onion", "1")],
    
    # Dinner - Pasta
    "Spaghetti Bolognese": [("Pasta", "400g"), ("Ground Beef", "500g"), ("Onion", "1"), ("Garlic", "3 cloves"), ("Tomato Sauce", "2 cups")],
    "Pasta": [("Pasta", "400g"), ("Olive Oil", "3 tbsp"), ("Garlic", "4 cloves"), ("Parmesan", "1/2 cup")],
    "Chicken Pasta": [("Pasta", "400g"), ("Chicken Breast", "2"), ("Heavy Cream", "1 cup"), ("Parmesan", "1/2 cup")],
    
    # Dinner - Rice
    "Fried Rice": [("Rice", "3 cups"), ("Egg", "2"), ("Pea", "1/2 cup"), ("Carrot", "1/2 cup"), ("Soy Sauce", "3 tbsp")],
    "Rice Bowl": [("Rice", "2 cups"), ("Chicken Breast", "2"), ("Broccoli", "1 cup"), ("Soy Sauce", "3 tbsp")],
    "Risotto": [("Arborio Rice", "1.5 cups"), ("Chicken Stock", "4 cups"), ("Parmesan", "1/2 cup"), ("Butter", "3 tbsp"), ("Onion", "1")],
    
    # Dinner - Chicken
    "Grilled Chicken": [("Chicken Breast", "2"), ("Olive Oil", "2 tbsp"), ("Garlic", "2 cloves"), ("Rosemary", "1 tsp")],
    "Roasted Chicken": [("Chicken Breast", "2"), ("Butter", "3 tbsp"), ("Garlic", "4 cloves"), ("Thyme", "1 tsp")],
    "Chicken Stir Fry": [("Chicken Breast", "2"), ("Bell Pepper", "1"), ("Broccoli", "1 cup"), ("Soy Sauce", "3 tbsp")],
    "Chicken Curry": [("Chicken Breast", "2"), ("Coconut Milk", "1 can"), ("Curry Powder", "2 tbsp"), ("Onion", "1"), ("Rice", "2 cups")],
    "Chicken Fajitas": [("Chicken Breast", "2"), ("Bell Pepper", "2"), ("Onion", "1"), ("Tortilla", "4"), ("Lime", "1")],
    "Chicken Parmesan": [("Chicken Breast", "2"), ("Bread Crumb", "1 cup"), ("Marinara Sauce", "1 cup"), ("Mozzarella", "1 cup")],
    "Chicken BBQ": [("Chicken Breast", "2"), ("BBQ Sauce", "1/2 cup"), ("Onion", "1")],
    
    # Dinner - Beef
    "Beef Tacos": [("Ground Beef", "1 lb"), ("Taco Seasoning", "2 tbsp"), ("Tortilla", "8"), ("Lettuce", "1 cup"), ("Tomato", "1")],
    "Beef Stir Fry": [("Beef Steak", "1 lb"), ("Bell Pepper", "2"), ("Broccoli", "1 cup"), ("Soy Sauce", "1/4 cup")],
    "Beef Curry": [("Beef", "1 lb"), ("Coconut Milk", "1 can"), ("Curry Powder", "2 tbsp"), ("Potato", "2")],
    "Beef Stew": [("Beef", "1.5 lb"), ("Potato", "3"), ("Carrot", "3"), ("Onion", "1"), ("Beef Stock", "4 cups")],
    "Beef Stroganoff": [("Beef Steak", "1 lb"), ("Mushroom", "8 oz"), ("Heavy Cream", "1 cup"), ("Onion", "1")],
    "Beef BBQ Ribs": [("Beef", "2 lb"), ("BBQ Sauce", "1 cup"), ("Brown Sugar", "2 tbsp")],
    "Meatballs": [("Ground Beef", "1 lb"), ("Bread Crumb", "1/2 cup"), ("Egg", "1"), ("Parmesan", "1/4 cup")],
    
    # Dinner - Pork
    "Pork Chops": [("Pork", "4 chops"), ("Butter", "2 tbsp"), ("Garlic", "2 cloves"), ("Sage", "1 tsp")],
    "Pork Belly": [("Pork Belly", "1 lb"), ("Soy Sauce", "3 tbsp"), ("Honey", "2 tbsp"), ("Garlic", "4 cloves")],
    "Pork Stir Fry": [("Pork", "1 lb"), ("Bell Pepper", "2"), ("Broccoli", "1 cup"), ("Soy Sauce", "1/4 cup")],
    "Pork Tacos": [("Pork", "1 lb"), ("Taco Seasoning", "2 tbsp"), ("Tortilla", "8"), ("Onion", "1")],
    "Ham": [("Ham", "1 lb"), ("Honey", "2 tbsp"), ("Brown Sugar", "2 tbsp"), ("Mustard", "1 tbsp")],
    "Bacon": [("Bacon", "8 strips")],
    "Sausage": [("Sausage", "4 links"), ("Bell Pepper", "1"), ("Onion", "1")],
    
    # Dinner - Lamb
    "Lamb Chops": [("Lamb", "4 chops"), ("Rosemary", "2 sprigs"), ("Garlic", "4 cloves"), ("Olive Oil", "2 tbsp")],
    "Lamb Stew": [("Lamb", "1.5 lb"), ("Potato", "3"), ("Carrot", "3"), ("Onion", "1"), ("Chicken Stock", "4 cups")],
    "Lamb Curry": [("Lamb", "1 lb"), ("Coconut Milk", "1 can"), ("Curry Powder", "2 tbsp"), ("Rice", "2 cups")],
    "Lamb Fried Rice": [("Lamb", "8 oz"), ("Rice", "3 cups"), ("Egg", "2"), ("Pea", "1/2 cup")],
    
    # Dinner - Seafood
    "Grilled Salmon": [("Salmon", "2 fillets"), ("Olive Oil", "2 tbsp"), ("Lemon", "1"), ("Dill", "1 tsp")],
    "Baked Salmon": [("Salmon", "2 fillets"), ("Butter", "2 tbsp"), ("Garlic", "3 cloves"), ("Lemon", "1")],
    "Salmon Tacos": [("Salmon", "1 lb"), ("Tortilla", "8"), ("Cabbage", "1/2"), ("Sour Cream", "1/2 cup")],
    "Salmon Curry": [("Salmon", "1 lb"), ("Coconut Milk", "1 can"), ("Curry Powder", "2 tbsp"), ("Rice", "2 cups")],
    "Shrimp Scampi": [("Shrimp", "1 lb"), ("Butter", "4 tbsp"), ("Garlic", "6 cloves"), ("White Wine", "1/2 cup"), ("Pasta", "8 oz")],
    "Shrimp Stir Fry": [("Shrimp", "1 lb"), ("Bell Pepper", "2"), ("Broccoli", "1 cup"), ("Soy Sauce", "1/4 cup")],
    "Shrimp Tacos": [("Shrimp", "1 lb"), ("Tortilla", "8"), ("Cabbage", "1/2"), ("Lime", "1")],
    "Garlic Shrimp": [("Shrimp", "1 lb"), ("Garlic", "6 cloves"), ("Butter", "4 tbsp"), ("Parsley", "2 tbsp")],
    "Fish and Chips": [("Cod", "1 lb"), ("Flour", "1 cup"), ("Potato", "4 large"), ("Beer", "1 cup")],
    "Grilled Tuna": [("Tuna", "2 steaks"), ("Olive Oil", "2 tbsp"), ("Sesame Seed", "1 tbsp"), ("Soy Sauce", "2 tbsp")],
    "Tuna Steak": [("Tuna", "2 steaks"), ("Soy Sauce", "3 tbsp"), ("Sesame Oil", "1 tbsp"), ("Ginger", "1 inch")],
    "Cod": [("Cod", "2 fillets"), ("Butter", "2 tbsp"), ("Lemon", "1"), ("Parsley", "2 tbsp")],
    "Fish": [("Fish", "2 fillets"), ("Lemon", "1"), ("Butter", "2 tbsp"), ("Dill", "1 tsp")],
    "Crab Cakes": [("Crab", "1 lb"), ("Bread Crumb", "1/2 cup"), ("Mayonnaise", "3 tbsp"), ("Egg", "1")],
    "Lobster": [("Lobster", "2"), ("Butter", "4 tbsp"), ("Lemon", "1")],
    
    # Dinner - Vegetarian
    "Tofu Stir Fry": [("Tofu", "14 oz"), ("Bell Pepper", "2"), ("Broccoli", "1 cup"), ("Soy Sauce", "1/4 cup")],
    "Tofu Curry": [("Tofu", "14 oz"), ("Coconut Milk", "1 can"), ("Curry Powder", "2 tbsp"), ("Rice", "2 cups")],
    "Veggie Burger": [("Black Bean", "2 cans"), ("Bread Crumb", "1/2 cup"), ("Egg", "1"), ("Cumin", "1 tsp")],
    "Stuffed Pepper": [("Bell Pepper", "4"), ("Ground Beef", "1 lb"), ("Rice", "1 cup"), ("Tomato Sauce", "1 cup")],
    "Veggie Chili": [("Black Bean", "2 cans"), ("Kidney Bean", "1 can"), ("Tomato", "2"), ("Chili Powder", "2 tbsp")],
    "Eggplant Parmesan": [("Eggplant", "2"), ("Bread Crumb", "1 cup"), ("Marinara Sauce", "2 cups"), ("Mozzarella", "1 cup")],
    "Mushroom Risotto": [("Mushroom", "8 oz"), ("Arborio Rice", "1.5 cups"), ("Vegetable Stock", "4 cups"), ("Parmesan", "1/2 cup")],
    
    # Dinner - Casseroles
    "Casserole": [("Egg Noodle", "8 oz"), ("Chicken Breast", "2"), ("Cream of Mushroom", "1 can"), ("Cheddar", "1 cup")],
    "Lasagna": [("Pasta", "12 sheets"), ("Ground Beef", "1 lb"), ("Ricotta", "15 oz"), ("Marinara Sauce", "3 cups"), ("Mozzarella", "2 cups")],
    "Shepherd's Pie": [("Lamb", "1 lb"), ("Potato", "4"), ("Carrot", "3"), ("Pea", "1 cup"), ("Beef Stock", "1 cup")],
    "Enchiladas": [("Tortilla", "8"), ("Chicken Breast", "2"), ("Enchilada Sauce", "2 cups"), ("Cheddar", "2 cups")],
    "Burrito": [("Tortilla", "4"), ("Ground Beef", "1 lb"), ("Bean", "1 can"), ("Rice", "1 cup"), ("Cheese", "1 cup")],
    "Pad Thai": [("Rice Noodle", "8 oz"), ("Shrimp", "1 lb"), ("Egg", "2"), ("Bean Sprout", "1 cup"), ("Peanut", "1/4 cup")],
    "Lo Mein": [("Egg Noodle", "8 oz"), ("Chicken Breast", "2"), ("Bell Pepper", "1"), ("Soy Sauce", "1/4 cup")],
    "Noodles": [("Egg Noodle", "8 oz"), ("Sesame Oil", "2 tbsp"), ("Soy Sauce", "3 tbsp"), ("Garlic", "3 cloves")],
    
    # Dinner - Stews
    "Stew": [("Beef", "1.5 lb"), ("Potato", "3"), ("Carrot", "3"), ("Onion", "1"), ("Beef Stock", "4 cups")],
    "Chili": [("Ground Beef", "1 lb"), ("Kidney Bean", "2 cans"), ("Tomato", "2"), ("Chili Powder", "2 tbsp")],
    "Gumbo": [("Shrimp", "1 lb"), ("Sausage", "4 oz"), ("Bell Pepper", "2"), ("Onion", "1"), ("Rice", "2 cups")],
    "Curry": [("Chicken Breast", "2"), ("Coconut Milk", "1 can"), ("Curry Powder", "2 tbsp"), ("Rice", "2 cups")],
    
    # Dinner - Roasts
    "Roast": [("Beef", "3 lb"), ("Potato", "4"), ("Carrot", "4"), ("Onion", "1"), ("Garlic", "6 cloves")],
    "Prime Rib": [("Beef", "5 lb"), ("Garlic", "8 cloves"), ("Rosemary", "4 sprigs"), ("Thyme", "4 sprigs")],
    "Pork Roast": [("Pork", "3 lb"), ("Garlic", "6 cloves"), ("Sage", "2 tbsp"), ("Apple", "2")],
    "Lamb Roast": [("Lamb", "4 lb"), ("Garlic", "8 cloves"), ("Rosemary", "4 sprigs"), ("Mint", "2 tbsp")],
    "Duck Roast": [("Duck", "1"), ("Orange", "2"), ("Honey", "3 tbsp"), ("Soy Sauce", "3 tbsp")],
    "Turkey": [("Turkey", "12 lb"), ("Butter", "1 cup"), ("Garlic", "8 cloves"), ("Thyme", "4 sprigs")],
    "Mediterranean": [("Lamb", "1 lb"), ("Olive", "1/2 cup"), ("Feta", "1/2 cup"), ("Tomato", "2"), ("Oregano", "1 tsp")],
    "Asian": [("Chicken Breast", "2"), ("Soy Sauce", "1/4 cup"), ("Ginger", "2 inch"), ("Garlic", "4 cloves"), ("Rice", "2 cups")],
    "Mexican": [("Chicken Breast", "2"), ("Taco Seasoning", "2 tbsp"), ("Tortilla", "8"), ("Bean", "1 can"), ("Rice", "1 cup")],
    "Italian": [("Chicken Breast", "2"), ("Marinara Sauce", "1 cup"), ("Mozzarella", "1 cup"), ("Pasta", "8 oz")],
    "Indian": [("Chicken Breast", "2"), ("Yogurt", "1 cup"), ("Garam Masala", "2 tbsp"), ("Ginger", "1 inch"), ("Rice", "2 cups")],
    "French": [("Chicken Breast", "2"), ("Butter", "4 tbsp"), ("Garlic", "4 cloves"), ("Thyme", "2 tsp"), ("White Wine", "1/2 cup")],
    "Thai": [("Shrimp", "1 lb"), ("Coconut Milk", "1 can"), ("Red Curry Paste", "2 tbsp"), ("Rice", "2 cups")],
    "Chinese": [("Chicken Breast", "2"), ("Soy Sauce", "1/4 cup"), ("Ginger", "2 inch"), ("Garlic", "4 cloves"), ("Rice", "2 cups")],
    "Japanese": [("Salmon", "2 fillets"), ("Soy Sauce", "3 tbsp"), ("Mirin", "2 tbsp"), ("Rice", "2 cups")],
    "Korean": [("Beef", "1 lb"), ("Soy Sauce", "1/4 cup"), ("Sesame Oil", "2 tbsp"), ("Garlic", "4 cloves"), ("Rice", "2 cups")],
    "Greek": [("Lamb", "1 lb"), ("Olive Oil", "3 tbsp"), ("Oregano", "1 tsp"), ("Lemon", "1"), ("Rice", "2 cups")],
    "Moroccan": [("Lamb", "1 lb"), ("Couscous", "1 cup"), ("Cinnamon", "1 tsp"), ("Cumin", "1 tsp"), ("Chicken Stock", "2 cups")],
    
    # Sides
    "Mashed Potatoes": [("Potato", "4"), ("Butter", "4 tbsp"), ("Milk", "1/2 cup"), ("Salt", "to taste")],
    "Roasted Vegetables": [("Carrot", "3"), ("Potato", "3"), ("Bell Pepper", "2"), ("Olive Oil", "3 tbsp"), ("Rosemary", "1 tsp")],
    "Steamed Broccoli": [("Broccoli", "1 head"), ("Lemon", "1"), ("Garlic", "2 cloves")],
    "Sauteed Spinach": [("Spinach", "4 cups"), ("Garlic", "3 cloves"), ("Olive Oil", "2 tbsp")],
    "Coleslaw": [("Cabbage", "1/2"), ("Carrot", "2"), ("Mayonnaise", "1/2 cup"), ("Apple Cider Vinegar", "2 tbsp")],
    "Green Salad": [("Lettuce", "1 head"), ("Tomato", "2"), ("Cucumber", "1"), ("Olive Oil", "3 tbsp")],
    "French Fries": [("Potato", "4"), ("Vegetable Oil", "4 cups"), ("Salt", "to taste")],
    
    # Desserts
    "Chocolate Chip Cookies": [("Flour", "2.25 cups"), ("Butter", "1 cup"), ("Sugar", "3/4 cup"), ("Brown Sugar", "3/4 cup"), ("Egg", "2"), ("Chocolate Chips", "2 cups"), ("Vanilla Extract", "1 tsp")],
    "Chocolate Cake": [("Flour", "2 cups"), ("Cocoa Powder", "3/4 cup"), ("Sugar", "2 cups"), ("Egg", "3"), ("Butter", "1 cup"), ("Baking Powder", "2 tsp")],
    "Vanilla Cake": [("Flour", "2.5 cups"), ("Sugar", "1.75 cups"), ("Butter", "1 cup"), ("Egg", "3"), ("Vanilla Extract", "2 tsp"), ("Baking Powder", "2.5 tsp")],
    "Brownies": [("Butter", "1/2 cup"), ("Sugar", "1 cup"), ("Egg", "2"), ("Cocoa Powder", "1/3 cup"), ("Flour", "1/2 cup"), ("Chocolate Chips", "1 cup")],
    "Cheesecake": [("Cream Cheese", "32 oz"), ("Sugar", "1 cup"), ("Egg", "4"), ("Vanilla Extract", "2 tsp"), ("Graham Cracker", "2 cups")],
    "Apple Pie": [("Apple", "6"), ("Sugar", "3/4 cup"), ("Cinnamon", "1 tsp"), ("Flour", "2"), ("Butter", "1/2 cup")],
    "Lemon Tart": [("Lemon", "4"), ("Sugar", "1 cup"), ("Egg", "3"), ("Butter", "1/2 cup"), ("Pie Crust", "1")],
    "Tiramisu": [("Mascarpone", "16 oz"), ("Espresso", "1.5 cups"), ("Egg", "4"), ("Sugar", "1/2 cup"), ("Cocoa Powder", "2 tbsp")],
    "Ice Cream": [("Heavy Cream", "2 cups"), ("Milk", "1 cup"), ("Sugar", "3/4 cup"), ("Vanilla Extract", "2 tsp"), ("Egg Yolk", "6")],
    "Pudding": [("Milk", "2 cups"), ("Sugar", "1/3 cup"), ("Corn Starch", "3 tbsp"), ("Vanilla Extract", "1 tsp")],
    "Mousse": [("Dark Chocolate", "8 oz"), ("Heavy Cream", "1 cup"), ("Egg", "3"), ("Sugar", "2 tbsp")],
    "Panna Cotta": [("Heavy Cream", "2 cups"), ("Vanilla Extract", "1 tsp"), ("Gelatin", "2.5 tsp"), ("Sugar", "1/4 cup")],
    "Crumble": [("Apple", "4"), ("Oat", "1 cup"), ("Brown Sugar", "1/2 cup"), ("Butter", "1/2 cup"), ("Cinnamon", "1 tsp")],
    "Cobbler": [("Peach", "6"), ("Sugar", "1 cup"), ("Flour", "1 cup"), ("Butter", "1/2 cup"), ("Baking Powder", "1 tsp")],
    "Custard": [("Milk", "2 cups"), ("Egg", "4"), ("Sugar", "1/2 cup"), ("Vanilla Extract", "1 tsp")],
    " Flan": [("Egg", "4"), ("Condensed Milk", "14 oz"), ("Evaporated Milk", "12 oz"), ("Vanilla Extract", "1 tsp")],
    "Bread Pudding": [("Bread", "6 cups"), ("Milk", "2 cups"), ("Egg", "3"), ("Sugar", "1/2 cup"), ("Cinnamon", "1 tsp"), ("Butter", "4 tbsp")],
    "Cupcake": [("Flour", "1.5 cups"), ("Sugar", "1 cup"), ("Butter", "1/2 cup"), ("Egg", "2"), ("Baking Powder", "1.5 tsp"), ("Vanilla Extract", "1 tsp")],
    "Macaron": [("Almond", "1 cup"), ("Powdered Sugar", "2 cups"), ("Egg White", "3"), ("Sugar", "1/2 cup")],
    "Gelato": [("Milk", "2 cups"), ("Heavy Cream", "1 cup"), ("Sugar", "2/3 cup"), ("Egg Yolk", "4"), ("Vanilla Extract", "1 tbsp")],
    "Sorbet": [("Frozen Fruit", "3 cups"), ("Sugar", "1/2 cup"), ("Lemon", "1")],
    "Tart": [("Flour", "1.5 cups"), ("Butter", "1/2 cup"), ("Sugar", "1/4 cup"), ("Egg", "1"), ("Fruit", "2 cups")],
    "Parfait": [("Greek Yogurt", "1 cup"), ("Granola", "1/2 cup"), ("Fruit", "1/2 cup"), ("Honey",