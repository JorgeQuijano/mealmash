-- Check if a user has favorited a specific recipe (RPC, bypasses PostgREST query issues)
CREATE OR REPLACE FUNCTION check_favorite(p_user_id UUID, p_recipe_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO found_count
  FROM user_favorites
  WHERE user_id = p_user_id AND recipe_id = p_recipe_id;
  RETURN found_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION check_favorite TO anon, authenticated;
