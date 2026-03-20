-- delete_recipe RPC function
-- SECURITY DEFINER: bypasses RLS so anon key can delete
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/owmwdsypvvaxsckflbxx/sql

CREATE OR REPLACE FUNCTION delete_recipe(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM recipes WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_recipe TO anon, authenticated;
