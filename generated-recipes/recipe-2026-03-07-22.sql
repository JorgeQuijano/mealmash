-- Recipe: Miso Glazed Salmon with Quick Pickled Vegetables
INSERT INTO recipes (
  id, name, description, instructions, category, cuisine, dietary_tags, difficulty,
  prep_time_minutes, cook_time_minutes, servings, image_url, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Miso Glazed Salmon with Quick Pickled Vegetables',
  'Tender salmon fillets coated in a sweet and savory white miso glaze, served with crisp pickled vegetables for balance',
  ARRAY['Mix miso, mirin, sake, and sugar for glaze', 'Pat salmon dry and coat with miso glaze', 'Quick pickle cucumber and radish in rice vinegar', 'Sear salmon skin-side down until crispy', 'Flip and cook 2-3 more minutes', 'Serve with pickled vegetables and steamed rice'],
  ARRAY['dinner'],
  ARRAY['Japanese', 'Asian'],
  ARRAY['Dairy-Free'],
  'Medium',
  20,
  15,
  2,
  '',
  NOW(),
  NOW()
) RETURNING id;
