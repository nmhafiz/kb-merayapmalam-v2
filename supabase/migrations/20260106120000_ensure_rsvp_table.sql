-- Ensure kb_event_rsvps table exists
CREATE TABLE IF NOT EXISTS public.kb_event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.kb_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.kb_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Allow public read (so everyone can see who is going)
CREATE POLICY "Public can view RSVPs" ON public.kb_event_rsvps 
    FOR SELECT TO public USING (true);

-- Allow authenticated users to manage their own RSVP
CREATE POLICY "Users can manage their own RSVP" ON public.kb_event_rsvps 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
