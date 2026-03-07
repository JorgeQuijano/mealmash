-- Recipe: Mexican Street Corn Salad (Esquites)
INSERT INTO recipes (
  id, name, description, instructions, category, cuisine, dietary_tags, difficulty,
  prep_time_minutes, cook_time_minutes, servings, image_url, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Mexican Street Corn Salad (Esquites)',
  'A vibrant, creamy salad inspired by Mexican street corn - charred corn with tangy lime, cotija cheese, and a kick of chili',
  ARRAY['Shuck corn and remove kernels', 'Heat a large skillet or grill pan over high heat', 'Char corn kernels until blackened spots appear', 'Transfer to a bowl and let cool slightly', 'Add mayonnaise, sour cream, and lime juice', 'Stir in cotija cheese, chili powder, and cilantro', 'Season with salt and pepper', 'Serve warm or at room temperature with extra lime wedges'],
  ARRAY['lunch', 'dinner'],
  ARRAY['Mexican'],
  ARRAY['Vegetarian'],
  'Easy',
  15,
  10,
  4,
  '',
  NOW(),
  NOW()
) RETURNING id;
