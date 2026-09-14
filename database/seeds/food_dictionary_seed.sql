-- Seed database with common food ingredients nutritional data
INSERT INTO public.food_dictionary (label, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, default_shelf_life_days)
VALUES
    ('apple', 'fruit', 52.0, 0.3, 13.8, 0.2, 14),
    ('banana', 'fruit', 89.0, 1.1, 22.8, 0.3, 5),
    ('orange', 'fruit', 47.0, 0.9, 11.8, 0.1, 10),
    ('bread', 'bakery', 265.0, 9.0, 49.0, 3.2, 7),
    ('egg', 'dairy/protein', 145.0, 12.5, 0.8, 9.5, 21),
    ('avocado', 'produce', 160.0, 2.0, 8.5, 14.7, 4),
    ('chicken breast', 'poultry', 165.0, 31.0, 0.0, 3.6, 3),
    ('rice', 'grain', 130.0, 2.7, 28.0, 0.3, 4),
    ('salad greens', 'vegetable', 33.0, 1.5, 6.0, 0.4, 3),
    ('tomato', 'vegetable', 18.0, 0.9, 3.9, 0.2, 7)
ON CONFLICT (label) DO UPDATE SET
    calories_per_100g = EXCLUDED.calories_per_100g,
    protein_per_100g = EXCLUDED.protein_per_100g,
    carbs_per_100g = EXCLUDED.carbs_per_100g,
    fat_per_100g = EXCLUDED.fat_per_100g;
