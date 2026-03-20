#!/usr/bin/env python3
"""
Audit generated recipe SQL files for validity.
Checks:
1. All ingredients exist in the Supabase database
2. All ingredients in the SQL match the valid ingredient list exactly
3. Category is valid
4. cuisine is valid

Usage:
    python3 audit-recipes.py /path/to/generated-recipes/YYYY-MM-DD-HH-MM-*.sql
    python3 audit-recipes.py --latest  # audit most recent batch
"""

import re
import sys
import os
import glob
import json
import subprocess
from pathlib import Path

# Config
SUPABASE_URL = "https://owmwdsypvvaxsckflbxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU"
INGREDIENT_LIST_PATH = Path(__file__).parent.parent / "scripts" / "ingredient-names.txt"

VALID_CATEGORIES = {"breakfast", "lunch", "dinner", "snack", "dessert"}
VALID_CUISINES = {
    "Italian", "Mexican", "American", "Korean", "Japanese", "Thai", "Vietnamese", "Chinese",
    "Greek", "Spanish", "Turkish", "French", "Indian", "Brazilian", "Peruvian", "Argentinian",
    "Colombian", "Middle Eastern", "Caribbean", "Latin American", "Mediterranean", "Asian"
}


def load_valid_ingredients():
    """Load ingredient names from the local file."""
    if not INGREDIENT_LIST_PATH.exists():
        # Fallback: fetch from API
        print(f"Warning: {INGREDIENT_LIST_PATH} not found, fetching from API", file=sys.stderr)
        return fetch_ingredients_from_api()
    
    with open(INGREDIENT_LIST_PATH) as f:
        return set(line.strip() for line in f if line.strip())


def fetch_ingredients_from_api():
    """Fetch all ingredient names from Supabase API with pagination."""
    all_names = set()
    for offset in [0, 1000]:
        result = subprocess.run([
            'curl', '-s',
            f'{SUPABASE_URL}/rest/v1/ingredients?select=name&limit=1000&offset={offset}',
            '-H', f'apikey: {SUPABASE_KEY}',
            '-H', f'Authorization: Bearer {SUPABASE_KEY}'
        ], capture_output=True, text=True)
        try:
            data = json.loads(result.stdout)
            for d in data:
                name = d.get('name', '').strip()
                if name:
                    all_names.add(name)
        except json.JSONDecodeError:
            pass
    return all_names


def extract_from_sql(filepath):
    """Extract key data from a recipe SQL file."""
    with open(filepath) as f:
        content = f.read()
    
    issues = []
    
    # Recipe name
    name_match = re.search(r"VALUES\s*\(\s*N?'([^']+)'", content)
    recipe_name = name_match.group(1) if name_match else "UNKNOWN"
    
    # Category
    cat_match = re.search(r"'?(breakfast|lunch|dinner|snack|dessert)'?", content, re.IGNORECASE)
    category = cat_match.group(1).lower() if cat_match else None
    if category and category not in VALID_CATEGORIES:
        issues.append(f"Invalid category: '{category}'")
    
    # Cuisine
    cuisine_match = re.search(r"ARRAY\['([^']+)'\]", content)
    cuisine = cuisine_match.group(1) if cuisine_match else None
    if cuisine and cuisine not in VALID_CUISINES:
        issues.append(f"Invalid cuisine: '{cuisine}'")
    
    # Ingredients from WHERE clause
    where_match = re.search(r"WHERE name ILIKE ANY \(ARRAY\[(.*?)\]\)", content, re.DOTALL)
    if not where_match:
        issues.append("Could not find WHERE clause")
        return recipe_name, category, [], issues
    
    ingredients = re.findall(r"'([^']+)'", where_match.group(1))
    ingredients = [ing.strip() for ing in ingredients]
    
    return recipe_name, category, ingredients, issues


def audit_files(filepaths, valid_ingredients):
    """Audit a list of SQL files."""
    results = {
        "total": len(filepaths),
        "valid": [],
        "invalid": [],
        "summary": {"ingredients_ok": 0, "ingredients_bad": 0, "files_checked": 0}
    }
    
    for filepath in sorted(filepaths):
        fname = os.path.basename(filepath)
        recipe_name, category, ingredients, issues = extract_from_sql(filepath)
        
        # Check ingredients against valid list
        bad_ingredients = [ing for ing in ingredients if ing not in valid_ingredients]
        
        status = "✅ VALID" if not bad_ingredients and not issues else "❌ INVALID"
        
        print(f"\n{'='*60}")
        print(f"  {fname}")
        print(f"  Recipe: {recipe_name}")
        print(f"  Category: {category or 'MISSING'}")
        print(f"  Ingredients: {len(ingredients)}")
        
        if bad_ingredients:
            for ing in bad_ingredients:
                print(f"    ❌ '{ing}' — NOT in database")
                issues.append(f"Unknown ingredient: {ing}")
        
        if issues:
            for issue in issues:
                print(f"    ⚠️  {issue}")
        
        print(f"  → {status}")
        
        entry = {
            "file": fname,
            "recipe": recipe_name,
            "category": category,
            "ingredients_count": len(ingredients),
            "bad_ingredients": bad_ingredients,
            "issues": issues,
            "valid": len(bad_ingredients) == 0 and len(issues) == 0
        }
        
        if entry["valid"]:
            results["valid"].append(entry)
        else:
            results["invalid"].append(entry)
        
        results["summary"]["files_checked"] += 1
        if bad_ingredients:
            results["summary"]["ingredients_bad"] += 1
        else:
            results["summary"]["ingredients_ok"] += 1
    
    return results


def get_latest_batch():
    """Find the most recent batch of recipe SQL files."""
    pattern = "/home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/recipe-*.sql"
    files = glob.glob(pattern)
    
    # Group by timestamp prefix
    batches = {}
    for f in files:
        fname = os.path.basename(f)
        # Match recipe-YYYY-MM-DD-HH-MM-N.sql or recipe-YYYY-MM-DD-HH-MM.sql
        m = re.match(r'(recipe-\d{4}-\d{2}-\d{2}-\d{2}-\d{2})(?:-\d+)?\.sql', fname)
        if m:
            prefix = m.group(1)
            if prefix not in batches:
                batches[prefix] = []
            batches[prefix].append(f)
    
    if not batches:
        return []
    
    # Return most recent batch
    latest_prefix = max(batches.keys())
    return sorted(batches[latest_prefix])


def main():
    if "--latest" in sys.argv:
        filepaths = get_latest_batch()
        if not filepaths:
            print("No recipe SQL files found.")
            sys.exit(1)
        print(f"Auditing latest batch: {os.path.basename(os.path.dirname(filepaths[0]))}/")
        print(f"Files found: {len(filepaths)}")
    elif len(sys.argv) > 1:
        filepaths = []
        for arg in sys.argv[1:]:
            filepaths.extend(glob.glob(arg))
        filepaths = sorted(set(filepaths))
    else:
        print(__doc__)
        sys.exit(1)
    
    valid_ingredients = load_valid_ingredients()
    print(f"Loaded {len(valid_ingredients)} valid ingredients")
    
    results = audit_files(filepaths, valid_ingredients)
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"  Files checked: {results['summary']['files_checked']}")
    print(f"  ✅ Valid:   {len(results['valid'])}")
    print(f"  ❌ Invalid: {len(results['invalid'])}")
    
    if results["invalid"]:
        print(f"\n⚠️  {len(results['invalid'])} file(s) have issues and should NOT be imported:")
        for entry in results["invalid"]:
            print(f"  - {entry['file']}: {entry['recipe']}")
            for bad in entry["bad_ingredients"]:
                print(f"      bad ingredient: {bad}")
        sys.exit(1)
    else:
        print(f"\n✅ All {len(results['valid'])} recipes are valid and ready to import!")
        sys.exit(0)


if __name__ == "__main__":
    main()
