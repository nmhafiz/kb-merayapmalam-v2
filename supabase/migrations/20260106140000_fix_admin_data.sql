-- 1. Add is_suggested column to kb_potluck_items
ALTER TABLE public.kb_potluck_items 
ADD COLUMN IF NOT EXISTS is_suggested BOOLEAN DEFAULT false;

-- 2. Clean up and populate kb_event_sponsors properly
-- Clear existing links (if any, to avoid duplicates)
DELETE FROM public.kb_event_sponsors;

-- Get the first event ID (usually the upcoming one)
DO $$
DECLARE
    v_event_id UUID;
    v_sponsor_gold UUID;
    v_sponsor_silver UUID;
    v_sponsor_bronze UUID;
BEGIN
    SELECT id INTO v_event_id FROM public.kb_events ORDER BY date ASC LIMIT 1;
    
    -- Get sponsors
    SELECT id INTO v_sponsor_gold FROM public.kb_sponsors WHERE name = 'Kopi Jantan';
    SELECT id INTO v_sponsor_silver FROM public.kb_sponsors WHERE name = 'Kedai Kasut Ali';
    SELECT id INTO v_sponsor_bronze FROM public.kb_sponsors WHERE name = 'Air Mineral Semulajadi';

    -- Link Sponsors to Event
    IF v_event_id IS NOT NULL THEN
        -- Link Gold
        IF v_sponsor_gold IS NOT NULL THEN
            INSERT INTO public.kb_event_sponsors (event_id, sponsor_id, tier) VALUES (v_event_id, v_sponsor_gold, 'gold');
        END IF;

        -- Link Silver
        IF v_sponsor_silver IS NOT NULL THEN
            INSERT INTO public.kb_event_sponsors (event_id, sponsor_id, tier) VALUES (v_event_id, v_sponsor_silver, 'silver');
        END IF;

        -- Link Bronze
        IF v_sponsor_bronze IS NOT NULL THEN
            INSERT INTO public.kb_event_sponsors (event_id, sponsor_id, tier) VALUES (v_event_id, v_sponsor_bronze, 'bronze');
        END IF;
    END IF;
END $$;

-- 3. Update existing potluck items to be 'suggested' (HQ items)
-- Set all current items (seed data) to suggested. Future user items will default to false.
UPDATE public.kb_potluck_items SET is_suggested = true;
