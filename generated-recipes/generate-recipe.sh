#!/bin/bash
# Recipe Generator - Hourly cron job

TIMESTAMP=$(date +%Y-%m-%d-%H)
RECIPE_FILE="/home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/recipe-$TIMESTAMP.sql"
PROMPT_FILE="/home/jquijanoq/.openclaw/workspace/mealmash/generated-recipes/recipe-generator-prompt.md"

# Read the prompt instructions
INSTRUCTIONS=$(cat "$PROMPT_FILE")

# Generate the recipe SQL using the AI
# The model will create a unique recipe based on the instructions
SQL_OUTPUT=$(cat << 'EOF'
Generate a unique recipe in SQL format following these instructions:

1. Pick a random cuisine (Italian, Mexican, Asian, Indian, Mediterranean, American, French, Japanese, Thai, Greek, Korean, etc.)
2. Pick a random category (breakfast, lunch, dinner, snack, dessert)
3. Pick a random difficulty (Easy, Medium, Hard)
4. Create 6-12 ingredients with proper quantities
5. Write 4-8 clear cooking instructions

Output ONLY the raw SQL statements, nothing else. Include:
- INSERT for recipes table (with gen_random_uuid() and RETURNING id)
- INSERT for any new ingredients (use gen_random_uuid())
- INSERT for recipe_ingredients junction table

Make it delicious and practical!
EOF
)

# This would be replaced by actual AI call in production
# For now, create a template that shows what the output looks like

cat > "$RECIPE_FILE" << 'TEMPLATE'
-- ============================================
-- Auto-generated Recipe
-- Generated: TIMESTAMP_PLACEHOLDER
-- ============================================

-- Recipe INSERT
INSERT INTO recipes (
  name, description, instructions, category, cuisine, dietary_tags, difficulty,
  prep_time_minutes, cook_time_minutes, servings, image_url, created_at, updated_at
) VALUES (
  'AI Generated Recipe',
  'Description here',
  ARRAY['Step 1', 'Step 2'],
  ARRAY['dinner'],
  ARRAY['Italian'],
  ARRAY[]::text[],
  'Medium',
  15,
  30,
  4,
  '',
  NOW(),
  NOW()
) RETURNING id;
TEMPLATE

# Replace placeholder with actual timestamp
sed -i "s/TIMESTAMP_PLACEHOLDER/$(date)/" "$RECIPE_FILE"

echo "Recipe SQL saved to: $RECIPE_FILE"
