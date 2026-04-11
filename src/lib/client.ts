/**
 * Re-export the existing hardened Supabase client.
 * This file exists for compatibility with shadcn Supabase UI components
 * that import from '@/lib/client'.
 */
export { supabase as default, supabase } from './supabase'
export { isSupabaseConfigured } from './supabase'
