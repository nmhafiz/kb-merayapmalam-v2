import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are missing or are the placeholders
export const isMissingConfig =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-project') ||
    supabaseAnonKey.includes('your-anon-key');

if (isMissingConfig) {
    console.warn('Missing or Placeholder Supabase Environment Variables');
}
// Initialize Supabase client
export const supabase = isMissingConfig
    ? createClient<Database>('https://placeholder.supabase.co', 'placeholder')
    : createClient<Database>(supabaseUrl, supabaseAnonKey);
