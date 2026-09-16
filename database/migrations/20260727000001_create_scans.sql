-- Create scans history table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    total_calories NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    total_protein NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    total_carbs NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    total_fat NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scan items detail table
CREATE TABLE IF NOT EXISTS public.scan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    confidence_score NUMERIC(5, 4) NOT NULL,
    quantity_g NUMERIC(8, 2) NOT NULL,
    calories NUMERIC(8, 2) NOT NULL,
    protein NUMERIC(8, 2) NOT NULL,
    carbs NUMERIC(8, 2) NOT NULL,
    fat NUMERIC(8, 2) NOT NULL,
    freshness_status TEXT CHECK (freshness_status IN ('fresh', 'moderate', 'spoiled')),
    estimated_shelf_life_days INT DEFAULT 3,
    bounding_box JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scans"
    ON public.scans FOR ALL
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can view scan items"
    ON public.scan_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.scans
        WHERE scans.id = scan_items.scan_id AND scans.profile_id = auth.uid()
    ));
