-- Fix missing options for the active poll
DO $$
DECLARE
    v_poll_id UUID;
BEGIN
    -- 1. Find the active poll (or specifically the one users are seeing)
    SELECT id INTO v_poll_id FROM public.kb_polls 
    WHERE question LIKE 'Nak run hari apa%' 
    LIMIT 1;

    -- 2. If found, ensure options exist
    IF v_poll_id IS NOT NULL THEN
        -- Ensure sort_order column exists
        ALTER TABLE public.kb_poll_options ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

        -- Delete existing options (and associated votes via CASCADE) to allow clean re-insertion
        DELETE FROM public.kb_poll_options WHERE poll_id = v_poll_id;

        -- Re-insert options
        INSERT INTO public.kb_poll_options (poll_id, option_text, sort_order) VALUES
        (v_poll_id, 'Selasa (8.30 PM)', 1),
        (v_poll_id, 'Rabu (8.30 PM)', 2),
        (v_poll_id, 'Khamis (8.30 PM)', 3);
    END IF;
END $$;
