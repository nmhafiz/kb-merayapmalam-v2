
-- Add badges column to kb_profiles if it doesn't exist
ALTER TABLE kb_profiles ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;

-- Example of how to add a badge to a user (admin manual step)
-- UPDATE kb_profiles SET badges = badges || '["verified"]'::jsonb WHERE id = '...';
