#!/usr/bin/env python3
"""
Standardized post-run report for MealClaw pipeline.

Queries the latest batch of recipes from Supabase and prints a
formatted report to stdout. The calling agent sends the output to Telegram.

Usage:
    python3 scripts/report-run.py                          # today's batch
    python3 scripts/report-run.py --batch "2026-03-21"   # specific date
    python3 scripts/report-run.py --latest-only            # from import-log.json
"""

import re
import sys
import json
import argparse
import urllib.request
from datetime import datetime, timezone

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://owmwdsypvvaxsckflbxx.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bXdkc3lwdnZheHNja2ZsYnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQ1ODUsImV4cCI6MjA4Nzc5MDU4NX0.7u9LN7jrFDDsytduRLt0kUkzeoaZZkHefbN065o-auU"
BASE_URL = "https://mealclaw.com"
SUPABASE_DASHBOARD = (
    "https://supabase.com/dashboard/project/owmwdsypvvaxsckflbxx"
    "/table-editor?schema=public&table=recipes"
)

# ── Helpers ────────────────────────────────────────────────────────────────────

def supabase_get(query: str) -> list:
    url = f"{SUPABASE_URL}/rest/v1/{query}"
    req = urllib.request.Request(url)
    req.add_header("apikey", ANON_KEY)
    req.add_header("Authorization", f"Bearer {ANON_KEY}")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"⚠️  Supabase error: {e}", file=sys.stderr)
        return []


def slugify(name: str) -> str:
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', name)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-').lower()
    return s


def recipe_url(r: dict) -> str:
    slug = r.get("slug") or slugify(r["name"])
    return f"{BASE_URL}/recipe/{slug}"


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MealClaw post-run report")
    parser.add_argument("--batch", default=None,
                        help="Date prefix to filter recipes (e.g. 2026-03-21)")
    parser.add_argument("--latest-only", action="store_true",
                        help="Only report recipes since last import (uses import-log.json)")
    args = parser.parse_args()

    # Determine date filter
    date_prefix = None

    if args.latest_only:
        log_path = "/home/jquijanoq/.openclaw/workspace/mealmash/scripts/import-log.json"
        try:
            with open(log_path) as f:
                logs = json.load(f)
            if logs:
                last_ts = logs[-1].get("timestamp", "")
                date_prefix = last_ts[:10] if last_ts else None
        except Exception:
            date_prefix = None

    if not date_prefix:
        date_prefix = args.batch or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Build query with date filter
    date_filter = f"created_at=gte.{date_prefix}T00:00:00Z"
    query = (
        "recipes?select=id,name,slug,image_url,version_group_id,"
        f"version_number,created_at&{date_filter}&order=created_at.desc&limit=50"
    )

    recipes = supabase_get(query)

    if not recipes:
        print(f"✅  No recipes found for {date_prefix}.")
        return

    # Detect version groups
    vg_map: dict = {}
    for r in recipes:
        vg = r.get("version_group_id")
        if vg:
            vg_map.setdefault(vg, []).append(r)

    versioned = {vg: rs for vg, rs in vg_map.items() if len(rs) > 1}
    total_count = len(recipes)

    # Image failures
    missing_images = [r for r in recipes if not r.get("image_url")]
    image_ok = total_count - len(missing_images)

    # Build the report
    today = datetime.now(timezone.utc).strftime("%B %d, %Y")
    lines = []

    lines.append(f"📋  **MealClaw Daily Run — {today}**")
    lines.append("")
    lines.append(f"✅  **{total_count} recipes imported**")
    lines.append("")

    if versioned:
        lines.append("🔄  **Version groups detected:**")
        for vg, rs in versioned.items():
            versions = ", ".join([f"v{r.get('version_number', 1)}" for r in sorted(rs, key=lambda x: x.get("version_number", 1))])
            latest = rs[0]
            lines.append(f"   • {latest['name']} — {versions}")
            lines.append(f"     {recipe_url(latest)}")
        lines.append("")

    lines.append("🍽️  **New recipes:**")
    for r in recipes:
        lines.append(f"   • {r['name']}")
        lines.append(f"     {recipe_url(r)}")

    lines.append("")
    img_note = f"{image_ok}/{total_count} images generated"
    if missing_images:
        img_note += f"  ⚠️  {len(missing_images)} missing"
    lines.append(f"🖼️  **Images:** {img_note}")

    if missing_images:
        for r in missing_images:
            lines.append(f"   • {r['name']}  [{r['id']}]")

    lines.append("")
    lines.append(f"🔗  **Supabase:** {SUPABASE_DASHBOARD}")

    print("\n".join(lines))


if __name__ == "__main__":
    main()
