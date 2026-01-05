
-- 1. First, make sure you have at least one event in kb_events.
-- If not, run this:
-- INSERT INTO kb_events (title, date, time, location_name, description)
-- VALUES ('Night Prowl KB', '2026-01-10', '21:00', 'Taman Hijau', 'Santai run community.');

-- 2. Get the ID of an event and replace it below:
-- Let's assume we add items for all events for demo purposes:

INSERT INTO kb_potluck_items (event_id, name, description, category, quantity_required)
SELECT 
    id as event_id,
    'Air Mineral 1.5L' as name,
    'Sorang bawak sebotol cukup' as description,
    'drink' as category,
    10 as quantity_required
FROM kb_events
LIMIT 1;

INSERT INTO kb_potluck_items (event_id, name, description, category, quantity_required)
SELECT 
    id as event_id,
    'Pau Sambal / Karipap' as name,
    'Untuk alas perut lepas lari' as description,
    'food' as category,
    20 as quantity_required
FROM kb_events
LIMIT 1;

-- 3. Mock some claims (Optional)
-- INSERT INTO kb_potluck_claims (item_id, user_id, quantity_promised)
-- VALUES ('item_id_here', 'your_user_id', 2);
