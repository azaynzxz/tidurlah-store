/**
 * Generates supabase/seed.sql from products.json and constants/index.ts promo codes.
 * 
 * Usage: node supabase/generate-seed.js > supabase/seed.sql
 * Or:    node supabase/generate-seed.js
 *        (writes to supabase/seed.sql automatically)
 */

const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'public', 'products.json');
const outputPath = path.join(__dirname, 'seed.sql');

const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function toJSONB(val) {
  if (!val || (Array.isArray(val) && val.length === 0)) return "'[]'::jsonb";
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'::jsonb";
}

function toTextArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  return "ARRAY[" + arr.map(s => escapeSQL(s)).join(', ') + "]::text[]";
}

let sortOrder = 0;
const lines = [];

lines.push('-- ============================================================');
lines.push('-- Seed Data: Products + Promo Codes');
lines.push('-- Auto-generated from products.json and constants/index.ts');
lines.push('-- Run: node supabase/generate-seed.js');
lines.push('-- ============================================================');
lines.push('');
lines.push('-- Clear existing seed data (idempotent)');
lines.push('truncate public.products cascade;');
lines.push('truncate public.promo_codes cascade;');
lines.push('');
lines.push('-- ============================================================');
lines.push('-- Products');
lines.push('-- ============================================================');

const categories = Object.keys(productsData);
for (const category of categories) {
  const products = productsData[category];
  lines.push('');
  lines.push(`-- ${category}`);

  for (const p of products) {
    sortOrder++;
    const cols = [
      'id', 'name', 'slug', 'image', 'additional_images', 'description',
      'price', 'discount_price', 'category', 'price_thresholds', 'time',
      'rating', 'bestseller', 'unit', 'is_available',
      'pricing_method', 'base_price_per_sqm', 'min_width', 'max_width',
      'min_height', 'max_height',
      'models', 'lamination_options', 'is_customizable', 'sort_order'
    ];

    // Generate slug from name
    const slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const vals = [
      p.id,
      escapeSQL(p.name),
      escapeSQL(slug),
      escapeSQL(p.image),
      toTextArray(p.additionalImages),
      escapeSQL(p.description),
      p.price,
      p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : 'NULL',
      escapeSQL(p.category),
      toJSONB(p.priceThresholds),
      escapeSQL(p.time),
      p.rating || 5.0,
      p.bestseller ? 'true' : 'false',
      escapeSQL(p.unit || 'pcs'),
      p.is_available !== false ? 'true' : 'false',
      p.pricingMethod ? escapeSQL(p.pricingMethod) : 'NULL',
      p.basePricePerSqm || 'NULL',
      p.minWidth || 'NULL',
      p.maxWidth || 'NULL',
      p.minHeight || 'NULL',
      p.maxHeight || 'NULL',
      toJSONB(p.models),
      toJSONB(p.laminationOptions),
      p.isCustomizable ? 'true' : 'false',
      sortOrder
    ];

    lines.push(`insert into public.products (${cols.join(', ')})`);
    lines.push(`values (${vals.join(', ')});`);
  }
}

lines.push('');
lines.push('-- ============================================================');
lines.push('-- Promo Codes (from constants/index.ts)');
lines.push('-- ============================================================');

const promoCodes = [
  {
    code: 'DISCOUNT10',
    description: 'Diskon 10% untuk semua produk',
    type: 'percentage',
    discount_percent: 10,
    product_ids: null,
    min_quantity: null,
    override_prices: null,
  },
  {
    code: 'SAVE15',
    description: 'Diskon 15% untuk semua produk',
    type: 'percentage',
    discount_percent: 15,
    product_ids: null,
    min_quantity: null,
    override_prices: null,
  },
  {
    code: 'PROMO20',
    description: 'Diskon 20% untuk semua produk',
    type: 'percentage',
    discount_percent: 20,
    product_ids: null,
    min_quantity: null,
    override_prices: null,
  },
  {
    code: 'KKN15',
    description: 'Diskon 15% untuk Paket IDC LYD 2S (min 7 pcs)',
    type: 'percentage',
    discount_percent: 15,
    product_ids: [8],
    min_quantity: 7,
    override_prices: null,
  },
  {
    code: 'IDCARD15',
    description: 'Diskon 15% untuk ID Card 2S',
    type: 'percentage',
    discount_percent: 15,
    product_ids: [2],
    min_quantity: null,
    override_prices: null,
  },
  {
    code: 'HUT3TH',
    description: 'Promo ulang tahun 3 tahun! Harga spesial untuk IDC LYD',
    type: 'override',
    discount_percent: 0,
    product_ids: [8, 7],
    min_quantity: null,
    override_prices: { "8": 15000, "7": 13000 },
  },
];

for (const pc of promoCodes) {
  lines.push(`insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)`);
  lines.push(`values (${escapeSQL(pc.code)}, ${escapeSQL(pc.description)}, ${escapeSQL(pc.type)}, ${pc.discount_percent}, ${pc.product_ids ? "'" + JSON.stringify(pc.product_ids) + "'::jsonb" : 'NULL'}, ${pc.min_quantity || 'NULL'}, ${pc.override_prices ? "'" + JSON.stringify(pc.override_prices) + "'::jsonb" : 'NULL'}, true);`);
}

lines.push('');
lines.push('-- Seed complete');

const output = lines.join('\n') + '\n';

if (process.argv.includes('--stdout')) {
  process.stdout.write(output);
} else {
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`✅ Seed file written to ${outputPath}`);
  console.log(`   Products: ${sortOrder}`);
  console.log(`   Promo codes: ${promoCodes.length}`);
}
