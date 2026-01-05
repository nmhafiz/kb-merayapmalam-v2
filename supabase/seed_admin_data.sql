-- ============================================
-- SEED DATA: Sample Admin Content
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ANNOUNCEMENTS
INSERT INTO public.kb_announcements (title, content, is_urgent, is_pinned) VALUES
('Selamat Datang ke Merayap Malam!', 'Crew running malam terbaik di KB. Jom join run setiap minggu!', false, true),
('Run Malam Ini Confirm Jalan', 'Cuaca cantik, jangan lupa bawa air dan headlamp. Jumpa semua kat checkpoint!', false, false),
('PENTING: Tukar Lokasi', 'Run malam ni tukar ke Stadium Mini sebab ada event kat Dataran. Jumpa pukul 9pm sharp!', true, false);

-- 2. POLLS
INSERT INTO public.kb_polls (question, is_active) VALUES
('Nak run hari apa minggu depan?', true),
('Route mana korang prefer?', true),
('Pace berapa sesuai untuk newbie?', false);

-- Get poll IDs and insert options
DO $$
DECLARE
    poll1_id UUID;
    poll2_id UUID;
    poll3_id UUID;
BEGIN
    SELECT id INTO poll1_id FROM public.kb_polls WHERE question LIKE '%hari apa%' LIMIT 1;
    SELECT id INTO poll2_id FROM public.kb_polls WHERE question LIKE '%Route mana%' LIMIT 1;
    SELECT id INTO poll3_id FROM public.kb_polls WHERE question LIKE '%Pace berapa%' LIMIT 1;
    
    -- Poll 1 options
    INSERT INTO public.kb_poll_options (poll_id, option_text, votes) VALUES
    (poll1_id, 'Isnin', 5),
    (poll1_id, 'Rabu', 8),
    (poll1_id, 'Jumaat', 12),
    (poll1_id, 'Ahad', 3);
    
    -- Poll 2 options
    INSERT INTO public.kb_poll_options (poll_id, option_text, votes) VALUES
    (poll2_id, 'Dataran Loop', 10),
    (poll2_id, 'Pantai Route', 7),
    (poll2_id, 'Stadium Circuit', 4);
    
    -- Poll 3 options
    INSERT INTO public.kb_poll_options (poll_id, option_text, votes) VALUES
    (poll3_id, '6:00 pace', 2),
    (poll3_id, '7:00 pace', 15),
    (poll3_id, '8:00 pace', 8);
END $$;

-- 3. ROUTES
INSERT INTO public.kb_routes (name, description, distance_km, difficulty, map_url, strava_url) VALUES
('Dataran Loop', 'Loop santai sekitar Dataran KB. Flat dan sesuai untuk semua level.', 5.0, 'easy', 'https://maps.google.com/?q=Dataran+KB', 'https://strava.com/routes/dataran'),
('Pantai Irama Trail', 'Trail run di Pantai Irama. Ada bukit sikit, pemandangan cantik!', 7.5, 'medium', 'https://maps.google.com/?q=Pantai+Irama', 'https://strava.com/routes/pantai'),
('Stadium Circuit', 'Lari keliling stadium. Good for tempo run.', 3.0, 'easy', 'https://maps.google.com/?q=Stadium+KB', null),
('Bukit Challenge', 'Route untuk yang nak challenge diri sendiri. Banyak tanjakan!', 10.0, 'hard', 'https://maps.google.com/?q=Bukit+KB', 'https://strava.com/routes/bukit');

-- 4. SPONSORS
INSERT INTO public.kb_sponsors (name, logo_url, website_url, tier, is_active) VALUES
('100Plus', 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/100Plus_logo.svg/1200px-100Plus_logo.svg.png', 'https://100plus.com.my', 'gold', true),
('Nike', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png', 'https://nike.com.my', 'platinum', true),
('Kedai Kopi Pak Ali', null, null, 'bronze', true);

-- 5. POTLUCK ITEMS (for existing event)
DO $$
DECLARE
    event_id UUID;
BEGIN
    SELECT id INTO event_id FROM public.kb_events LIMIT 1;
    
    IF event_id IS NOT NULL THEN
        INSERT INTO public.kb_potluck_items (event_id, name, category, quantity_needed, description) VALUES
        (event_id, 'Air Mineral', 'drink', 10, 'Botol 500ml'),
        (event_id, 'Pisang', 'food', 20, 'Untuk energy sebelum run'),
        (event_id, 'Kurma', 'food', 15, 'Snack selepas run'),
        (event_id, 'Isotonic Drink', 'drink', 8, '100Plus atau Revive'),
        (event_id, 'First Aid Kit', 'other', 1, 'Plaster dan antiseptic');
    END IF;
END $$;

-- ============================================
-- DONE! Sample data inserted successfully.
-- ============================================
