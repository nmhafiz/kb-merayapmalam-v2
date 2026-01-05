-- Migration: Add Community Features (Potluck & Routes)
-- Created at: 2026-01-05 16:40:00

-- 1. Potluck Items (Wishlist/Template)
CREATE TABLE IF NOT EXISTS public.kb_potluck_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Food', 'Drink', 'Other'
    quantity_required INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Potluck Claims
CREATE TABLE IF NOT EXISTS public.kb_potluck_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.kb_potluck_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity_promised INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_id, user_id) -- One claim per item per user
);

-- 3. Running Routes
CREATE TABLE IF NOT EXISTS public.kb_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    distance_km FLOAT NOT NULL,
    difficulty TEXT NOT NULL, -- 'Easy', 'Moderate', 'Hard'
    description TEXT,
    map_url TEXT, -- e.g., Strava, Google Maps, MapBox
    start_point TEXT,
    preview_url TEXT,
    is_vetted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.kb_potluck_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_potluck_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_routes ENABLE ROW LEVEL SECURITY;

-- Policies for kb_potluck_items
CREATE POLICY "Public can view potluck items" ON public.kb_potluck_items
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage potluck items" ON public.kb_potluck_items
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Policies for kb_potluck_claims
CREATE POLICY "Public can view claims" ON public.kb_potluck_claims
    FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can join potluck" ON public.kb_potluck_claims
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own claims" ON public.kb_potluck_claims
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- Policies for kb_routes
CREATE POLICY "Public can view routes" ON public.kb_routes
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage routes" ON public.kb_routes
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));
