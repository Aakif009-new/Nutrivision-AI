-- Create food dictionary table for local nutrient caching
CREATE TABLE IF NOT EXISTS public.food_dictionary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'general',
    calories_per_100g NUMERIC(8, 2) NOT NULL,
    protein_per_100g NUMERIC(8, 2) NOT NULL,
    carbs_per_100g NUMERIC(8, 2) NOT NULL,
    fat_per_100g NUMERIC(8, 2) NOT NULL,
    default_shelf_life_days INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
