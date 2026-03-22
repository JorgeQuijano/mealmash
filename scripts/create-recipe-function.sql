-- create_recipe RPC function (updated with auto-slug generation)
-- Run this in Supabase SQL Editor after running version-recipes.sql
-- SECURITY DEFINER bypasses RLS; GRANT EXECUTE to anon for REST API access.

CREATE OR REPLACE FUNCTION create_recipe(
  p_name              TEXT,
  p_description       TEXT,
  p_category          TEXT,
  p_cuisine          TEXT[],
  p_dietary_tags     TEXT[],
  p_difficulty       TEXT,
  p_prep_time        INTEGER,
  p_cook_time        INTEGER,
  p_servings         INTEGER,
  p_image_url        TEXT,
  p_instructions     TEXT[],
  p_ing_ids          UUID[],
  p_ing_qtys         TEXT[],
  p_ing_qnums        NUMERIC[],
  p_ing_units        TEXT[],
  p_version_group_id UUID DEFAULT NULL  -- NULL = new version group (new UUID); pass existing UUID to group with similar recipe
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_recipe_id    UUID;
  vg_id            UUID;
  next_version     INTEGER;
  i                INTEGER;
  slug_base        TEXT;
  slug_candidate   TEXT;
  slug_suffix      INTEGER := 0;
BEGIN
  -- Validate inputs
  IF char_length(p_name) > 200 THEN
    RAISE EXCEPTION 'Recipe name too long (max 200 chars)';
  END IF;
  IF char_length(p_description) > 1500 THEN
    RAISE EXCEPTION 'Description too long (max 1500 chars)';
  END IF;
  IF array_length(p_instructions, 1) > 20 THEN
    RAISE EXCEPTION 'Too many instructions (max 20)';
  END IF;
  IF p_servings < 1 OR p_servings > 50 THEN
    RAISE EXCEPTION 'Servings must be between 1 and 50';
  END IF;
  IF p_prep_time < 0 OR p_prep_time > 1440 THEN
    RAISE EXCEPTION 'Prep time must be between 0 and 1440 minutes';
  END IF;
  IF p_cook_time < 0 OR p_cook_time > 2880 THEN
    RAISE EXCEPTION 'Cook time must be between 0 and 2880 minutes';
  END IF;
  IF p_category NOT IN ('breakfast','lunch','dinner','snack','dessert') THEN
    RAISE EXCEPTION 'Invalid category (%)', p_category;
  END IF;
  IF p_difficulty NOT IN ('Easy','Medium','Hard') THEN
    RAISE EXCEPTION 'Invalid difficulty (%)', p_difficulty;
  END IF;
  IF array_length(p_ing_ids, 1) != array_length(p_ing_qtys, 1)
  OR array_length(p_ing_ids, 1) != array_length(p_ing_qnums, 1)
  OR array_length(p_ing_ids, 1) != array_length(p_ing_units, 1) THEN
    RAISE EXCEPTION 'All ingredient arrays must be the same length';
  END IF;

  -- Resolve version group
  IF p_version_group_id IS NULL THEN
    -- New version group: generate UUID, version_number = 1
    vg_id := gen_random_uuid();
    next_version := 1;
  ELSE
    -- Existing version group: reuse UUID, increment version_number
    vg_id := p_version_group_id;
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM recipes WHERE version_group_id = vg_id;
  END IF;

  -- Generate slug: lowercase, hyphenated, unique
  slug_base := lower(regexp_replace(regexp_replace(p_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  slug_base := trim(both '-' from regexp_replace(slug_base, '-+', '-', 'g'));
  slug_candidate := slug_base;

  -- Ensure uniqueness: append -1, -2, etc. if slug already exists
  WHILE EXISTS (SELECT 1 FROM recipes WHERE slug = slug_candidate) LOOP
    slug_suffix := slug_suffix + 1;
    slug_candidate := slug_base || '-' || slug_suffix;
  END LOOP;

  -- Insert recipe
  INSERT INTO recipes (
    name, description, category, cuisine, dietary_tags, difficulty,
    prep_time_minutes, cook_time_minutes, servings, image_url,
    ingredients, instructions, version_group_id, version_number, slug
  ) VALUES (
    p_name,
    p_description,
    p_category,
    p_cuisine,
    p_dietary_tags,
    p_difficulty,
    p_prep_time,
    p_cook_time,
    p_servings,
    COALESCE(p_image_url, ''),
    '[]'::jsonb,
    p_instructions,
    vg_id,
    next_version,
    slug_candidate
  )
  RETURNING id INTO new_recipe_id;

  -- Insert recipe_ingredients row by row
  FOR i IN 1 .. array_length(p_ing_ids, 1) LOOP
    INSERT INTO recipe_ingredients (
      recipe_id, ingredient_id, quantity, quantity_num, unit
    ) VALUES (
      new_recipe_id,
      p_ing_ids[i],
      p_ing_qtys[i],
      p_ing_qnums[i],
      p_ing_units[i]
    );
  END LOOP;

  RETURN new_recipe_id;
END;
$$;

-- Allow anonymous and authenticated calls from the REST API
GRANT EXECUTE ON FUNCTION create_recipe TO anon, authenticated;
