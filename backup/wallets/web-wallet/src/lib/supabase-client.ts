/**
 * Supabase client singleton
 * Creates and manages Supabase client instance
 */

import { createClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './supabase-config';

export const supabase = createClient(
  SupabaseConfig.supabaseURL,
  SupabaseConfig.supabaseKey
);

