import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local. ' +
    'Falling back to Google Sheets API.'
  );
}

/** Default request timeout (ms) – avoids indefinite hangs. */
const REQUEST_TIMEOUT = 15_000;

/**
 * Fetch wrapper that enforces a timeout via AbortController.
 * Prevents Supabase calls from hanging indefinitely on poor connections.
 */
function fetchWithTimeout(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: fetchWithTimeout,
      },
    })
  : null;

/**
 * Check if Supabase is configured and available.
 * Used by services to decide whether to use Supabase or fall back to Google Sheets.
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
