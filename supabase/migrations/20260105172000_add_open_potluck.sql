-- Migration: Enhance Potluck with community contributions
-- Created at: 2026-01-05 17:20:00

-- 1. Add is_suggested column to distinguish HQ wishlist from community items
ALTER TABLE public.kb_potluck_items 
ADD COLUMN IF NOT EXISTS is_suggested BOOLEAN DEFAULT false;

-- 2. Backfill existing items as suggested (assuming they were created by admin)
UPDATE public.kb_potluck_items SET is_suggested = true;

-- 3. Relax RLS for kb_potluck_items to allow users to contribute
DROP POLICY IF EXISTS "Admins can manage potluck items" ON public.kb_potluck_items;

CREATE POLICY "Users can add potluck items" ON public.kb_potluck_items
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can manage their own potluck items" ON public.kb_potluck_items
    FOR ALL TO authenticated
    USING (
        auth.uid() = created_by OR 
        EXISTS (SELECT 1 FROM public.kb_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 4. Update Potluck Claims policy to allow users to view details (needed for profiles)
-- (Already exists as "Public can view claims")
