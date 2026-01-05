-- Migration: Add Missing Spec Tables (Announcements, Sponsors, Photos)
-- Created at: 2026-01-06 10:00:00

-- 1. Announcements
CREATE TABLE IF NOT EXISTS public.kb_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ
);

-- 2. Sponsors
CREATE TABLE IF NOT EXISTS public.kb_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Event-Sponsor Mapping
CREATE TABLE IF NOT EXISTS public.kb_event_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    sponsor_id UUID NOT NULL REFERENCES public.kb_sponsors(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'general', -- e.g., 'platinum', 'gold', 'silver'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, sponsor_id)
);

-- 4. Event Photos
CREATE TABLE IF NOT EXISTS public.kb_event_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Push Subscriptions (Web Push)
CREATE TABLE IF NOT EXISTS public.kb_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    device_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kb_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Announcements: Public view, Admin manage
CREATE POLICY "Public can view announcements" ON public.kb_announcements FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage announcements" ON public.kb_announcements FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Sponsors: Public view, Admin manage
CREATE POLICY "Public can view sponsors" ON public.kb_sponsors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage sponsors" ON public.kb_sponsors FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event Sponsors: Public view, Admin manage
CREATE POLICY "Public can view event sponsors" ON public.kb_event_sponsors FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage event sponsors" ON public.kb_event_sponsors FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Event Photos: Public view, Admin/Uploader manage
CREATE POLICY "Public can view event photos" ON public.kb_event_photos FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can upload photos" ON public.kb_event_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can manage own photos" ON public.kb_event_photos FOR ALL TO authenticated USING (auth.uid() = uploaded_by);

-- Push Subscriptions: Individual only
CREATE POLICY "Users can manage own subscriptions" ON public.kb_push_subscriptions FOR ALL TO authenticated
    USING (auth.uid() = user_id);
