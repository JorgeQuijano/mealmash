-- Fix: Create trigger to automatically create user profile on signup
-- and backfill missing names from auth.users

-- First, backfill existing users with names from auth.users
INSERT INTO user_profiles (id, email, name)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'name' as name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL 
  AND au.raw_user_meta_data->>'name' IS NOT NULL
  AND au.raw_user_meta_data->>'name' != '';

-- Create a trigger function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
