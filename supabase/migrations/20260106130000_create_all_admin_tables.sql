-- ============================================
-- MIGRATION: Create All Missing Admin Tables
-- ============================================

-- 1. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.kb_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kb_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view announcements" ON public.kb_announcements FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage announcements" ON public.kb_announcements FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. POLLS TABLE
CREATE TABLE IF NOT EXISTS public.kb_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.kb_poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.kb_polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.kb_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.kb_polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.kb_poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

ALTER TABLE public.kb_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view polls" ON public.kb_polls FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage polls" ON public.kb_polls FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public can view poll options" ON public.kb_poll_options FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage poll options" ON public.kb_poll_options FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view votes" ON public.kb_poll_votes FOR SELECT TO public USING (true);
CREATE POLICY "Users can vote" ON public.kb_poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.kb_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    distance_km NUMERIC(5,2),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    map_url TEXT,
    strava_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.kb_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view routes" ON public.kb_routes FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage routes" ON public.kb_routes FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. SPONSORS TABLE
CREATE TABLE IF NOT EXISTS public.kb_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kb_event_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    sponsor_id UUID NOT NULL REFERENCES public.kb_sponsors(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'bronze',
    UNIQUE(event_id, sponsor_id)
);

ALTER TABLE public.kb_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_event_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sponsors" ON public.kb_sponsors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage sponsors" ON public.kb_sponsors FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public can view event sponsors" ON public.kb_event_sponsors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage event sponsors" ON public.kb_event_sponsors FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. CHECKINS TABLE
CREATE TABLE IF NOT EXISTS public.kb_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE public.kb_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view checkins" ON public.kb_checkins FOR SELECT TO public USING (true);
CREATE POLICY "Users can checkin" ON public.kb_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage checkins" ON public.kb_checkins FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. POTLUCK ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.kb_potluck_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other' CHECK (category IN ('food', 'drink', 'other')),
    quantity_needed INTEGER DEFAULT 1,
    quantity_claimed INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kb_potluck_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.kb_potluck_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

ALTER TABLE public.kb_potluck_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_potluck_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view potluck items" ON public.kb_potluck_items FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage potluck items" ON public.kb_potluck_items FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public can view potluck claims" ON public.kb_potluck_claims FOR SELECT TO public USING (true);
CREATE POLICY "Users can claim items" ON public.kb_potluck_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own claims" ON public.kb_potluck_claims FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own claims" ON public.kb_potluck_claims FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add badges column to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kb_profiles' AND column_name = 'badges') THEN
        ALTER TABLE public.kb_profiles ADD COLUMN badges TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- ============================================
-- END OF MIGRATION
-- ============================================
