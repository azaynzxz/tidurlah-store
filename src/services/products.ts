import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/types/product';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type PromoRow = Database['public']['Tables']['promo_codes']['Row'];
type PromoInsert = Database['public']['Tables']['promo_codes']['Insert'];
type PromoUpdate = Database['public']['Tables']['promo_codes']['Update'];

// ============================================================
// Products Service — Supabase reads with products.json fallback
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

/**
 * Fetch all active products from Supabase, grouped by category.
 * Returns null if Supabase is not configured (caller should fall back to JSON).
 */
export async function fetchProductsFromSupabase(): Promise<Record<string, Product[]> | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Group by category (same shape as products.json)
    const grouped: Record<string, Product[]> = {};
    for (const row of data) {
      const product = transformProduct(row);
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    }

    return grouped;
  } catch (err: unknown) {
    console.error('[Products] Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Fetch a single product by slug from Supabase.
 * Returns null if not found or Supabase not configured.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      if (error) console.warn('[Products] fetchProductBySlug failed:', error.message);
      return null;
    }
    return transformProduct(data);
  } catch (err: unknown) {
    console.error('[Products] fetchProductBySlug exception:', err);
    return null;
  }
}

/**
 * Validate a promo code against Supabase promo_codes table.
 * Returns the promo data or null if not configured / not found.
 */
export async function validatePromoCode(code: string): Promise<{
  discount: number;
  productIds: number[] | null;
  minQuantity?: number;
  overridePrices?: Record<number, number>;
  type: 'percentage' | 'override';
} | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

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
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
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
