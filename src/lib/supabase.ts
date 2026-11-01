import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabaseUrl: string | undefined =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  undefined;

export const supabaseAnonKey: string | undefined =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local. ' +
    'Falling back to Google Sheets API.'
  );
}

/** Default request timeout (ms) – avoids indefinite hangs. */
const REQUEST_TIMEOUT = 10_000;

/** Fast public read timeout (ms) – ensures storefront never stalls on poor mobile networks. */
const PUBLIC_READ_TIMEOUT = 5_000;

/**
 * Fetch wrapper that enforces a timeout via AbortController.
 * Prevents Supabase calls from hanging indefinitely on poor connections.
 */
function fetchWithTimeout(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Lock-free public PostgREST fetch using the publishable/anon key directly.
 * Bypasses GoTrueClient auth initialization locks (`supabase.auth.getSession()`)
 * so public storefront queries can NEVER deadlock on expired or refreshing auth tokens,
 * and enforces a strict timeout with 1 automatic fast retry on network glitches.
 */
export async function fetchPublicSupabaseRest<T>(
  restPathWithQuery: string,
  options?: { timeoutMs?: number; retries?: number; acceptSingleObject?: boolean }
): Promise<T | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const timeoutMs = options?.timeoutMs ?? PUBLIC_READ_TIMEOUT;
  const retries = options?.retries ?? 1;
  const baseUrl = supabaseUrl.replace(/\/+$/, '');
  const cleanPath = restPathWithQuery.replace(/^\/+/, '');
  const fullUrl = `${baseUrl}/rest/v1/${cleanPath}`;

  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    Accept: options?.acceptSingleObject
      ? 'application/vnd.pgrst.object+json'
      : 'application/json',
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        // 406 on single-row PostgREST query means 0 rows matched — do not retry
        if (response.status === 406 || response.status === 404) {
          return null;
        }
        throw new Error(`Supabase REST HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  console.warn('[Supabase] Public REST fetch failed:', lastError);
  return null;
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Bypasses navigator.locks by using a no-op lock function to prevent timeout errors
        lock: async (_name, _acquireTimeout, fn) => {
          return await fn();
        },
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
