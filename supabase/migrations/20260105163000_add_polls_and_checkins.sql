-- Create kb_polls table
CREATE TABLE kb_polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    event_id UUID REFERENCES kb_events(id) ON DELETE SET NULL -- Optional link to event
);

-- Enable RLS for kb_polls
ALTER TABLE kb_polls ENABLE ROW LEVEL SECURITY;

-- Policies for kb_polls
CREATE POLICY "Public can view polls" ON kb_polls FOR SELECT USING (true);
CREATE POLICY "Admins can create/update polls" ON kb_polls FOR ALL USING (
    EXISTS (SELECT 1 FROM kb_profiles WHERE id = auth.uid() AND role IN ('admin', 'marshal'))
);

-- Create kb_poll_options table
CREATE TABLE kb_poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES kb_polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- Enable RLS for kb_poll_options
ALTER TABLE kb_poll_options ENABLE ROW LEVEL SECURITY;

-- Policies for kb_poll_options
CREATE POLICY "Public can view poll options" ON kb_poll_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage poll options" ON kb_poll_options FOR ALL USING (
    EXISTS (SELECT 1 FROM kb_profiles WHERE id = auth.uid() AND role IN ('admin', 'marshal'))
);

-- Create kb_poll_votes table
CREATE TABLE kb_poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    poll_id UUID REFERENCES kb_polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES kb_poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Enable RLS for kb_poll_votes
ALTER TABLE kb_poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for kb_poll_votes
CREATE POLICY "Public can view votes" ON kb_poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON kb_poll_votes FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "Users can change their vote" ON kb_poll_votes FOR UPDATE USING (
    auth.uid() = user_id
);

-- Create kb_checkins table
CREATE TABLE kb_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_id UUID REFERENCES kb_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id) -- Prevent double check-in
);

-- Enable RLS for kb_checkins
ALTER TABLE kb_checkins ENABLE ROW LEVEL SECURITY;

-- Policies for kb_checkins
CREATE POLICY "Users can view their own checkins" ON kb_checkins FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM kb_profiles WHERE id = auth.uid() AND role IN ('admin', 'marshal'))
);
CREATE POLICY "Admins can insert checkins" ON kb_checkins FOR INSERT WITH CHECK (
    -- Allow admins/marshals to manually check people in OR users scan QR
    -- For now, let's allow authenticated users to insert if they have the valid event_id (QR scan logic handled in frontend/edge function usually, but direct insert is okay for MVP if RLS checks event validity - simplified here)
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM kb_profiles WHERE id = auth.uid() AND role IN ('admin', 'marshal'))
);
