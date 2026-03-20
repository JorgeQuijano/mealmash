#!/usr/bin/env python3
"""
Import validated recipe SQL files into Supabase via RPC stored procedure.

Pipeline:
  1. Parse each .sql file → extract structured recipe data + ingredient names
  2. Resolve ingredient names → UUIDs via Supabase REST API
  3. Call create_recipe RPC (SECURITY DEFINER) in a single call
  4. Log results to scripts/import-log.json

Usage:
    python3 import-recipes.py --latest
    python3 import-recipes.py --dry-run recipe-2026-03-20-18-04-2.sql
    python3 import-recipes.py --valid-only --latest
"""

import re
import sys
import os
import json
import glob
import datetime
import argparse
import subprocess
from pathlib import Path

SUPABASE_URL = "https://owmwdsypvvaxsckflbxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU"

GENERATED_DIR = Path(__file__).parent.parent / "generated-recipes"
IMPORT_LOG = Path(__file__).parent / "import-log.json"


# ─────────────────────────────────────────────────────────────────
# Supabase REST helpers
# ─────────────────────────────────────────────────────────────────

def curl_get(table: str, params: str = "") -> list:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if params:
        url += "?" + params
    r = subprocess.run([
        'curl', '-s', '-X', 'GET', url,
        '-H', f'apikey: {SUPABASE_KEY}',
        '-H', f'Authorization: Bearer {SUPABASE_KEY}'
    ], capture_output=True, text=True)
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        return []


def curl_rpc(fn_name: str, params: dict) -> tuple[dict, int]:
    """
    Call a Supabase RPC function.
    Returns (response_dict, http_status).
    """
    r = subprocess.run([
        'curl', '-s', '-X', 'POST',
        f'{SUPABASE_URL}/rest/v1/rpc/{fn_name}',
        '-H', f'apikey: {SUPABASE_KEY}',
        '-H', f'Authorization: Bearer {SUPABASE_KEY}',
        '-H', 'Content-Type: application/json',
        '-H', 'Prefer: ' 'return=representation',
        '-d', json.dumps(params)
    ], capture_output=True, text=True)
    try:
        return json.loads(r.stdout), r.returncode
    except json.JSONDecodeError:
        return {"error": r.stdout}, r.returncode


# ─────────────────────────────────────────────────────────────────
# Fetch all ingredient IDs (cached)
# ─────────────────────────────────────────────────────────────────

_ing_cache = None

def get_ing_cache() -> dict:
    """Returns {name_lower: (uuid, canonical_name)}. Cached after first call."""
    global _ing_cache
    if _ing_cache is not None:
        return _ing_cache

    all_ings = []
    for offset in [0, 1000, 2000]:
        page = curl_get(f"ingredients?select=id,name&limit=1000&offset={offset}")
        if not page:
            break
        all_ings.extend(page)
        if len(page) < 1000:
            break

    _ing_cache = {}
    for ing in all_ings:
        key = ing['name'].lower().strip()
        _ing_cache[key] = (ing['id'], ing['name'])

    return _ing_cache


# ─────────────────────────────────────────────────────────────────
# Parse recipe SQL file
# ─────────────────────────────────────────────────────────────────

def parse_recipe_sql(filepath: str) -> dict:
    """
    Parse a recipe SQL file into a structured dict.
    Extracts all fields via careful regex (not comma-splitting).
    """
    with open(filepath) as f:
        content = f.read()

    # ── Recipe name ────────────────────────────────────────────────
    name_m = re.search(r"VALUES\s*\(\s*N?'([^']+)'", content)
    name = name_m.group(1) if name_m else Path(filepath).stem

    # ── VALUES block ───────────────────────────────────────────────
    vb_m = re.search(r"VALUES\s*\((.*?)\s+\)\s+RETURNING", content, re.DOTALL)
    if not vb_m:
        raise ValueError(f"Cannot find VALUES block in {filepath}")
    vb = vb_m.group(1)

    # ── Extract all quoted strings (handles '' escapes) ─────────────
    strings = []
    i = 0
    while i < len(vb):
        if vb[i] == "'":
            j = i + 1
            s = ""
            while j < len(vb):
                if vb[j] == "'" and j + 1 < len(vb) and vb[j+1] == "'":
                    s += "'"
                    j += 2
                elif vb[j] == "'":
                    break
                else:
                    s += vb[j]
                    j += 1
            strings.append(s)
            i = j + 1
        else:
            i += 1

    description = strings[1] if len(strings) > 1 else ""

    # ── Instructions ARRAY ──────────────────────────────────────────
    inst_m = re.search(r"ARRAY\[[^\]]*\]", content)
    instructions = []
    if inst_m:
        raw = inst_m.group(0)[6:-1]  # strip ARRAY[ and ]
        steps = re.findall(r"'([^']*(?:''[^']*)*)'", raw)
        instructions = [s.replace("''", "'") for s in steps]

    # ── Category ─────────────────────────────────────────────────
    cat_m = re.search(r"'(breakfast|lunch|dinner|snack|dessert)'", content, re.IGNORECASE)
    category = cat_m.group(1).lower() if cat_m else "dinner"

    # ── Cuisine ARRAY ──────────────────────────────────────────────
    cuisine_m = re.search(r"ARRAY\['([^']+)'\]", content)
    cuisine = [cuisine_m.group(1)] if cuisine_m else []

    # ── Dietary tags ARRAY ────────────────────────────────────────
    dietary = []
    dt_match = re.search(r"ARRAY\[\s*(.*?)\s*\]", content[inst_m.end():inst_m.end()+200] if inst_m else "")
    if dt_match:
        dietary = [g for g in re.findall(r"'([^']*)'", dt_match.group(1)) if g]

    # ── Difficulty ────────────────────────────────────────────────
    diff_m = re.search(r"'(Easy|Medium|Hard)'", content)
    difficulty = diff_m.group(1) if diff_m else "Medium"

    # ── Times and servings ────────────────────────────────────────
    def int_val(pat):
        m = re.search(pat, content)
        return int(m.group(1)) if m else 0

    prep = int_val(r"prep_time_minutes[,\s]*(\d+)")
    cook = int_val(r"cook_time_minutes[,\s]*(\d+)")
    servings = int_val(r"servings[,\s]*(\d+)")
    prep = prep or 15
    cook = cook or 30
    servings = servings or 4

    # ── Ingredient names from WHERE clause ─────────────────────────
    where_m = re.search(r"WHERE name ILIKE ANY \(ARRAY\[(.*?)\]\)", content, re.DOTALL)
    ing_names = []
    if where_m:
        ing_names = [n.strip() for n in re.findall(r"'([^']+)'", where_m.group(1))]

    # ── Parse recipe_ingredients CASE blocks ──────────────────────
    qty_map, qnum_map, unit_map = {}, {}, {}

    ins_m = re.search(
        r"INSERT INTO recipe_ingredients.*?SELECT(.*?)FROM ingredient_ids i\s+CROSS JOIN recipe_insert ri;",
        content, re.DOTALL
    )

    if ins_m:
        select = ins_m.group(1)
        cases = [c for c in re.split(r"(?=CASE\s+i\.name)", select) if 'WHEN' in c]

        # Quoted THEN values (quantity strings)
        if len(cases) >= 1:
            for m in re.finditer(r"WHEN\s+'([^']+)'\s+THEN\s+'([^']+)'", cases[0]):
                qty_map[m.group(1)] = m.group(2)

        # Unquoted THEN values (quantity_num integers/floats)
        if len(cases) >= 2:
            for m in re.finditer(r"WHEN\s+'([^']+)'\s+THEN\s+(\d+(?:\.\d+)?)", cases[1]):
                try:
                    val = float(m.group(2))
                    if '.' not in m.group(2):
                        val = int(val)
                    qnum_map[m.group(1)] = val
                except ValueError:
                    qnum_map[m.group(1)] = 1.0

        # Quoted THEN values (units)
        if len(cases) >= 3:
            for m in re.finditer(r"WHEN\s+'([^']+)'\s+THEN\s+'([^']+)'", cases[2]):
                unit_map[m.group(1)] = m.group(2)

    # ── Resolve ingredient names → UUIDs ────────────────────────────
    id_map = get_ing_cache()
    ingredients = []
    skipped = []

    for ing_name in ing_names:
        key = ing_name.lower().strip()
        if key in id_map:
            uid, db_name = id_map[key]
            ingredients.append({
                'name': db_name,
                'id': uid,
                'qty': qty_map.get(ing_name, '1'),
                'qnum': qnum_map.get(ing_name, 1.0),
                'unit': unit_map.get(ing_name, 'pieces'),
            })
        else:
            skipped.append(ing_name)

    return {
        'name': name,
        'description': description,
        'instructions': instructions,
        'category': category,
        'cuisine': cuisine,
        'dietary_tags': dietary,
        'difficulty': difficulty,
        'prep_time': prep,
        'cook_time': cook,
        'servings': servings,
        'image_url': '',
        'ingredients': ingredients,
        'skipped': skipped,
        'filepath': filepath,
    }


# ─────────────────────────────────────────────────────────────────
# Call RPC
# ─────────────────────────────────────────────────────────────────

def insert_recipe(recipe: dict) -> tuple[str, bool, str]:
    """
    Call create_recipe RPC with all recipe data.
    Returns (recipe_id, success, message).
    """
    # Build parallel arrays
    ing_ids   = [ing['id']       for ing in recipe['ingredients']]
    ing_qtys  = [ing['qty']      for ing in recipe['ingredients']]
    ing_qnums = [ing['qnum']     for ing in recipe['ingredients']]
    ing_units = [ing['unit']      for ing in recipe['ingredients']]

    params = {
        "p_name":         recipe['name'],
        "p_description":  recipe['description'],
        "p_category":     recipe['category'],
        "p_cuisine":      recipe['cuisine'],
        "p_dietary_tags": recipe['dietary_tags'],
        "p_difficulty":   recipe['difficulty'],
        "p_prep_time":    recipe['prep_time'],
        "p_cook_time":    recipe['cook_time'],
        "p_servings":     recipe['servings'],
        "p_image_url":    recipe['image_url'] or '',
        "p_instructions": recipe['instructions'],
        "p_ing_ids":      ing_ids,
        "p_ing_qtys":     ing_qtys,
        "p_ing_qnums":    ing_qnums,
        "p_ing_units":     ing_units,
    }

    resp, status = curl_rpc("create_recipe", params)

    # status 0 with UUID response means success (RPC returned the UUID)
    rid = ""
    if isinstance(resp, list) and resp:
        rid = str(resp[0])
    elif isinstance(resp, dict):
        # If it looks like an error object, treat as failure
        if resp.get('message') or resp.get('error'):
            return "", False, f"RPC error: {resp}"
        rid = str(resp.get(0, resp.get('id', '')))
    elif isinstance(resp, str) and len(resp) > 20:
        # UUID returned directly as string
        rid = resp

    if not rid:
        return "", False, f"No recipe ID returned: {resp} (status={status})"

    return rid, True, f"{len(recipe['ingredients'])} ingredients"


# ─────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────

def get_latest_batch():
    files = glob.glob(str(GENERATED_DIR / "recipe-*.sql"))
    batches = {}
    for f in files:
        m = re.match(r'recipe-(\d{4}-\d{2}-\d{2}-\d{2}-\d{2})(?:-\d+)?\.sql', os.path.basename(f))
        if m:
            batches.setdefault(m.group(1), []).append(f)
    if not batches:
        return []
    return sorted(batches[max(batches)])


# ─────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import validated recipes into Supabase via RPC")
    parser.add_argument('--latest',   action='store_true', help="Import most recent batch")
    parser.add_argument('--dry-run', action='store_true', help="Parse and show, don't insert")
    parser.add_argument('--valid-only', action='store_true', help="Skip files flagged invalid by audit/dedup")
    parser.add_argument('files', nargs='*', help=".sql files to import")
    args = parser.parse_args()

    if args.latest:
        filepaths = get_latest_batch()
        if not filepaths:
            print("No .sql files found."); sys.exit(1)
    elif args.files:
        filepaths = sorted(set(f for p in args.files for f in glob.glob(p)))
    else:
        print(__doc__); sys.exit(1)

    # Warm ingredient cache
    print("Loading ingredient map...")
    get_ing_cache()
    print(f"  {len(get_ing_cache())} ingredients cached\n")

    results = {
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'total': len(filepaths),
        'succeeded': [],
        'failed': [],
    }

    for fp in filepaths:
        fname = os.path.basename(fp)
        print(f"{'='*60}\n  {fname}")

        try:
            recipe = parse_recipe_sql(fp)
        except Exception as e:
            print(f"  ❌ Parse error: {e}")
            results['failed'].append({'file': fname, 'error': str(e)})
            continue

        print(f"  Recipe:    {recipe['name']}")
        print(f"  Category: {recipe['category']} | Cuisine: {recipe['cuisine']}")
        print(f"  Diff:     {recipe['difficulty']} | Prep: {recipe['prep_time']}min | Cook: {recipe['cook_time']}min")
        print(f"  Ings:     {len(recipe['ingredients'])} / {len(recipe['ingredients']) + len(recipe['skipped'])} resolved")

        if recipe['skipped']:
            print(f"  ⚠️  Not in DB: {recipe['skipped']}")
            if args.valid_only:
                print("  ⏭️  Skipping (has unknown ingredients)")
                continue

        if args.dry_run:
            print("  → DRY RUN")
            for ing in recipe['ingredients']:
                print(f"     {ing['name']}: {ing['qty']} ({ing['qnum']} {ing['unit']})")
            results['succeeded'].append({'file': fname, 'dry_run': True})
            continue

        rid, ok, msg = insert_recipe(recipe)
        if ok:
            print(f"  ✅ INSERTED  ID: {rid} — {msg}")
            results['succeeded'].append({
                'file': fname, 'recipe_id': rid,
                'recipe_name': recipe['name']
            })
        else:
            print(f"  ❌ FAILED: {msg}")
            results['failed'].append({'file': fname, 'error': msg})

    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY  total={results['total']}  ok={len(results['succeeded'])}  fail={len(results['failed'])}")

    if results['succeeded']:
        print("Imported:")
        for s in results['succeeded']:
            print(f"  ✅ {s.get('recipe_name', s['file'])}  ID={s.get('recipe_id','?')}")

    if results['failed']:
        print("Failed:")
        for f in results['failed']:
            print(f"  ❌ {f['file']}: {f['error']}")

    if not args.dry_run:
        existing = json.load(open(IMPORT_LOG)) if IMPORT_LOG.exists() else []
        existing.append(results)
        with open(IMPORT_LOG, 'w') as f:
            json.dump(existing, f, indent=2)
        print(f"\nLog: {IMPORT_LOG}")

    sys.exit(0 if not results['failed'] else 1)


if __name__ == "__main__":
    main()
