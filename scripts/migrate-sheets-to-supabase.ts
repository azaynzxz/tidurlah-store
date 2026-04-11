/**
 * migrate-sheets-to-supabase.ts
 * 
 * One-time migration script: imports ALL historical orders from Google Sheets
 * into Supabase. Safe to run multiple times (skips existing orders by order_id).
 * 
 * Usage:
 *   npx tsx scripts/migrate-sheets-to-supabase.ts
 * 
 * Requirements:
 *   - .env.local must have VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
 *   - Or set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for full access
 *   - Google Sheets API must be accessible
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Configuration
// ============================================================

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw0cpwKU0n3iS-HK9uRUlhkwZUUCRPGnPYI512cch3G8wIi06WzvvYw0UWiqXtWXQZIvg/exec';

// Batch size for Supabase inserts
const BATCH_SIZE = 50;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY. Check .env.local');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// Admin credentials for RLS-gated operations (anon key cannot read/write orders)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@google.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

async function ensureAuthenticated() {
  if (!ADMIN_PASSWORD) {
    console.error('❌ ADMIN_PASSWORD is required. Run with:');
    console.error('   ADMIN_PASSWORD=yourpass npx tsx scripts/migrate-sheets-to-supabase.ts');
    process.exit(1);
  }
  console.log(`🔐 Signing in as ${ADMIN_EMAIL}...`);
  const { error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (error) {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
  }
  console.log('✅ Authenticated\n');
}

// ============================================================
// Types
// ============================================================

interface GSheetOrder {
  orderId: string;
  timestamp: string;
  channel: string;
  cashier: string;
  customerName: string;
  customerPhone: string;
  institution: string;
  subtotal: number;
  discount: number;
  total: number;
  downPayment: number;
  remainingBalance: number;
  paymentMethod: string;
  orderStatus: string;
  itemCount: number;
  itemsSummary: string;
  promoCode: string;
  promoDiscount: number;
  designNote: string;
  isShipping: string;
  address: string;
  deadline: string;
  designer?: string;
  items?: GSheetItem[];
  delivery?: GSheetDelivery;
}

interface GSheetItem {
  productId?: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  modelCode?: string;
  caseVariant?: string;
  lamination?: string;
  width?: number | string;
  height?: number | string;
  dimensionText?: string;
  area?: string;
}

interface GSheetDelivery {
  recipientName: string;
  recipientPhone: string;
  address: string;
  shippingCost?: number;
  status?: string;
}

// ============================================================
// Step 1: Fetch ALL orders from Google Sheets
// ============================================================

async function fetchAllOrdersFromSheets(): Promise<GSheetOrder[]> {
  console.log('📥 Fetching orders from Google Sheets...');

  // Fetch all orders in a single request (API ignores offset; limit=10000 works)
  const url = `${GOOGLE_SHEETS_URL}?action=orders&limit=10000&t=${Date.now()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.success || !data.orders) {
    console.error('❌ Failed to fetch orders from Google Sheets:', data.error || 'Unknown error');
    return [];
  }

  const allOrders: GSheetOrder[] = data.orders;

  // Deduplicate by orderId (just in case)
  const seen = new Map<string, GSheetOrder>();
  for (const order of allOrders) {
    if (order.orderId && !seen.has(order.orderId)) {
      seen.set(order.orderId, order);
    }
  }
  return Array.from(seen.values());
}

// ============================================================
// Step 2: Get existing order IDs from Supabase (for dedup)
// ============================================================

async function getExistingOrderIds(): Promise<Set<string>> {
  console.log('🔍 Checking existing orders in Supabase...');
  const { data, error } = await supabase
    .from('orders')
    .select('order_id');

  if (error) {
    console.warn('⚠️ Could not fetch existing orders:', error.message);
    return new Set();
  }

  const ids = new Set((data || []).map((r: { order_id: string }) => r.order_id));
  console.log(`   Found ${ids.size} existing orders in Supabase`);
  return ids;
}

// ============================================================
// Step 3: Transform GSheets order → Supabase format
// ============================================================

function transformOrder(order: GSheetOrder) {
  const isShipping = order.isShipping === 'Ya' || order.isShipping === 'yes' || order.isShipping === true as unknown as string;
  const hasDesigner = !!order.designer && order.designer.trim() !== '';

  // Parse timestamp — GSheets format: "2026-03-11 12:00:00" or ISO
  let timestamp: string;
  try {
    timestamp = new Date(order.timestamp).toISOString();
  } catch {
    timestamp = new Date().toISOString();
  }

  // Parse deadline
  let deadline: string | null = null;
  if (order.deadline && order.deadline.trim()) {
    try {
      deadline = new Date(order.deadline).toISOString();
    } catch {
      deadline = null;
    }
  }

  // Normalize order status
  const status = (order.orderStatus || 'pending').toLowerCase();
  const validStatuses = ['pending', 'partial', 'done', 'cancelled'];
  const orderStatus = validStatuses.includes(status) ? status : 'pending';

  // Helper: safely round to integer (GSheets can have floating-point artifacts)
  const int = (v: unknown): number => Math.round(Number(v) || 0);

  return {
    order: {
      order_id: order.orderId,
      invoice_number: order.orderId,
      timestamp,
      channel: 'migrated' as const,
      cashier: order.cashier || '',
      customer_name: order.customerName || '',
      customer_phone: String(order.customerPhone || ''),
      institution: order.institution || '',
      subtotal: int(order.subtotal),
      discount: int(order.discount),
      total: int(order.total),
      down_payment: int(order.downPayment),
      remaining_balance: int(order.remainingBalance),
      payment_method: order.paymentMethod || 'Cash',
      order_status: orderStatus,
      item_count: int(order.itemCount) || (order.items?.length ?? 0),
      items_summary: order.itemsSummary || '',
      promo_code: order.promoCode || '',
      promo_discount: int(order.promoDiscount),
      design_note: order.designNote || '',
      is_shipping: isShipping,
      address: order.address || '',
      deadline,
      designer: hasDesigner ? order.designer!.trim() : null,
      has_jasa_desain: hasDesigner,
      notes: '',
    },
    items: (order.items || []).map(item => ({
      order_id: order.orderId,
      product_id: item.productId ? Number(item.productId) : null,
      product_name: item.name || '',
      quantity: int(item.quantity),
      unit_price: int(item.price),
      subtotal: int(item.subtotal),
      model_code: item.modelCode || '',
      case_variant: item.caseVariant || '',
      lamination: item.lamination || '',
      width: item.width ? Number(item.width) || null : null,
      height: item.height ? Number(item.height) || null : null,
      dimension_text: item.dimensionText || '',
      area: item.area || '',
    })),
    delivery: order.delivery ? {
      order_id: order.orderId,
      recipient_name: order.delivery.recipientName || '',
      recipient_phone: order.delivery.recipientPhone || '',
      address: order.delivery.address || '',
      ongkir: Number(order.delivery.shippingCost) || 0,
      delivery_status: order.delivery.status || 'pending',
    } : null,
  };
}

// ============================================================
// Step 4: Insert into Supabase in batches
// ============================================================

async function migrateOrders(orders: GSheetOrder[], existingIds: Set<string>) {
  // Filter out orders that already exist in Supabase
  const newOrders = orders.filter(o => !existingIds.has(o.orderId));
  console.log(`\n📦 Migrating ${newOrders.length} new orders (${orders.length - newOrders.length} already exist)`);

  if (newOrders.length === 0) {
    console.log('✅ No new orders to migrate!');
    return { migrated: 0, failed: 0 };
  }

  let migrated = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < newOrders.length; i += BATCH_SIZE) {
    const batch = newOrders.slice(i, i + BATCH_SIZE);
    const transformed = batch.map(transformOrder);

    // 1. Insert orders
    const orderRows = transformed.map(t => t.order);
    const { error: orderError } = await supabase
      .from('orders')
      .insert(orderRows);

    if (orderError) {
      console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} orders insert failed:`, orderError.message);

      // Try one-by-one fallback for this batch
      for (const t of transformed) {
        const { error: singleError } = await supabase
          .from('orders')
          .insert(t.order);

        if (singleError) {
          // Skip duplicates silently (23505 = unique_violation)
          if (singleError.code === '23505') {
            continue;
          }
          console.error(`   ❌ Order ${t.order.order_id}: ${singleError.message}`);
          failed++;
          continue;
        }

        // Insert items
        if (t.items.length > 0) {
          const { error: itemErr } = await supabase
            .from('order_items')
            .insert(t.items);
          if (itemErr) console.warn(`   ⚠️ Items for ${t.order.order_id}: ${itemErr.message}`);
        }

        // Insert delivery
        if (t.delivery) {
          const { error: delErr } = await supabase
            .from('order_deliveries')
            .insert(t.delivery);
          if (delErr) console.warn(`   ⚠️ Delivery for ${t.order.order_id}: ${delErr.message}`);
        }
        migrated++;
      }
      continue;
    }

    // 2. Insert all items for this batch
    const allItems = transformed.flatMap(t => t.items);
    if (allItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(allItems);
      if (itemsError) {
        console.warn(`   ⚠️ Batch items insert failed: ${itemsError.message}`);
      }
    }

    // 3. Insert all deliveries for this batch
    const allDeliveries = transformed.map(t => t.delivery).filter(Boolean);
    if (allDeliveries.length > 0) {
      const { error: delError } = await supabase
        .from('order_deliveries')
        .insert(allDeliveries);
      if (delError) {
        console.warn(`   ⚠️ Batch deliveries insert failed: ${delError.message}`);
      }
    }

    migrated += batch.length;
    console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} orders migrated (${migrated}/${newOrders.length})`);
  }

  return { migrated, failed };
}

// ============================================================
// Step 5: Verify migration
// ============================================================

async function verify() {
  console.log('\n🔎 Verifying migration...');

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: itemCount } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true });

  const { count: deliveryCount } = await supabase
    .from('order_deliveries')
    .select('*', { count: 'exact', head: true });

  const { count: migratedCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('channel', 'migrated');

  console.log(`   Orders:     ${orderCount} total (${migratedCount} migrated)`);
  console.log(`   Items:      ${itemCount}`);
  console.log(`   Deliveries: ${deliveryCount}`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Google Sheets → Supabase Migration');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Step 0: Authenticate (required for RLS-gated tables)
    await ensureAuthenticated();

    // Step 1: Fetch all orders from Google Sheets
    const orders = await fetchAllOrdersFromSheets();
    console.log(`✅ Fetched ${orders.length} orders from Google Sheets\n`);

    if (orders.length === 0) {
      console.log('⚠️ No orders found in Google Sheets. Nothing to migrate.');
      return;
    }

    // Step 2: Check existing orders in Supabase
    const existingIds = await getExistingOrderIds();

    // Step 3-4: Transform and insert
    const { migrated, failed } = await migrateOrders(orders, existingIds);

    // Step 5: Verify
    await verify();

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  Migration Complete: ${migrated} migrated, ${failed} failed`);
    console.log('═══════════════════════════════════════════════════\n');

    if (failed > 0) {
      console.log('⚠️ Some orders failed to migrate. Check errors above.');
      console.log('   You can safely re-run this script — it skips existing orders.\n');
    } else {
      console.log('✅ All orders migrated successfully!\n');
      console.log('Next steps:');
      console.log('  1. Verify data in Supabase dashboard');
      console.log('  2. Run: npx tsx scripts/post-migration-cleanup.ts');
      console.log('     (removes the Sheets fallback from the frontend code)\n');
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

main();
