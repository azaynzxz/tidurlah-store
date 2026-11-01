import { supabase, isSupabaseConfigured, fetchPublicSupabaseRest } from '@/lib/supabase';
import type { Product } from '@/types/product';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type PromoRow = Database['public']['Tables']['promo_codes']['Row'];
type PromoInsert = Database['public']['Tables']['promo_codes']['Insert'];
type PromoUpdate = Database['public']['Tables']['promo_codes']['Update'];

interface TidurlahHeadPrefetch {
  resolvedStatic: Record<string, Product[]> | null;
  resolvedSupabaseRows: ProductRow[] | null;
  staticCatalog: Promise<Record<string, Product[]> | null>;
  supabaseRows: Promise<ProductRow[] | null>;
  consumedSupabase: boolean;
  consumedStatic: boolean;
}

declare global {
  interface Window {
    __TIDURLAH_PREFETCH__?: TidurlahHeadPrefetch;
  }
}

const CATALOG_CACHE_KEY = 'tidurlah_catalog_swr_v2';
const CATALOG_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days SWR retention

let memoryCatalog: Record<string, Product[]> | null = null;
let memoryCatalogSource: 'supabase' | 'cache' | 'static' | null = null;

// ============================================================
// Products Service — Lock-Free Supabase REST + Instant SWR
// ============================================================

/**
 * Transform a Supabase product row into the frontend Product type.
 * The DB uses snake_case; the frontend expects camelCase.
 */
function transformProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    additionalImages: row.additional_images || [],
    description: row.description,
    price: row.price,
    discountPrice: row.discount_price,
    category: row.category,
    priceThresholds: (row.price_thresholds || []) as { minQuantity: number; price: number }[],
    time: row.time,
    rating: row.rating,
    bestseller: row.bestseller || false,
    pricingMethod: row.pricing_method || undefined,
    basePricePerSqm: row.base_price_per_sqm || undefined,
    minWidth: row.min_width || undefined,
    maxWidth: row.max_width || undefined,
    minHeight: row.min_height || undefined,
    maxHeight: row.max_height || undefined,
    laminationOptions: (row.lamination_options || undefined) as { type: string; price: number }[] | undefined,
    models: (row.models || undefined) as { code: string; image: string; price?: number }[] | undefined,
    unit: row.unit || 'pcs',
    is_available: row.is_available !== false,
    isCustomizable: row.is_customizable || false,
  };
}

function isNonEmptyCatalog(data: unknown): data is Record<string, Product[]> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const values = Object.values(data as Record<string, unknown>);
  return values.some((arr) => Array.isArray(arr) && arr.length > 0);
}

function groupProductRows(rows: ProductRow[]): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {};
  for (const row of rows) {
    const product = transformProduct(row);
    if (!grouped[product.category]) {
      grouped[product.category] = [];
    }
    grouped[product.category].push(product);
  }
  return grouped;
}

function readCachedCatalogFromStorage(): Record<string, Product[]> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { updatedAt?: number; data?: Record<string, Product[]> };
    if (!parsed || !isNonEmptyCatalog(parsed.data)) return null;
    if (parsed.updatedAt && Date.now() - parsed.updatedAt > CATALOG_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(CATALOG_CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedCatalogToStorage(data: Record<string, Product[]>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({ updatedAt: Date.now(), data })
    );
  } catch {
    // Ignore storage quota errors cleanly
  }
}

/**
 * Clear in-memory and localStorage catalog caches (called automatically after Admin CRUD).
 */
export function invalidateCatalogCache(): void {
  memoryCatalog = null;
  memoryCatalogSource = null;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CATALOG_CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Consume the static /products.json prefetch started in <head>, or fetch directly.
 */
async function fetchStaticProductsJson(): Promise<Record<string, Product[]> | null> {
  if (typeof window !== 'undefined' && window.__TIDURLAH_PREFETCH__ && !window.__TIDURLAH_PREFETCH__.consumedStatic) {
    window.__TIDURLAH_PREFETCH__.consumedStatic = true;
    const preloaded = await window.__TIDURLAH_PREFETCH__.staticCatalog;
    if (isNonEmptyCatalog(preloaded)) {
      if (!memoryCatalog) {
        memoryCatalog = preloaded;
        memoryCatalogSource = 'static';
      }
      return preloaded;
    }
  }

  try {
    const res = await fetch('/products.json', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    if (isNonEmptyCatalog(json)) {
      if (!memoryCatalog) {
        memoryCatalog = json;
        memoryCatalogSource = 'static';
      }
      return json;
    }
    return null;
  } catch (err) {
    console.error('[Products] Failed to load static /products.json:', err);
    return null;
  }
}

/**
 * Fetch all active products from Supabase, grouped by category.
 * Uses lock-free public REST (and consumes <head> prefetch on initial load) so it
 * NEVER blocks on GoTrueClient auth initialization or expired session refresh locks.
 */
export async function fetchProductsFromSupabase(): Promise<Record<string, Product[]> | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    let rows: ProductRow[] | null = null;

    if (
      typeof window !== 'undefined' &&
      window.__TIDURLAH_PREFETCH__ &&
      !window.__TIDURLAH_PREFETCH__.consumedSupabase
    ) {
      window.__TIDURLAH_PREFETCH__.consumedSupabase = true;
      rows = await window.__TIDURLAH_PREFETCH__.supabaseRows;
    }

    // If <head> prefetch was not present or failed transiently, race same-origin /api/products (in prod)
    // and direct lock-free Supabase REST with retry
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      const directRestPromise = fetchPublicSupabaseRest<ProductRow[]>(
        'products?select=*&is_active=eq.true&order=sort_order.asc',
        { timeoutMs: 8000, retries: 1 }
      );

      if (import.meta.env.PROD && typeof window !== 'undefined') {
        const edgeProxyPromise = (async (): Promise<ProductRow[] | null> => {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 4500);
          try {
            const res = await fetch('/api/products?fresh=1', {
              headers: { Accept: 'application/json' },
              signal: ctrl.signal,
            });
            const ct = res.headers.get('content-type') || '';
            if (!res.ok || !ct.includes('json')) return null;
            const json = (await res.json()) as unknown;
            return Array.isArray(json) && json.length > 0 ? (json as ProductRow[]) : null;
          } catch {
            return null;
          } finally {
            clearTimeout(timer);
          }
        })();

        rows = await new Promise<ProductRow[] | null>((resolve) => {
          let settled = false;
          let remaining = 2;
          const onCandidate = (candidate: ProductRow[] | null) => {
            remaining -= 1;
            if (!settled && candidate && candidate.length > 0) {
              settled = true;
              resolve(candidate);
              return;
            }
            if (!settled && remaining <= 0) {
              resolve(null);
            }
          };
          edgeProxyPromise.then(onCandidate);
          directRestPromise.then(onCandidate);
        });
      } else {
        rows = await directRestPromise;
      }
    }

    if (!rows || rows.length === 0) return null;

    const grouped = groupProductRows(rows);
    if (isNonEmptyCatalog(grouped)) {
      memoryCatalog = grouped;
      memoryCatalogSource = 'supabase';
      writeCachedCatalogToStorage(grouped);
      return grouped;
    }

    return null;
  } catch (err: unknown) {
    console.error('[Products] Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Synchronously returns an immediately renderable product catalog if available in memory,
 * <head> pre-fetched responses, or localStorage SWR cache — eliminating initial skeleton flashes.
 */
export function getInitialCatalogSync(): Record<string, Product[]> | null {
  if (memoryCatalog && memoryCatalogSource === 'supabase' && isNonEmptyCatalog(memoryCatalog)) {
    return memoryCatalog;
  }

  // 1. Check if <head> live Supabase prefetch already resolved while JS was downloading
  if (typeof window !== 'undefined' && window.__TIDURLAH_PREFETCH__?.resolvedSupabaseRows) {
    const rows = window.__TIDURLAH_PREFETCH__.resolvedSupabaseRows;
    if (Array.isArray(rows) && rows.length > 0) {
      const grouped = groupProductRows(rows);
      if (isNonEmptyCatalog(grouped)) {
        memoryCatalog = grouped;
        memoryCatalogSource = 'supabase';
        writeCachedCatalogToStorage(grouped);
        return grouped;
      }
    }
  }

  // 2. Check in-memory cache or localStorage SWR snapshot from previous visit
  if (memoryCatalog && isNonEmptyCatalog(memoryCatalog)) {
    return memoryCatalog;
  }

  const cached = readCachedCatalogFromStorage();
  if (cached) {
    memoryCatalog = cached;
    memoryCatalogSource = 'cache';
    return cached;
  }

  // 3. Check if <head> static /products.json prefetch already resolved (incognito cold start)
  if (typeof window !== 'undefined' && window.__TIDURLAH_PREFETCH__?.resolvedStatic) {
    const staticData = window.__TIDURLAH_PREFETCH__.resolvedStatic;
    if (isNonEmptyCatalog(staticData)) {
      memoryCatalog = staticData;
      memoryCatalogSource = 'static';
      return staticData;
    }
  }

  return null;
}

/**
 * Loads the product catalog using Stale-While-Revalidate + Parallel Fallback:
 * - Revalidates against live Supabase REST immediately (using <head> pre-fetched promise).
 * - If no cached catalog was available synchronously on mount, races a 250ms grace window
 *   before rendering static `/products.json` so cold visitors never stare at skeletons,
 *   then seamlessly upgrades to live Supabase data as soon as it resolves.
 */
export function loadCatalogWithSWR(
  onUpdate: (catalog: Record<string, Product[]>, source: 'supabase' | 'static') => void,
  onSettled?: () => void
): () => void {
  let cancelled = false;
  let hasLiveResolved = false;
  let deliveredFallback = false;

  const hasInitialSyncData = Boolean(getInitialCatalogSync());
  const staticPromise = fetchStaticProductsJson();
  const livePromise = fetchProductsFromSupabase();

  // For brand-new cold visits without localStorage cache, show static /products.json
  // if live Supabase takes longer than 250ms (it already had a head-start in <head>)
  const graceTimer = !hasInitialSyncData
    ? setTimeout(async () => {
      if (cancelled || hasLiveResolved) return;
      const staticData = await staticPromise;
      if (!cancelled && !hasLiveResolved && staticData) {
        deliveredFallback = true;
        onUpdate(staticData, 'static');
      }
    }, 250)
    : null;

  livePromise
    .then(async (liveData) => {
      if (graceTimer) clearTimeout(graceTimer);
      if (cancelled) return;

      if (liveData && isNonEmptyCatalog(liveData)) {
        hasLiveResolved = true;
        onUpdate(liveData, 'supabase');
        onSettled?.();
        return;
      }

      // Live Supabase unavailable — ensure static fallback is delivered if we have nothing yet
      if (!hasInitialSyncData && !deliveredFallback) {
        const staticData = await staticPromise;
        if (!cancelled && staticData) {
          onUpdate(staticData, 'static');
        }
      }
      if (!cancelled) {
        onSettled?.();
      }
    })
    .catch(async () => {
      if (graceTimer) clearTimeout(graceTimer);
      if (cancelled) return;
      if (!hasInitialSyncData && !deliveredFallback) {
        const staticData = await staticPromise;
        if (!cancelled && staticData) {
          onUpdate(staticData, 'static');
        }
      }
      if (!cancelled) {
        onSettled?.();
      }
    });

  return () => {
    cancelled = true;
    if (graceTimer) clearTimeout(graceTimer);
  };
}

// Prime memoryCatalog as soon as this module is evaluated if <head> prefetch already resolved
if (typeof window !== 'undefined' && window.__TIDURLAH_PREFETCH__) {
  window.__TIDURLAH_PREFETCH__.staticCatalog
    .then((staticData) => {
      if (!memoryCatalog && isNonEmptyCatalog(staticData)) {
        memoryCatalog = staticData;
        memoryCatalogSource = 'static';
      }
    })
    .catch(() => { });

  window.__TIDURLAH_PREFETCH__.supabaseRows
    .then((rows) => {
      if (rows && Array.isArray(rows) && rows.length > 0 && memoryCatalogSource !== 'supabase') {
        const grouped = groupProductRows(rows);
        if (isNonEmptyCatalog(grouped)) {
          memoryCatalog = grouped;
          memoryCatalogSource = 'supabase';
          writeCachedCatalogToStorage(grouped);
        }
      }
    })
    .catch(() => { });
}

/**
 * Fetch a single product by slug from Supabase using lock-free public REST.
 * Returns null if not found or Supabase not configured.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const encodedSlug = encodeURIComponent(slug);
    const data = await fetchPublicSupabaseRest<ProductRow>(
      `products?select=*&slug=eq.${encodedSlug}&is_active=eq.true&limit=1`,
      { timeoutMs: 4500, retries: 1, acceptSingleObject: true }
    );

    if (!data) return null;
    return transformProduct(data);
  } catch (err: unknown) {
    console.error('[Products] fetchProductBySlug exception:', err);
    return null;
  }
}

/**
 * Validate a promo code against Supabase promo_codes table using lock-free public REST.
 * Returns the promo data or null if not configured / not found.
 */
export async function validatePromoCode(code: string): Promise<{
  discount: number;
  productIds: number[] | null;
  minQuantity?: number;
  overridePrices?: Record<number, number>;
  type: 'percentage' | 'override';
} | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const encodedCode = encodeURIComponent(code.toUpperCase());
    const data = await fetchPublicSupabaseRest<PromoRow>(
      `promo_codes?select=*&code=eq.${encodedCode}&is_active=eq.true&limit=1`,
      { timeoutMs: 4500, retries: 1, acceptSingleObject: true }
    );

    if (!data) return null;

    // Check date validity
    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) return null;
    if (data.valid_until && new Date(data.valid_until) < now) return null;

    // Check usage limit
    if (data.max_uses && data.current_uses >= data.max_uses) return null;

    return {
      discount: data.discount_percent,
      productIds: data.product_ids ? (data.product_ids as number[]) : null,
      minQuantity: data.min_quantity || undefined,
      overridePrices: data.override_prices
        ? (data.override_prices as Record<number, number>)
        : undefined,
      type: data.type as 'percentage' | 'override',
    };
  } catch (err: unknown) {
    console.error('[Products] validatePromoCode exception:', err);
    return null;
  }
}

// ============================================================
// Admin CRUD — Products
// ============================================================

export async function fetchAllProducts(): Promise<ProductRow[]> {
  if (!supabase || !isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createProduct(product: ProductInsert): Promise<ProductRow> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  invalidateCatalogCache();
  return data;
}

export async function updateProduct(id: number, updates: ProductUpdate): Promise<ProductRow> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  invalidateCatalogCache();
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  invalidateCatalogCache();
}

// ============================================================
// Admin CRUD — Promo Codes
// ============================================================

export async function fetchAllPromoCodes(): Promise<PromoRow[]> {
  if (!supabase || !isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPromoCode(promo: PromoInsert): Promise<PromoRow> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('promo_codes')
    .insert(promo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePromoCode(id: number, updates: PromoUpdate): Promise<PromoRow> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('promo_codes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePromoCode(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
