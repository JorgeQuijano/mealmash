#!/usr/bin/env python3
"""
Deduplicate generated recipes against existing Supabase recipes.

Uses a hybrid approach:
- Name similarity (40% weight): Jaccard similarity on normalized word sets
- Ingredient overlap (60% weight): Jaccard similarity on ingredient name sets

If combined score >= 0.75, the recipe is flagged as a probable duplicate.

Usage:
    python3 dedup-recipes.py --latest              # dedup latest batch
    python3 dedup-recipes.py recipe-2026-03-20-18-04-*.sql
    python3 dedup-recipes.py --dry-run recipe-2026-03-20-18-04-1.sql
"""

import re
import sys
import os
import json
import glob
import subprocess
import argparse
from pathlib import Path
from collections import defaultdict

# Config
SUPABASE_URL = "https://owmwdsypvvaxsckflbxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU"

DUPLICATE_THRESHOLD = 1.0       # Only block exact duplicate (name+ingredients identical)
VERSION_LINK_THRESHOLD = 0.8   # Score >= 0.8 → link to same version group
NAME_WEIGHT = 0.4
INGREDIENT_WEIGHT = 0.6

EXISTING_RECIPES_CACHE = Path(__file__).parent.parent / "scripts" / "existing-recipes.json"
GENERATED_DIR = Path(__file__).parent.parent / "generated-recipes"


# ─────────────────────────────────────────────────────────────────
# Supabase API helpers
# ─────────────────────────────────────────────────────────────────

def fetch_existing_recipes():
    """
    Fetch all recipes + their ingredients from Supabase.
    Returns a list of dicts: {name, normalized_name, ingredients: set(), cuisine}
    """
    # Fetch recipes
    recipes = []
    for offset in [0, 1000, 2000]:
        result = subprocess.run([
            'curl', '-s',
            f'{SUPABASE_URL}/rest/v1/recipes?select=id,name,category,cuisine,version_group_id&limit=1000&offset={offset}',
            '-H', f'apikey: {SUPABASE_KEY}',
            '-H', f'Authorization: Bearer {SUPABASE_KEY}'
        ], capture_output=True, text=True)
        try:
            data = json.loads(result.stdout)
            if not data:
                break
            recipes.extend(data)
        except json.JSONDecodeError:
            pass

    # Fetch recipe_ingredients for all recipe IDs in one go (batched)
    recipe_ids = [r['id'] for r in recipes]
    
    # Build a map of recipe_id -> ingredient names
    ingredient_map = defaultdict(set)
    
    if recipe_ids:
        # Fetch in batches of 100
        for i in range(0, len(recipe_ids), 100):
            batch = recipe_ids[i:i+100]
            ids_param = ','.join(batch)
            result = subprocess.run([
                'curl', '-s',
                f'{SUPABASE_URL}/rest/v1/recipe_ingredients?recipe_id=in.({ids_param})&select=recipe_id,ingredient_id',
                '-H', f'apikey: {SUPABASE_KEY}',
                '-H', f'Authorization: Bearer {SUPABASE_KEY}'
            ], capture_output=True, text=True)
            try:
                ri_data = json.loads(result.stdout)
                if not isinstance(ri_data, list) or not ri_data:
                    continue
                # Collect all ingredient IDs from this batch
                all_ing_ids = set(ri['ingredient_id'] for ri in ri_data)
                if all_ing_ids:
                    # Fetch all ingredient names in one call
                    ing_ids_param = ','.join(str(i) for i in all_ing_ids)
                    ing_result = subprocess.run([
                        'curl', '-s',
                        f'{SUPABASE_URL}/rest/v1/ingredients?id=in.({ing_ids_param})&select=id,name',
                        '-H', f'apikey: {SUPABASE_KEY}',
                        '-H', f'Authorization: Bearer {SUPABASE_KEY}'
                    ], capture_output=True, text=True)
                    ing_map = {}
                    for ing in json.loads(ing_result.stdout):
                        ing_map[ing['id']] = ing['name']
                    
                    for ri in ri_data:
                        ing_name = ing_map.get(ri['ingredient_id'])
                        if ing_name:
                            ingredient_map[ri['recipe_id']].add(ing_name)
            except (json.JSONDecodeError, TypeError):
                pass

    # Build return structure
    existing = []
    for r in recipes:
        entry = {
            'id': r['id'],
            'name': r['name'],
            'normalized_name': normalize_name(r['name']),
            'ingredients': ingredient_map.get(r['id'], set()),
            'cuisine': r.get('cuisine', []),
            'category': r.get('category', ''),
            'version_group_id': r.get('version_group_id'),
        }
        existing.append(entry)

    return existing


def load_existing_recipes(force_refresh=False):
    """Load from cache or fetch fresh from Supabase."""
    if not force_refresh and EXISTING_RECIPES_CACHE.exists():
        age = os.path.getmtime(EXISTING_RECIPES_CACHE)
        import time
        # Cache valid for 1 hour
        if (time.time() - age) < 3600:
            with open(EXISTING_RECIPES_CACHE) as f:
                cached = json.load(f)
                # Convert ingredient lists back to sets
                for r in cached:
                    r['ingredients'] = set(r['ingredients'])
                    r['normalized_name'] = normalize_name(r['name'])
                    r['version_group_id'] = r.get('version_group_id')
                return cached

    print("Fetching existing recipes from Supabase...", file=sys.stderr)
    existing = fetch_existing_recipes()
    
    # Save to cache (convert sets to lists for JSON)
    cache_data = []
    for r in existing:
        cache_data.append({
            'id': r['id'],
            'name': r['name'],
            'ingredients': list(r['ingredients']),
            'cuisine': r['cuisine'],
            'category': r['category'],
            'version_group_id': r.get('version_group_id'),
        })
    with open(EXISTING_RECIPES_CACHE, 'w') as f:
        json.dump(cache_data, f)
    
    print(f"Cached {len(existing)} existing recipes", file=sys.stderr)
    return existing


# ─────────────────────────────────────────────────────────────────
# Name normalization
# ─────────────────────────────────────────────────────────────────

def normalize_name(name: str) -> set:
    """
    Normalize a recipe name into a set of meaningful words.
    - Lowercase
    - Remove punctuation
    - Remove common stopwords
    - Split into words
    """
    stopwords = {
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at',
        'to', 'for', 'with', 'by', 'of', 'from', 'up', 'down',
        'over', 'under', 'into', 'out', 'off', 'as', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'its', 'it'
    }
    name = name.lower()
    # Remove punctuation: keep only alphanumeric and spaces
    name = re.sub(r'[^a-z0-9\s]', '', name)
    words = name.split()
    return set(w for w in words if w not in stopwords and len(w) > 1)


# ─────────────────────────────────────────────────────────────────
# Similarity scoring
# ─────────────────────────────────────────────────────────────────

def jaccard_similarity(set_a: set, set_b: set) -> float:
    """Jaccard similarity between two sets: |A∩B| / |A∪B|"""
    if not set_a and not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def name_similarity(recipe_a: dict, recipe_b: dict) -> float:
    """40% weight — Jaccard on normalized word sets."""
    words_a = recipe_a['normalized_name']
    words_b = recipe_b['normalized_name']
    return jaccard_similarity(words_a, words_b)


def ingredient_similarity(recipe_a: dict, recipe_b: dict) -> float:
    """60% weight — Jaccard on ingredient name sets."""
    # Normalize ingredient names for comparison (lowercase, strip)
    ing_a = set(i.lower().strip() for i in recipe_a['ingredients'])
    ing_b = set(i.lower().strip() for i in recipe_b['ingredients'])
    return jaccard_similarity(ing_a, ing_b)


def combined_similarity(new_recipe: dict, existing_recipe: dict) -> dict:
    """
    Compute combined similarity score.
    Returns dict with score breakdown and recommendation.
    """
    s_name = name_similarity(new_recipe, existing_recipe)
    s_ing = ingredient_similarity(new_recipe, existing_recipe)
    score = NAME_WEIGHT * s_name + INGREDIENT_WEIGHT * s_ing
    
    # Debug info for high scores
    words_new = new_recipe['normalized_name']
    words_ex = existing_recipe['normalized_name']
    shared_words = words_new & words_ex
    
    return {
        'score': round(score, 3),
        'name_score': round(s_name, 3),
        'ingredient_score': round(s_ing, 3),
        'shared_words': list(shared_words),
        'duplicate': score >= DUPLICATE_THRESHOLD,
        'existing_name': existing_recipe['name'],
        'existing_id': existing_recipe['id'],
        'version_group_id': existing_recipe.get('version_group_id'),
    }


# ─────────────────────────────────────────────────────────────────
# Parse new recipe SQL files
# ─────────────────────────────────────────────────────────────────

def parse_recipe_sql(filepath: str) -> dict:
    """
    Extract recipe name and ingredients from a SQL file.
    Returns {name, normalized_name, ingredients: set(), cuisine, category}
    """
    with open(filepath) as f:
        content = f.read()
    
    # Recipe name
    name_match = re.search(r"VALUES\s*\(\s*N?'([^']+)'", content)
    name = name_match.group(1) if name_match else Path(filepath).stem
    
    # Category
    cat_match = re.search(r"'(breakfast|lunch|dinner|snack|dessert)'", content, re.IGNORECASE)
    category = cat_match.group(1).lower() if cat_match else 'dinner'
    
    # Cuisine
    cuisine_match = re.search(r"ARRAY\['([^']+)'\]", content)
    cuisine = cuisine_match.group(1) if cuisine_match else 'Unknown'
    
    # Ingredients from WHERE clause — try both old format (ILIKE ANY) and new format (IN inside CTE)
    ingredients = []
    # New format: WITH ingredient_ids AS (... WHERE name IN ('Lamb', 'Garlic', ...))
    cte_match = re.search(r"WHERE name IN \((.*?)\)", content, re.DOTALL)
    if cte_match:
        ingredients = [ing.strip() for ing in re.findall(r"'([^']+)'", cte_match.group(1))]
    else:
        # Old format: WHERE name ILIKE ANY (ARRAY[...])
        where_match = re.search(r"WHERE name ILIKE ANY \(ARRAY\[(.*?)\]\)", content, re.DOTALL)
        if where_match:
            ingredients = [ing.strip() for ing in re.findall(r"'([^']+)'", where_match.group(1))]
        else:
            ingredients = []
    
    return {
        'name': name,
        'normalized_name': normalize_name(name),
        'ingredients': set(ingredients),
        'cuisine': cuisine,
        'category': category,
        'filepath': filepath,
    }


def get_latest_batch():
    """Find the most recent batch of recipe SQL files."""
    pattern = str(GENERATED_DIR / "recipe-*.sql")
    files = glob.glob(pattern)
    
    batches = {}
    for f in files:
        fname = os.path.basename(f)
        m = re.match(r'(recipe-\d{4}-\d{2}-\d{2}-\d{2}-\d{2})(?:-\d+)?\.sql', fname)
        if m:
            prefix = m.group(1)
            if prefix not in batches:
                batches[prefix] = []
            batches[prefix].append(f)
    
    if not batches:
        return []
    
    latest_prefix = max(batches.keys())
    return sorted(batches[latest_prefix])


# ─────────────────────────────────────────────────────────────────
# Main deduplication logic
# ─────────────────────────────────────────────────────────────────

def check_recipe_against_existing(new_recipe: dict, existing_recipes: list) -> dict:
    """
    Compare a new recipe against all existing recipes.
    Returns the highest-scoring match and its details.
    """
    best = {
        'score': 0.0,
        'name_score': 0.0,
        'ingredient_score': 0.0,
        'shared_words': [],
        'duplicate': False,
        'existing_name': None,
        'existing_id': None,
        'version_group_id': None,   # set when score >= VERSION_LINK_THRESHOLD
    }
    
    for existing in existing_recipes:
        result = combined_similarity(new_recipe, existing)
        if result['score'] > best['score']:
            best = result
        # Track the best version_group_id among matches above threshold
        if (result['score'] >= VERSION_LINK_THRESHOLD
                and result['version_group_id']
                and best.get('linked_version_group_id') is None):
            best['linked_version_group_id'] = result['version_group_id']
    
    # If the best score itself qualifies, use its version_group_id
    if best['score'] >= VERSION_LINK_THRESHOLD and best['version_group_id']:
        best['linked_version_group_id'] = best['version_group_id']
    
    return best


def checkIntraBatchDuplicates(filepaths: list, existing_recipes: list) -> dict:
    """
    Check all recipes within the same batch against each other.
    Returns dict of filepath -> (other_fname, score, other_name) to discard.
    If two recipes in the same batch are duplicates, only discard the one
    with lower name similarity to existing DB (less established).
    """
    recipes = []
    for filepath in filepaths:
        try:
            recipe = parse_recipe_sql(filepath)
            recipe['filepath'] = filepath
            recipes.append(recipe)
        except Exception:
            pass
    
    # Precompute DB name similarity for tiebreaking
    db_name_sim = {}
    for r in recipes:
        best = 0.0
        for existing in existing_recipes:
            sim = jaccard_similarity(r['normalized_name'], existing['normalized_name'])
            if sim > best:
                best = sim
        fname = os.path.basename(r['filepath'])
        db_name_sim[fname] = best
    
    discard = {}  # fname to discard -> (other_fname, score, other_name)
    
    for i, r_a in enumerate(recipes):
        for r_b in recipes[i+1:]:
            s_name = jaccard_similarity(r_a['normalized_name'], r_b['normalized_name'])
            s_ing = jaccard_similarity(r_a['ingredients'], r_b['ingredients'])
            score = NAME_WEIGHT * s_name + INGREDIENT_WEIGHT * s_ing
            if score >= DUPLICATE_THRESHOLD:
                fname_a = os.path.basename(r_a['filepath'])
                fname_b = os.path.basename(r_b['filepath'])
                # Keep the one with higher DB name similarity
                if db_name_sim[fname_a] >= db_name_sim[fname_b]:
                    discard[fname_a] = (fname_b, score, r_b['name'])
                else:
                    discard[fname_b] = (fname_a, score, r_a['name'])
    
    return discard


def dedup_files(filepaths: list, existing_recipes: list, dry_run: bool = False) -> dict:
    """
    Deduplicate a list of recipe SQL files against existing recipes AND
    within the same batch.
    
    Returns dict:
      - keep: list of files to keep
      - discard: list of files to discard with reasons
      - details: per-file scoring breakdown
    """
    results = {
        'total': len(filepaths),
        'keep': [],
        'discard': [],
        'details': {},
    }
    
    # First: intra-batch check
    print("\n─── Intra-batch dedup ───")
    intra_dupes = checkIntraBatchDuplicates(filepaths, existing_recipes)
    if intra_dupes:
        for fname, (other_fname, score, other_name) in intra_dupes.items():
            print(f"  ❌ {fname} is duplicate of {other_name} ({score:.3f}) → DISCARD")
    else:
        print("  No intra-batch duplicates found.")
    
    for filepath in sorted(filepaths):
        fname = os.path.basename(filepath)
        print(f"\n─── DB dedup ───")
        print(f"Checking: {fname}")
        
        try:
            recipe = parse_recipe_sql(filepath)
        except Exception as e:
            print(f"  ⚠️  Failed to parse: {e}")
            results['discard'].append({'file': fname, 'reason': f'Parse error: {e}'})
            continue
        
        print(f"  Recipe: {recipe['name']}")
        print(f"  Ingredients ({len(recipe['ingredients'])}): {', '.join(sorted(recipe['ingredients']))}")
        
        match = check_recipe_against_existing(recipe, existing_recipes)
        
        print(f"  Name similarity:    {match['name_score']:.3f} (weight: {NAME_WEIGHT})")
        print(f"  Ingredient overlap:  {match['ingredient_score']:.3f} (weight: {INGREDIENT_WEIGHT})")
        print(f"  Combined score:      {match['score']:.3f} (threshold: {DUPLICATE_THRESHOLD})")
        
        if match['existing_name']:
            print(f"  Closest existing:    \"{match['existing_name']}\"")
        
        if match['shared_words']:
            print(f"  Shared words:        {match['shared_words']}")
        
        # Also flag if this file was flagged as intra-batch duplicate
        is_intra_dup = fname in intra_dupes
        
        # Determine version grouping (link if score >= VERSION_LINK_THRESHOLD)
        linked_vg = match.get('linked_version_group_id')
        is_linked = match['score'] >= VERSION_LINK_THRESHOLD and linked_vg
        
        results['details'][fname] = {
            'recipe': recipe['name'],
            'ingredients': list(recipe['ingredients']),
            'score': match['score'],
            'name_score': match['name_score'],
            'ingredient_score': match['ingredient_score'],
            'existing_name': match['existing_name'],
            'existing_id': match['existing_id'],
            'duplicate': match['duplicate'] or is_intra_dup,
            'intra_batch_duplicate': is_intra_dup,
            'version_group_id': linked_vg if is_linked else None,
            'is_new_version_group': not is_linked,
        }
        
        if match['duplicate']:
            # Exact duplicate (score == 1.0) → discard
            print(f"  → ❌ DISCARD (exact duplicate, score {match['score']} == {DUPLICATE_THRESHOLD})")
            results['discard'].append({
                'file': fname,
                'filepath': filepath,
                'reason': f"Exact duplicate of '{match['existing_name']}' (score: {match['score']:.3f})",
                'match': match,
            })
        elif is_intra_dup:
            # Intra-batch similar → keep and link to the DB match of the recipe it's similar to
            other_fname, score, other_name = intra_dupes[fname]
            # Find the DB match for the other recipe in this batch
            other_match_vg = None
            other_details = results['details'].get(other_fname, {})
            if other_details.get('version_group_id'):
                other_match_vg = other_details['version_group_id']
            elif other_details.get('is_new_version_group'):
                # Other recipe is new group — use a placeholder, we'll assign same new UUID
                other_match_vg = 'SAME_BATCH_NEW'
            print(f"  → ✅ KEEP + LINK (intra-batch similar to '{other_name}', score {score:.3f})")
            results['keep'].append({
                'file': fname,
                'filepath': filepath,
                'recipe': recipe['name'],
                'score': match['score'],
                'version_group_id': other_match_vg if other_match_vg else linked_vg,
                'linked_to': other_name,
                'same_batch_link': True,
            })
        elif is_linked:
            # Similar to existing DB recipe → keep and link to its version group
            print(f"  → ✅ KEEP + LINK (score {match['score']} >= {VERSION_LINK_THRESHOLD})")
            print(f"     → Version group: {linked_vg}")
            results['keep'].append({
                'file': fname,
                'filepath': filepath,
                'recipe': recipe['name'],
                'score': match['score'],
                'version_group_id': linked_vg,
                'linked_to': match['existing_name'],
            })
        else:
            # New recipe, new version group
            print(f"  → ✅ KEEP (new version group, score {match['score']} < {VERSION_LINK_THRESHOLD})")
            results['keep'].append({
                'file': fname,
                'filepath': filepath,
                'recipe': recipe['name'],
                'score': match['score'],
                'version_group_id': None,  # import script generates new UUID
                'is_new': True,
            })
    
    return results


# ─────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Deduplicate generated recipes against existing Supabase recipes")
    parser.add_argument('--latest', action='store_true', help="Dedup the most recent batch")
    parser.add_argument('--refresh', action='store_true', help="Force refresh of existing recipes cache")
    parser.add_argument('--dry-run', action='store_true', help="Show what would be discarded without deleting")
    parser.add_argument('files', nargs='*', help="Specific SQL files to check")
    args = parser.parse_args()
    
    if args.latest:
        filepaths = get_latest_batch()
        if not filepaths:
            print("No recipe SQL files found.")
            sys.exit(1)
        print(f"Latest batch: {os.path.basename(os.path.dirname(filepaths[0]))}/")
        print(f"Files: {len(filepaths)}")
    elif args.files:
        filepaths = []
        for pattern in args.files:
            filepaths.extend(glob.glob(pattern))
        filepaths = sorted(set(filepaths))
    else:
        print(__doc__)
        sys.exit(1)
    
    # Load existing recipes
    existing = load_existing_recipes(force_refresh=args.refresh)
    print(f"Comparing against {len(existing)} existing recipes in DB\n")
    
    # Run dedup
    results = dedup_files(filepaths, existing, dry_run=args.dry_run)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"  Files checked:  {results['total']}")
    print(f"  ✅ Keep:        {len(results['keep'])}")
    print(f"  ❌ Discard:     {len(results['discard'])}")
    
    if results['discard']:
        print(f"\nDiscarded:")
        for item in results['discard']:
            print(f"  - {item['file']}: {item['reason']}")
    
    if results['keep']:
        print(f"\nValid recipes (ready to import):")
        for item in results['keep']:
            print(f"  ✅ {item['file']}: {item['recipe']} (score: {item['score']:.3f})")
    
    # Save results to JSON
    output_path = GENERATED_DIR / f"dedup-results-{Path(filepaths[0]).stem.rsplit('-', 1)[0]}.json"
    with open(output_path, 'w') as f:
        # Convert sets to lists for JSON serialization
        json_results = {k: v for k, v in results.items()}
        json.dump(json_results, f, indent=2, default=str)
    print(f"\nResults saved to: {output_path}")
    
    # If not dry-run, delete discarded files
    if not args.dry_run and results['discard']:
        print(f"\nRemoving {len(results['discard'])} duplicate files...")
        for item in results['discard']:
            filepath = item.get('filepath')
            if filepath and os.path.exists(filepath):
                os.remove(filepath)
                print(f"  Deleted: {item['file']}")
    
    sys.exit(0 if len(results['discard']) == 0 else 0)


if __name__ == "__main__":
    main()
