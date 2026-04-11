-- ============================================================
-- Migration 002: Products & Promo Codes
-- ============================================================
-- Products table mirrors the existing products.json structure.
-- Promo codes replace the hardcoded map in constants/index.ts.
-- ============================================================

-- Products table
create table if not exists public.products (
  id integer primary key,
  name text not null,
  slug text unique not null,
  image text not null default '',
  additional_images text[] not null default '{}',
  description text not null default '',
  price integer not null default 0,
  discount_price integer,
  category text not null,
  price_thresholds jsonb default '[]',
  time text not null default '2-3 hari',
  rating numeric(2,1) not null default 5.0,
  bestseller boolean not null default false,
  unit text not null default 'pcs',
  is_available boolean not null default true,

  -- Dimensional pricing (banners)
  pricing_method text check (pricing_method in ('dimensional', null)),
  base_price_per_sqm integer,
  min_width numeric,
  max_width numeric,
  min_height numeric,
  max_height numeric,

  -- Variants
  models jsonb default '[]',
  lamination_options jsonb default '[]',
  is_customizable boolean not null default false,

  -- Ordering & management
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Product catalog. Replaces static products.json. Admin-editable.';

-- Indexes
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_active on public.products(is_active) where is_active = true;
create index if not exists idx_products_sort on public.products(category, sort_order);

-- Updated_at trigger
create trigger products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

-- ============================================================
-- Promo Codes table
-- ============================================================
create table if not exists public.promo_codes (
  id serial primary key,
  code text unique not null,
  description text not null default '',
  type text not null default 'percentage' check (type in ('percentage', 'override')),
  discount_percent numeric not null default 0,
  product_ids jsonb,
  min_quantity integer,
  override_prices jsonb,
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses integer,
  current_uses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.promo_codes is 'Promotional codes with percentage discounts or price overrides. Replaces hardcoded map in constants/index.ts.';

create index if not exists idx_promo_codes_code on public.promo_codes(code) where is_active = true;

create trigger promo_codes_updated_at
  before update on public.promo_codes
  for each row execute function public.update_updated_at();

-- ============================================================
-- RLS Policies for products
-- ============================================================
alter table public.products enable row level security;

-- Anyone can read active products
create policy "Public can read active products"
  on public.products for select
  using (is_active = true);

-- Admins/cashiers can read all products (including inactive)
create policy "Staff can read all products"
  on public.products for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Only admins can insert/update/delete products
create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- RLS Policies for promo_codes
-- ============================================================
alter table public.promo_codes enable row level security;

-- Anyone can read active promo codes within valid date range
create policy "Public can read active promos"
  on public.promo_codes for select
  using (
    is_active = true
    and (valid_from is null or now() >= valid_from)
    and (valid_until is null or now() <= valid_until)
  );

-- Admins can manage all promo codes
create policy "Admins can manage promos"
  on public.promo_codes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
