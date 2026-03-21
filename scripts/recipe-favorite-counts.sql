-- View: total favorites per recipe (no user data exposed)
CREATE OR REPLACE VIEW recipe_favorite_counts AS
SELECT recipe_id, COUNT(*) AS likes_count
FROM user_favorites
GROUP BY recipe_id;

-- Public read access
GRANT SELECT ON recipe_favorite_counts TO anon, authenticated;
