#!/usr/bin/env python3
"""
Generate AI images for recipes via MiniMax image-01 model and upload to Supabase Storage.

Pipeline:
  1. Query Supabase for recipes missing images (image_url IS NULL or empty)
  2. For each recipe (synchronous, one at a time):
     a. Generate 1024x1024 image via MiniMax API
     b. Download JPEG from OSS URL
     c. Upload to Supabase Storage (recipe-images bucket)
     d. Update recipe row with storage path
  3. Log results to scripts/image-gen-log.json

Usage:
    python3 scripts/generate-recipe-images.py --all-missing   # backfill: all recipes
    python3 scripts/generate-recipe-images.py --latest-batch  # daily cron: today's batch only
    python3 scripts/generate-recipe-images.py --dry-run       # show what would run
"""

import re
import os
import sys
import json
import time
import glob
import argparse
import datetime
import subprocess
import uuid
import urllib.request
import urllib.error
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL    = "https://owmwdsypvvaxsckflbxx.supabase.co"
SUPABASE_ANON   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU"
SUPABASE_SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxNDU4NSwiZXhwIjoyMDg3NzkwNTg1fQ.CGZO6--Txwm2Ms4cjHSXbVMvZtPuXgY5dIMVpvGty_8"
MINIMAX_API_KEY  = "sk-cp-SpmB0OMUa5bffanZnC15KPmYNvJF1ezAvpfzUHIw6u8I9mLMad_JWSOP4Fo_k-EYHXEM5P0fiBfNO2Q30Z24iM5PsRP-qkmcKfn9ebEicPiyIWOaSz34jhs"
MINIMAX_API_URL  = "https://api.minimax.io/v1/image_generation"
STORAGE_BUCKET   = "recipe-images"
IMAGE_TIMEOUT    = 30  # seconds per image

SCRIPT_DIR   = Path(__file__).parent
LOG_FILE     = SCRIPT_DIR / "image-gen-log.json"
TEMP_DIR     = Path("/tmp/recipe-images")
TEMP_DIR.mkdir(exist_ok=True)

# ── Helpers ──────────────────────────────────────────────────────────────────

def curl_get(url: str) -> list | dict | None:
    r = subprocess.run([
        'curl', '-s', '-X', 'GET', url,
        '-H', f'apikey: {SUPABASE_ANON}',
        '-H', f'Authorization: Bearer {SUPABASE_ANON}'
    ], capture_output=True, text=True)
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        return None


def curl_patch(url: str, data: dict) -> bool:
    r = subprocess.run([
        'curl', '-s', '-X', 'PATCH', url,
        '-H', f'apikey: {SUPABASE_SERVICE}',
        '-H', f'Authorization: Bearer {SUPABASE_SERVICE}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(data)
    ], capture_output=True, text=True)
    return r.returncode == 0


def upload_to_storage(local_path: Path, dest_name: str) -> str | None:
    """Upload a file to Supabase Storage. Returns the storage path on success."""
    r = subprocess.run([
        'curl', '-s', '-X', 'POST',
        f'{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{dest_name}',
        '-H', f'Authorization: Bearer {SUPABASE_SERVICE}',
        '-H', f'apikey: {SUPABASE_SERVICE}',
        '-H', 'Content-Type: image/jpeg',
        '--data-binary', f'@{local_path}',
    ], capture_output=True, text=True)
    try:
        resp = json.loads(r.stdout)
        if resp.get('Key') or (isinstance(resp, dict) and 'error' not in resp and 'message' not in str(resp)):
            return dest_name
        return None
    except json.JSONDecodeError:
        return None


def generate_image(prompt: str, timeout: int = IMAGE_TIMEOUT) -> Path | None:
    """Call MiniMax image-01 API. Returns local Path to downloaded JPEG, or None."""
    payload = {
        "model": "image-01",
        "prompt": prompt,
    }
    req = urllib.request.Request(
        MINIMAX_API_URL,
        data=json.dumps(payload).encode(),
        headers={
            'Authorization': f'Bearer {MINIMAX_API_KEY}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            result = json.loads(resp.read())
    except Exception as e:
        print(f"    ⚠️  MiniMax API error: {e}")
        return None

    base_resp = result.get('base_resp', {})
    if base_resp.get('status_code') != 0:
        print(f"    ⚠️  MiniMax error: {base_resp.get('status_msg')}")
        return None

    image_urls = result.get('data', {}).get('image_urls') or []
    if not image_urls:
        return None

    oss_url = image_urls[0]
    filename = f"{uuid.uuid4().hex}.jpg"
    dest = TEMP_DIR / filename

    try:
        urllib.request.urlretrieve(oss_url, dest)
    except Exception as e:
        print(f"    ⚠️  Download failed: {e}")
        return None

    return dest


def build_prompt(recipe_name: str, description: str = "") -> str:
    """Build a MiniMax image prompt for a recipe."""
    desc_kw = ""
    if description:
        # Pull first 60 chars of description, strip punctuation
        desc_kw = ", " + re.sub(r'[^\w\s]', '', description)[:60].strip()
    return (
        f"1:1 studio image of {recipe_name}{desc_kw}, "
        f"professional food photography, top-down shot, "
        f"bright natural lighting, rustic wooden table background"
    )


# ── Recipe fetching ────────────────────────────────────────────────────────────

def get_recipes_missing_images(batch_prefix: str | None = None) -> list[dict]:
    """
    Fetch recipes from Supabase that need images.
    batch_prefix: if set, only today's batch (prefix like "2026-03-21-04-00")
    """
    recipes = []
    offset = 0
    page_size = 100

    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/recipes"
            f"?or=(image_url.is.null,image_url.eq.)"
            f"&select=id,name,description,created_at"
            f"&order=created_at.desc"
            f"&limit={page_size}&offset={offset}"
        )
        page = curl_get(url)
        if not page:
            break
        if isinstance(page, dict) and 'error' in page:
            print(f"  ❌ Supabase error: {page['error']}")
            break
        recipes.extend(page)
        if len(page) < page_size:
            break
        offset += page_size

    # If batch_prefix, filter to today's hour-bucket
    if batch_prefix:
        recipes = [r for r in recipes if r.get('created_at', '').startswith(batch_prefix)]

    return recipes


def get_latest_batch_prefix() -> str | None:
    """
    Get the recipe batch prefix from today's 4 AM EST cron run.
    Cron fires at ~3-4 AM EST daily, which is ~8-9 AM UTC.
    We match the hour bucket (HH) from today's UTC date.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    # Cron runs at ~3-4 AM EST = ~8-9 AM UTC — match the hour bucket
    # Try both potential hours: 08 and 09 UTC
    return now.strftime("%Y-%m-%d")  # wildcard: match any batch from today


def update_recipe_image_url(recipe_id: str, storage_path: str) -> bool:
    """Update a recipe's image_url in Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/recipes?id=eq.{recipe_id}"
    return curl_patch(url, {"image_url": storage_path})


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate recipe images via MiniMax")
    parser.add_argument('--all-missing', action='store_true',
                        help="Process ALL recipes missing images (backfill)")
    parser.add_argument('--latest-batch', action='store_true',
                        help="Process only the latest batch (today's cron run)")
    parser.add_argument('--dry-run', action='store_true',
                        help="Show recipes that need images without generating")
    parser.add_argument('--limit', type=int, default=0,
                        help="Limit number of recipes to process (0 = unlimited)")
    args = parser.parse_args()

    if args.latest_batch:
        batch_prefix = get_latest_batch_prefix()
        print(f"📦 Latest batch prefix: {batch_prefix}")
        recipes = get_recipes_missing_images(batch_prefix)
    elif args.all_missing:
        print("🔄 Backfill mode: all recipes missing images")
        recipes = get_recipes_missing_images()
    else:
        print(__doc__)
        sys.exit(1)

    if not recipes:
        print("✅ No recipes need images.")
        sys.exit(0)

    if args.limit > 0:
        recipes = recipes[:args.limit]

    print(f"📋 {len(recipes)} recipe(s) need images\n")

    if args.dry_run:
        for r in recipes:
            print(f"  → {r['name']}  [{r['id']}]")
        sys.exit(0)

    results = {
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'total': len(recipes),
        'succeeded': [],
        'failed': [],
        'skipped': [],
    }

    for i, recipe in enumerate(recipes, 1):
        rid   = recipe['id']
        name  = recipe['name']
        desc  = recipe.get('description', '')

        print(f"\n[{i}/{len(recipes)}] {name}")
        print(f"  ID: {rid}")

        # Generate prompt
        prompt = build_prompt(name, desc)
        print(f"  🎨 Prompt: {prompt[:80]}...")

        # Generate image
        img_path = generate_image(prompt)
        if not img_path:
            print(f"  ❌ Image generation failed")
            results['failed'].append({'id': rid, 'name': name, 'error': 'generation_failed'})
            continue

        print(f"  📥 Downloaded: {img_path.stat().st_size / 1024:.0f} KB")

        # Upload to Supabase Storage
        storage_name = f"{rid}.jpg"
        storage_path = upload_to_storage(img_path, storage_name)
        if not storage_path:
            print(f"  ❌ Storage upload failed")
            results['failed'].append({'id': rid, 'name': name, 'error': 'upload_failed'})
            continue

        # Update recipe row
        updated = update_recipe_image_url(rid, storage_path)
        if not updated:
            print(f"  ❌ DB update failed")
            results['failed'].append({'id': rid, 'name': name, 'error': 'db_update_failed'})
            continue

        print(f"  ✅ Done — image: {storage_path}")
        results['succeeded'].append({'id': rid, 'name': name, 'storage_path': storage_path})

        # Clean up temp file
        img_path.unlink(missing_ok=True)

        # Rate limit: 1 request per second (MiniMax not rate-limited but polite)
        if i < len(recipes):
            time.sleep(1)

    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY  total={results['total']}  ok={len(results['succeeded'])}  fail={len(results['failed'])}")

    for s in results['succeeded']:
        print(f"  ✅ {s['name']}")

    for f in results['failed']:
        print(f"  ❌ {f['name']}: {f['error']}")

    # Save log
    existing = []
    if LOG_FILE.exists():
        try:
            existing = json.load(open(LOG_FILE))
        except Exception:
            pass
    existing.append(results)
    with open(LOG_FILE, 'w') as fh:
        json.dump(existing, fh, indent=2)
    print(f"\n📝 Log: {LOG_FILE}")

    sys.exit(0 if not results['failed'] else 1)


if __name__ == "__main__":
    main()
