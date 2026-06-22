import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { OrderInsert, OrderItemInsert, OrderDeliveryInsert, Database } from '@/types/supabase';
import type { Json } from '@/types/supabase';

// ============================================================
// Orders Service — Supabase CRUD with Google Sheets fallback
// ============================================================

/**
 * Create order in Supabase (orders + order_items + order_deliveries).
 * Returns the created order ID or throws.
 */
export async function createOrder(params: {
  orderId: string;
  channel: 'pos' | 'website';
  cashier: string;
  cashierUserId?: string;
  customerName: string;
  customerPhone: string;
  institution: string;
  items: {
    productId?: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    modelCode?: string;
    caseVariant?: string;
    lamination?: string;
    width?: number;
    height?: number;
    dimensionText?: string;
    area?: string;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  downPayment?: number;
  remainingBalance?: number;
  paymentMethod?: string;
  promoCode?: string;
  promoDiscount?: number;
  designNote?: string;
  isShipping?: boolean;
  address?: string;
  deadline?: string;
  hasJasaDesain?: boolean;
  cabang?: string;
  delivery?: {
    recipientName: string;
    recipientPhone: string;
    address: string;
  };
}): Promise<{ orderId: string; invoiceNumber: string | null; warnings?: string[] }> {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  // Build items summary text
  const itemsSummary = params.items
    .map(i => `${i.name} (${i.quantity}×)`)
    .join(', ');

  // 1. Insert order
  const orderData: OrderInsert = {
    order_id: params.orderId,
    invoice_number: params.orderId, // Use the client-generated invoice as canonical
    channel: params.channel,
    cashier: params.cashier,
    cashier_user_id: params.cashierUserId || undefined,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    institution: params.institution,
    subtotal: params.subtotal,
    discount: params.discount,
    total: params.total,
    down_payment: params.downPayment || 0,
    remaining_balance: params.remainingBalance ?? params.total,
    payment_method: params.paymentMethod || 'Cash',
    order_status: (params.downPayment && params.downPayment > 0 && params.downPayment < params.total)
      ? 'partial' : 'pending',
    item_count: params.items.length,
    items_summary: itemsSummary,
    promo_code: params.promoCode || '',
    promo_discount: params.promoDiscount || 0,
    design_note: params.designNote || '',
    is_shipping: params.isShipping || false,
    address: params.address || '',
    deadline: params.deadline || undefined,
    has_jasa_desain: params.hasJasaDesain || false,
    cabang: params.cabang || null,
  };

  const { error: orderError } = await supabase
    .from('orders')
    .insert(orderData);

  if (orderError) {
    console.error('[Orders] Insert order failed:', orderError);
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // 2. Insert order items
  const itemRows: OrderItemInsert[] = params.items.map(item => ({
    order_id: params.orderId,
    product_id: item.productId || undefined,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.subtotal,
    model_code: item.modelCode || '',
    case_variant: item.caseVariant || '',
    lamination: item.lamination || '',
    width: item.width || undefined,
    height: item.height || undefined,
    dimension_text: item.dimensionText || '',
    area: item.area || '',
  }));

  const warnings: string[] = [];

  if (itemRows.length > 0) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemRows);

    if (itemsError) {
      console.error('[Orders] Insert items failed:', itemsError);
      warnings.push(`Items failed: ${itemsError.message}`);
    }
  }

  // 3. Insert delivery if shipping
  if (params.isShipping && params.delivery) {
    const deliveryData: OrderDeliveryInsert = {
      order_id: params.orderId,
      recipient_name: params.delivery.recipientName,
      recipient_phone: params.delivery.recipientPhone,
      address: params.delivery.address,
    };

    const { error: deliveryError } = await supabase
      .from('order_deliveries')
      .insert(deliveryData);

    if (deliveryError) {
      console.error('[Orders] Insert delivery failed:', deliveryError);
      warnings.push(`Delivery failed: ${deliveryError.message}`);
    }
  }

  // Invoice number is the client-generated orderId (set on insert above)
  return { orderId: params.orderId, invoiceNumber: params.orderId, warnings };
}

/**
 * Fetch paginated orders from Supabase using the get_orders() database function.
 * Falls back to null if Supabase is not configured.
 */
export async function fetchOrders(params: {
  limit?: number;
  offset?: number;
  channel?: string;
  status?: string;
  cashier?: string;
  search?: string;
  includeDeleted?: boolean;
  deletedOnly?: boolean;
} = {}): Promise<{
  success: boolean;
  orders: Record<string, unknown>[];
  total: number;
  error?: string;
} | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.rpc('get_orders', {
      p_limit: params.limit || 50,
      p_offset: params.offset || 0,
      p_channel: params.channel || null,
      p_status: params.status || null,
      p_cashier: params.cashier || null,
      p_search: params.search || null,
      p_include_deleted: params.includeDeleted || false,
      p_deleted_only: params.deletedOnly || false,
    });

    if (error) throw error;

    const result = data as unknown as { success: boolean; orders: Record<string, unknown>[]; total: number };
    return {
      success: result.success,
      orders: result.orders || [],
      total: result.total || 0,
    };
  } catch (err: unknown) {
    console.error('[Orders] Fetch failed:', err);
    return { success: false, orders: [], total: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Update order status in Supabase.
 */
export async function updateOrderStatusSupabase(
  orderId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) return { success: false, error: 'Not configured' };

  const { error } = await supabase
    .from('orders')
    .update({ order_status: status as 'pending' | 'partial' | 'done' | 'cancelled' })
    .eq('order_id', orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Soft-delete order (set deleted_at timestamp).
 */
export async function softDeleteOrder(
  orderId: string,
  deletedBy: string = 'Admin'
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) return { success: false, error: 'Not configured' };

  const { error } = await supabase
    .from('orders')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
    })
    .eq('order_id', orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Restore soft-deleted order.
 */
export async function restoreOrderSupabase(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) return { success: false, error: 'Not configured' };

  const { error } = await supabase
    .from('orders')
    .update({ deleted_at: null, deleted_by: null })
    .eq('order_id', orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Assign designer to an order.
 */
export async function assignDesignerSupabase(
  orderId: string,
  designer: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) return { success: false, error: 'Not configured' };

  const { error } = await supabase
    .from('orders')
    .update({ designer, has_jasa_desain: true })
    .eq('order_id', orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Edit an existing order (update fields + replace items).
 * This replaces the Apps Script "isEdit" flow (delete + re-insert).
 */
export async function editOrder(params: {
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  institution?: string;
  items?: OrderItemInsert[];
  subtotal?: number;
  discount?: number;
  total?: number;
  downPayment?: number;
  remainingBalance?: number;
  deadline?: string;
  designNote?: string;
  cabang?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured()) return { success: false, error: 'Not configured' };

  // Update order fields
  const updates: Partial<Database['public']['Tables']['orders']['Update']> = {};
  if (params.customerName !== undefined) updates.customer_name = params.customerName;
  if (params.customerPhone !== undefined) updates.customer_phone = params.customerPhone;
  if (params.institution !== undefined) updates.institution = params.institution;
  if (params.subtotal !== undefined) updates.subtotal = params.subtotal;
  if (params.discount !== undefined) updates.discount = params.discount;
  if (params.total !== undefined) updates.total = params.total;
  if (params.downPayment !== undefined) updates.down_payment = params.downPayment;
  if (params.remainingBalance !== undefined) updates.remaining_balance = params.remainingBalance;
  if (params.deadline !== undefined) updates.deadline = params.deadline;
  if (params.designNote !== undefined) updates.design_note = params.designNote;
  if (params.cabang !== undefined) updates.cabang = params.cabang;

  if (Object.keys(updates).length > 0) {
    // Also update items summary
    if (params.items) {
      updates.items_summary = params.items
        .map(i => `${i.product_name} (${i.quantity}×)`)
        .join(', ');
      updates.item_count = params.items.length;
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', params.orderId);

    if (error) return { success: false, error: error.message };
  }

  // Replace items if provided (delete old + insert new)
  if (params.items) {
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', params.orderId);

    if (deleteError) {
      console.error('[Orders] Delete old items failed:', deleteError);
    }

    const { error: insertError } = await supabase
      .from('order_items')
      .insert(params.items);

    if (insertError) return { success: false, error: insertError.message };
  }

  return { success: true };
}
