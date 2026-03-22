-- View: total favorites per recipe (no user data exposed)
CREATE OR REPLACE VIEW recipe_favorite_counts AS
SELECT recipe_id, COUNT(*) AS favorite_count
FROM user_favorites
GROUP BY recipe_id;

GRANT SELECT ON recipe_favorite_counts TO anon, authenticated;
