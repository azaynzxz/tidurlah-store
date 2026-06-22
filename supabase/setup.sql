-- ============================================================
-- Migration 001: Profiles & Authentication
-- ============================================================
-- Creates the profiles table extending Supabase auth.users,
-- plus an auto-create trigger for new signups.
-- ============================================================

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'cashier' check (role in ('admin', 'cashier')),
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles extending Supabase auth. Stores role (admin/cashier) and display name.';

-- Index for role-based queries
create index if not exists idx_profiles_role on public.profiles(role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'cashier')
  );
  return new;
end;
$$;

-- Trigger: create profile after auth signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sync metadata changes (role, full_name) back to profiles on UPDATE
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    email = new.email,
    full_name = coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    role = coalesce(new.raw_user_meta_data ->> 'role', old.raw_user_meta_data ->> 'role', 'cashier')
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_user_updated();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- RLS Policies for profiles
-- ============================================================
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can read all profiles (uses JWT claim to avoid recursion)
create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Users can update their own profile (name, avatar only)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
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
-- ============================================================
-- Migration 003: Orders System (Normalized)
-- ============================================================
-- Maps directly to the existing Google Sheets structure:
--   Orders      → orders
--   Order_Items → order_items
--   Deliveries  → order_deliveries
--   Trash       → soft-delete via deleted_at column (no separate table)
--   Jasa_Desain → designer column on orders (no separate table)
-- ============================================================

-- Invoice number sequence (atomic, collision-free)
create sequence if not exists public.invoice_seq start with 1 increment by 1;

-- Generate invoice number: INV-YYMMDD-XXXXX
create or replace function public.generate_invoice_number()
returns text
language plpgsql
as $$
declare
  seq_val bigint;
  date_part text;
begin
  seq_val := nextval('public.invoice_seq');
  date_part := to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD');
  return 'INV-' || date_part || '-' || lpad(seq_val::text, 5, '0');
end;
$$;

-- ============================================================
-- Orders table (mirrors Google Sheets "Orders" — 22 columns)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  invoice_number text unique,
  "timestamp" timestamptz not null default now(),
  channel text not null default 'pos' check (channel in ('pos', 'website', 'migrated')),
  cashier text not null default '',
  cashier_user_id uuid references public.profiles(id),
  customer_name text not null default '',
  customer_phone text not null default '',
  institution text not null default '',
  subtotal integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  down_payment integer not null default 0,
  remaining_balance integer not null default 0,
  payment_method text not null default 'Cash',
  order_status text not null default 'pending'
    check (order_status in ('pending', 'partial', 'done', 'cancelled')),
  item_count integer not null default 0,
  items_summary text not null default '',
  promo_code text not null default '',
  promo_discount integer not null default 0,
  design_note text not null default '',
  is_shipping boolean not null default false,
  address text not null default '',
  deadline timestamptz,
  cabang text,

  -- Designer assignment (replaces Jasa_Desain sheet)
  designer text,
  has_jasa_desain boolean not null default false,

  -- Admin-editable notes (replaces manual spreadsheet cell editing)
  notes text not null default '',

  -- Soft-delete (replaces Trash sheet)
  deleted_at timestamptz,
  deleted_by text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Unified orders table for both website and POS. Replaces Google Sheets Orders + Trash + Jasa_Desain.';

-- Performance indexes
create index if not exists idx_orders_timestamp on public.orders("timestamp" desc);
create index if not exists idx_orders_status on public.orders(order_status) where deleted_at is null;
create index if not exists idx_orders_channel on public.orders(channel) where deleted_at is null;
create index if not exists idx_orders_customer_phone on public.orders(customer_phone) where deleted_at is null;
create index if not exists idx_orders_order_id on public.orders(order_id);
create index if not exists idx_orders_deleted on public.orders(deleted_at) where deleted_at is not null;
create index if not exists idx_orders_deadline on public.orders(deadline) where deadline is not null and deleted_at is null;
create index if not exists idx_orders_designer on public.orders(designer) where has_jasa_desain = true and deleted_at is null;

-- Composite index for the most common admin query (recent non-deleted orders)
create index if not exists idx_orders_active_recent
  on public.orders("timestamp" desc)
  where deleted_at is null;

-- Updated_at trigger
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

-- ============================================================
-- Order Items table (mirrors Google Sheets "Order_Items" — 13 columns)
-- ============================================================
create table if not exists public.order_items (
  id serial primary key,
  order_id text not null references public.orders(order_id) on delete cascade,
  product_id integer,
  product_name text not null default '',
  quantity integer not null default 0,
  unit_price integer not null default 0,
  subtotal integer not null default 0,
  model_code text not null default '',
  case_variant text not null default '',
  lamination text not null default '',
  width numeric,
  height numeric,
  dimension_text text not null default '',
  area text not null default ''
);

comment on table public.order_items is 'Line items per order. One row per product per order. Replaces Google Sheets Order_Items.';

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id) where product_id is not null;

-- ============================================================
-- Order Deliveries table (mirrors Google Sheets "Deliveries" — 6 columns)
-- ============================================================
create table if not exists public.order_deliveries (
  id serial primary key,
  order_id text unique not null references public.orders(order_id) on delete cascade,
  recipient_name text not null default '',
  recipient_phone text not null default '',
  address text not null default '',
  ongkir integer not null default 0,
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'shipped', 'delivered'))
);

comment on table public.order_deliveries is 'Delivery details for orders with shipping. Replaces Google Sheets Deliveries.';

create index if not exists idx_order_deliveries_order_id on public.order_deliveries(order_id);

-- ============================================================
-- Database functions for common operations
-- ============================================================

-- Get paginated orders with items and delivery joined
-- This replaces the Apps Script getRecentOrders() which reads ALL rows
create or replace function public.get_orders(
  p_limit integer default 50,
  p_offset integer default 0,
  p_channel text default null,
  p_status text default null,
  p_cashier text default null,
  p_search text default null,
  p_include_deleted boolean default false,
  p_deleted_only boolean default false
)
returns json
language plpgsql
stable
as $$
declare
  result json;
  total_count bigint;
begin
  -- Count total matching rows
  select count(*) into total_count
  from public.orders o
  where
    (p_deleted_only and o.deleted_at is not null)
    or (not p_deleted_only and (p_include_deleted or o.deleted_at is null))
  and (p_channel is null or o.channel = p_channel)
  and (p_status is null or o.order_status = p_status)
  and (p_cashier is null or o.cashier = p_cashier)
  and (p_search is null or (
    o.customer_name ilike '%' || p_search || '%'
    or o.customer_phone ilike '%' || p_search || '%'
    or o.order_id ilike '%' || p_search || '%'
  ));

  -- Fetch orders with joined items and delivery
  select json_build_object(
    'success', true,
    'orders', coalesce((
      select json_agg(order_row order by order_row->>'timestamp' desc)
      from (
        select json_build_object(
          'orderId', o.order_id,
          'timestamp', o."timestamp",
          'channel', o.channel,
          'cashier', o.cashier,
          'customerName', o.customer_name,
          'customerPhone', o.customer_phone,
          'institution', o.institution,
          'subtotal', o.subtotal,
          'discount', o.discount,
          'total', o.total,
          'downPayment', o.down_payment,
          'remainingBalance', o.remaining_balance,
          'paymentMethod', o.payment_method,
          'orderStatus', case when o.deleted_at is not null then 'deleted' else o.order_status end,
          'itemCount', o.item_count,
          'itemsSummary', o.items_summary,
          'promoCode', o.promo_code,
          'promoDiscount', o.promo_discount,
          'designNote', o.design_note,
          'isShipping', o.is_shipping,
          'address', o.address,
          'deadline', o.deadline,
          'designer', o.designer,
          'notes', o.notes,
          'cabang', o.cabang,
          'items', coalesce((
            select json_agg(json_build_object(
              'productId', oi.product_id,
              'name', oi.product_name,
              'quantity', oi.quantity,
              'price', oi.unit_price,
              'subtotal', oi.subtotal,
              'modelCode', oi.model_code,
              'caseVariant', oi.case_variant,
              'lamination', oi.lamination,
              'width', oi.width,
              'height', oi.height,
              'dimensionText', oi.dimension_text,
              'area', oi.area
            ))
            from public.order_items oi
            where oi.order_id = o.order_id
          ), '[]'::json),
          'delivery', (
            select json_build_object(
              'recipientName', od.recipient_name,
              'recipientPhone', od.recipient_phone,
              'address', od.address,
              'shippingCost', od.ongkir,
              'status', od.delivery_status
            )
            from public.order_deliveries od
            where od.order_id = o.order_id
          )
        ) as order_row
        from public.orders o
        where
          (p_deleted_only and o.deleted_at is not null)
          or (not p_deleted_only and (p_include_deleted or o.deleted_at is null))
        and (p_channel is null or o.channel = p_channel)
        and (p_status is null or o.order_status = p_status)
        and (p_cashier is null or o.cashier = p_cashier)
        and (p_search is null or (
          o.customer_name ilike '%' || p_search || '%'
          or o.customer_phone ilike '%' || p_search || '%'
          or o.order_id ilike '%' || p_search || '%'
        ))
        order by o."timestamp" desc
        limit p_limit
        offset p_offset
      ) sub
    ), '[]'::json),
    'total', total_count
  ) into result;

  return result;
end;
$$;

-- Dashboard KPI function (replaces getDashboardData in Apps Script)
create or replace function public.get_dashboard_data()
returns json
language plpgsql
stable
as $$
declare
  result json;
  now_jkt timestamptz := now() at time zone 'Asia/Jakarta';
  today_start timestamptz := date_trunc('day', now_jkt);
  week_start timestamptz := date_trunc('week', now_jkt);
  month_start timestamptz := date_trunc('month', now_jkt);
begin
  select json_build_object(
    'success', true,
    'today', (
      select json_build_object('orders', count(*), 'revenue', coalesce(sum(total), 0))
      from public.orders
      where "timestamp" >= today_start and deleted_at is null
    ),
    'thisWeek', (
      select json_build_object('orders', count(*), 'revenue', coalesce(sum(total), 0))
      from public.orders
      where "timestamp" >= week_start and deleted_at is null
    ),
    'thisMonth', (
      select json_build_object('orders', count(*), 'revenue', coalesce(sum(total), 0))
      from public.orders
      where "timestamp" >= month_start and deleted_at is null
    ),
    'allTime', (
      select json_build_object('orders', count(*), 'revenue', coalesce(sum(total), 0))
      from public.orders
      where deleted_at is null
    )
  ) into result;

  return result;
end;
$$;

-- Monthly report function (replaces getMonthlyReport in Apps Script)
create or replace function public.get_monthly_report(
  p_month integer,
  p_year integer
)
returns json
language plpgsql
stable
as $$
declare
  result json;
  start_date date := make_date(p_year, p_month, 1);
  end_date date := (make_date(p_year, p_month, 1) + interval '1 month')::date;
begin
  select json_build_object(
    'success', true,
    'month', p_month,
    'year', p_year,
    'totals', (
      select json_build_object(
        'orders', count(*),
        'revenue', coalesce(sum(total), 0),
        'avgOrderValue', case when count(*) > 0
          then round(coalesce(sum(total), 0)::numeric / count(*))
          else 0
        end
      )
      from public.orders
      where "timestamp" >= start_date
        and "timestamp" < end_date
        and deleted_at is null
    ),
    'dailyBreakdown', coalesce((
      select json_agg(daily order by daily->>'day')
      from (
        select json_build_object(
          'day', extract(day from "timestamp"),
          'orders', count(*),
          'revenue', coalesce(sum(total), 0)
        ) as daily
        from public.orders
        where "timestamp" >= start_date
          and "timestamp" < end_date
          and deleted_at is null
        group by extract(day from "timestamp")
      ) d
    ), '[]'::json),
    'topProducts', coalesce((
      select json_agg(prod order by (prod->>'revenue')::integer desc)
      from (
        select json_build_object(
          'name', oi.product_name,
          'quantity', sum(oi.quantity),
          'revenue', sum(oi.subtotal)
        ) as prod
        from public.order_items oi
        join public.orders o on o.order_id = oi.order_id
        where o."timestamp" >= start_date
          and o."timestamp" < end_date
          and o.deleted_at is null
        group by oi.product_name
        order by sum(oi.subtotal) desc
        limit 20
      ) p
    ), '[]'::json),
    'byCashier', coalesce((
      select json_agg(c order by (c->>'revenue')::integer desc)
      from (
        select json_build_object(
          'cashier', cashier,
          'orders', count(*),
          'revenue', coalesce(sum(total), 0)
        ) as c
        from public.orders
        where "timestamp" >= start_date
          and "timestamp" < end_date
          and deleted_at is null
        group by cashier
      ) cs
    ), '[]'::json)
  ) into result;

  return result;
end;
$$;

-- ============================================================
-- RLS Policies for orders
-- ============================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_deliveries enable row level security;

-- Public can insert orders (website checkout)
create policy "Public can insert orders"
  on public.orders for insert
  with check (true);

create policy "Public can insert order items"
  on public.order_items for insert
  with check (true);

create policy "Public can insert deliveries"
  on public.order_deliveries for insert
  with check (true);

-- Staff can read all orders
create policy "Staff can read orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

create policy "Staff can read order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

create policy "Staff can read deliveries"
  on public.order_deliveries for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can update orders (status, notes, designer, soft-delete)
create policy "Staff can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can delete order items (for edit-via-replace flow)
create policy "Staff can delete order items"
  on public.order_items for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can update deliveries
create policy "Staff can update deliveries"
  on public.order_deliveries for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can delete deliveries (for edit-via-replace flow)
create policy "Staff can delete deliveries"
  on public.order_deliveries for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Admins can hard-delete orders if needed
create policy "Admins can delete orders"
  on public.orders for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Enable Realtime for orders (POS notifications)
-- ============================================================
alter publication supabase_realtime add table public.orders;
-- ============================================================
-- Migration 004: Applications & Survey
-- ============================================================
-- Replaces Google Sheets job application form (submitJobApplication)
-- and future survey submissions.
-- ============================================================

-- Job Applications table
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  position text not null,
  portfolio_url text,
  motivation text not null,
  experience text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'accepted', 'rejected')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.job_applications is 'Job applications from /loker page. Replaces Google Sheets Loker form.';

create index if not exists idx_job_applications_status on public.job_applications(status);
create index if not exists idx_job_applications_created on public.job_applications(created_at desc);

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.update_updated_at();

-- Survey Responses table
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_type text not null default 'general',
  respondent_name text,
  respondent_email text,
  responses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.survey_responses is 'Survey responses from /survey page. Stores dynamic form data as JSONB.';

create index if not exists idx_survey_responses_type on public.survey_responses(survey_type);
create index if not exists idx_survey_responses_created on public.survey_responses(created_at desc);

-- ============================================================
-- RLS Policies
-- ============================================================
alter table public.job_applications enable row level security;
alter table public.survey_responses enable row level security;

-- Public can submit applications
create policy "Public can submit applications"
  on public.job_applications for insert
  with check (true);

-- Staff can read applications
create policy "Staff can read applications"
  on public.job_applications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Admins can update application status
create policy "Admins can update applications"
  on public.job_applications for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Public can submit surveys
create policy "Public can submit surveys"
  on public.survey_responses for insert
  with check (true);

-- Staff can read surveys
create policy "Staff can read surveys"
  on public.survey_responses for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );
-- ============================================================
-- Migration 005: Alter job_applications to match form fields
-- ============================================================
-- The form collects cv, info_source, address but the original
-- table was created with motivation (NOT NULL) which the form
-- does not collect. This fixes the schema to match the actual form.
-- ============================================================

-- Add missing columns
alter table public.job_applications
  add column if not exists cv_url text,
  add column if not exists info_source text,
  add column if not exists address text;

-- Make motivation nullable (form doesn't collect it)
alter table public.job_applications
  alter column motivation drop not null,
  alter column motivation set default '';

comment on column public.job_applications.cv_url is 'Supabase Storage path for CV file';
comment on column public.job_applications.info_source is 'How applicant found the job listing';
comment on column public.job_applications.address is 'Applicant address';

-- ============================================================
-- Storage Buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict do nothing;

-- Policy: Public can upload to applications bucket
create policy "Public can upload application files"
  on storage.objects for insert
  with check (bucket_id = 'applications');

-- Policy: Staff can read application files
create policy "Staff can read application files"
  on storage.objects for select
  using (
    bucket_id = 'applications'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );
-- ============================================================
-- Seed Data: Products + Promo Codes
-- Auto-generated from products.json and constants/index.ts
-- Run: node supabase/generate-seed.js
-- ============================================================

-- Clear existing seed data (idempotent)
truncate public.products cascade;
truncate public.promo_codes cascade;

-- ============================================================
-- Products
-- ============================================================

-- ID Card & Lanyard
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (8, 'Paket IDC LYD 2S', 'paket-idc-lyd-2s', '/product-image/paket-idc-2s.webp', '{}', 'Paket lengkap dengan ID card dua sisi dan lanyard yang sesuai.', 25000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":25000},{"minQuantity":4,"price":23000},{"minQuantity":25,"price":20000},{"minQuantity":100,"price":17000}]'::jsonb, '2-3 hari', 4.9, true, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 1);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (9, 'Paket IDC LYD Kulit', 'paket-idc-lyd-kulit', '/product-image/paket-idc-case-kulit.webp', ARRAY['/product-image/case-kulit.webp']::text[], 'Paket premium dengan ID card, case kulit, dan lanyard yang sesuai.', 30000, 28000, 'ID Card & Lanyard', '[{"minQuantity":1,"price":28000},{"minQuantity":4,"price":27000},{"minQuantity":25,"price":26500},{"minQuantity":100,"price":25000}]'::jsonb, '3-4 hari', 5, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 2);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (10, 'Paket IDC LYD Premium', 'paket-idc-lyd-premium', '/product-image/paket-idc-lyd-premium.webp', ARRAY['/product-image/case-premium.webp']::text[], 'Paket deluxe dengan ID card dua sisi, case premium, dan lanyard custom.', 30000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":30000},{"minQuantity":4,"price":28000},{"minQuantity":25,"price":26000},{"minQuantity":100,"price":24000}]'::jsonb, '3-5 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 3);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (7, 'Paket IDC LYD 1S', 'paket-idc-lyd-1s', '/product-image/paket-idc-1s.webp', '{}', 'Paket lengkap dengan ID card satu sisi dan lanyard yang sesuai.', 20000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":20000},{"minQuantity":4,"price":18000},{"minQuantity":25,"price":16000},{"minQuantity":100,"price":14000}]'::jsonb, '2-3 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 4);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (3, 'IDC Tali & Case Kulit', 'idc-tali-case-kulit', '/product-image/case-tali-kulit.webp', ARRAY['/product-image/case-kulit.webp']::text[], 'ID card premium dengan case kulit dan tali lanyard.', 30000, 28000, 'ID Card & Lanyard', '[{"minQuantity":1,"price":28000},{"minQuantity":4,"price":27000},{"minQuantity":25,"price":26500},{"minQuantity":100,"price":25000}]'::jsonb, '3-5 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 5);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (2, 'ID Card 2S', 'id-card-2s', '/product-image/ID Card 2S.webp', ARRAY['/product-image/Case-ID Card.webp']::text[], 'ID card dua sisi dengan bahan premium berkualitas.', 10000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":10000},{"minQuantity":4,"price":9000},{"minQuantity":25,"price":8000},{"minQuantity":100,"price":7000}]'::jsonb, '2-3 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 6);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1, 'ID Card 1S', 'id-card-1s', '/product-image/ID Card 1S.webp', ARRAY['/product-image/Case-ID Card.webp']::text[], 'ID card satu sisi dengan bahan premium berkualitas.', 9000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":9000},{"minQuantity":4,"price":8000},{"minQuantity":25,"price":7000},{"minQuantity":100,"price":6000}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 7);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (4, 'Lanyard Saja 1S', 'lanyard-saja-1s', '/product-image/lanyard-only-1S.webp', ARRAY['/product-image/lanyard-only-1S-2.webp']::text[], 'Lanyard cetak satu sisi tanpa ID card atau case.', 15000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":15000},{"minQuantity":4,"price":13000},{"minQuantity":25,"price":12000},{"minQuantity":100,"price":10000}]'::jsonb, '1-2 hari', 4.6, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 8);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (5, 'Lanyard Saja 2S', 'lanyard-saja-2s', '/product-image/lanyard-only-2S.webp', ARRAY['/product-image/lanyard-only-2S-2.webp']::text[], 'Lanyard cetak dua sisi tanpa ID card atau case.', 17000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":17000},{"minQuantity":4,"price":16000},{"minQuantity":25,"price":15000},{"minQuantity":100,"price":13000}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 9);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (6, 'IDC Tali Biasa', 'idc-tali-biasa', '/product-image/IDC Tali Biasa.webp', ARRAY['/product-image/case-biasa.webp']::text[], 'ID card standar dengan lanyard biasa.', 13000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":13000},{"minQuantity":4,"price":12000},{"minQuantity":25,"price":10000},{"minQuantity":100,"price":8000}]'::jsonb, '1-2 hari', 4.5, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 10);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (24, 'IDC Lanyard tali Hitam Polos', 'idc-lanyard-tali-hitam-polos', '/product-image/IDC-Tali Hitam.webp', '{}', 'ID card dengan lanyard tali hitam polos, praktis dan elegan.', 14000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":14000},{"minQuantity":50,"price":13000}]'::jsonb, '1-2 hari', 4.6, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 11);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (25, 'IDC B4 Lanyard Hitam Polos', 'idc-b4-lanyard-hitam-polos', '/product-image/IDC B4 Lanyard Hitam Polos.webp', '{}', 'ID Card kertas dengan ukuran B4 (15.5 × 16.6 cm), tali hitam polos', 7000, 5000, 'ID Card & Lanyard', '[{"minQuantity":1,"price":5000}]'::jsonb, '1-2 hari', 4.5, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 12);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (26, 'ID Card Yoyo (Tanpa Stiker)', 'id-card-yoyo-tanpa-stiker', '/product-image/New Product/IDC-YOYO-REG.webp', '{}', 'ID card yoyo praktis. Ready stok berbagai warna.', 20000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":20000},{"minQuantity":10,"price":15000}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 13);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (27, 'Stiker ID Card Yoyo Saja', 'stiker-id-card-yoyo-saja', '/product-image/New Product/IDC-YOYO-REG-STIKER.webp', ARRAY['/product-image/New Product/IDC-YOYO-PREM-AK-STIKER.webp', '/product-image/New Product/IDC-YOYO-PREM-SEMI-STIKER.webp']::text[], 'ID card yoyo custom dengan stiker logo Anda.', 10000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":10000}]'::jsonb, '2-3 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 14);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (28, 'ID Card Yoyo Premium Akrilik (Tanpa Stiker)', 'id-card-yoyo-premium-akrilik-tanpa-stiker', '/product-image/New Product/IDC-YOYO-PREM-AK.webp', '{}', 'Yoyo dengan case premium akrilik transparan.', 28000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":28000},{"minQuantity":10,"price":25000}]'::jsonb, '2-3 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 15);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (30, 'ID Card Yoyo Premium Semi Transparan (Tanpa Stiker)', 'id-card-yoyo-premium-semi-transparan-tanpa-stiker', '/product-image/New Product/IDC-YOYO-PREM-SEMI.webp', '{}', 'Yoyo premium dengan case semi transparan warna biru.', 25000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":25000},{"minQuantity":10,"price":23000}]'::jsonb, '2-3 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 16);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (34, 'Que Card', 'que-card', '/product-image/que-card.webp', '{}', 'Que Card dengan ukuran A5 ISO (14.8 x 21.0 cm), kualitas premium.', 15000, NULL, 'ID Card & Lanyard', '[{"minQuantity":1,"price":15000}]'::jsonb, '2-3 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 17);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (2200, 'Casing ID Card', 'casing-id-card', '/product-image/case-variant/case-reguler-color (black, white, semi transparent putih susu, ble, green, red, transparent).jpg', ARRAY['/product-image/case-variant/Case Bening.jpg', '/product-image/case-variant/case-leather kulit.jpg']::text[], 'Casing ID Card tersedia dalam berbagai jenis: Case Reguler Colorful, Case Bening Reguler, Case Putih Susu, Case Premium Bening, dan Case Kulit premium.', 2000, NULL, 'ID Card & Lanyard', '[]'::jsonb, 'Ready stock', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[{"code":"Case Reg Merah","image":"/product-image/case-variant/case-reguler-color (black, white, semi transparent putih susu, ble, green, red, transparent).jpg","price":2000},{"code":"Case Reg Hijau","image":"/product-image/case-variant/case-reguler-color (black, white, semi transparent putih susu, ble, green, red, transparent).jpg","price":2000},{"code":"Case Reg Biru","image":"/product-image/case-variant/case-reguler-color (black, white, semi transparent putih susu, ble, green, red, transparent).jpg","price":2000},{"code":"Case Reg Putih","image":"/product-image/case-variant/case-reguler-color (black, white, semi transparent putih susu, ble, green, red, transparent).jpg","price":2000},{"code":"Case Reg Kuning","image":"/product-image/case-variant/case-reguler-color (black, white, semi transparent putih susu, ble, green, red, transparent).jpg","price":2000},{"code":"Case Bening Reg","image":"/product-image/case-variant/Case Bening reg.jfif","price":2000},{"code":"Case Putih Susu","image":"/product-image/case-variant/Case Putih Susu.jfif","price":2000},{"code":"Case Premium","image":"/product-image/case-variant/Case Bening.jpg","price":7000},{"code":"Case Kulit","image":"/product-image/case-variant/case-leather kulit.jpg","price":5000}]'::jsonb, '[]'::jsonb, false, 18);

-- Media Promosi
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (11, 'Banner Indoor/Outdoor', 'banner-indooroutdoor', '/product-image/Banner 1.webp', ARRAY['/product-image/Banner 2.webp']::text[], 'Banner custom cetak untuk acara dan promosi.', 18000, NULL, 'Media Promosi', '[{"minQuantity":1,"price":18000},{"minQuantity":4,"price":18000},{"minQuantity":25,"price":17000},{"minQuantity":100,"price":16000}]'::jsonb, '3-5 hari', 4.8, false, 'm²', true, 'dimensional', 18000, 0.5, 5, 0.5, 10, '[]'::jsonb, '[]'::jsonb, false, 19);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (12, 'X Banner (60x160)', 'x-banner-60x160', '/product-image/X banner 1.webp', ARRAY['/product-image/X banner-2.webp']::text[], 'Stand banner bentuk X dengan banner cetak custom ukuran 60x160cm.', 90000, NULL, 'Media Promosi', '[{"minQuantity":1,"price":90000},{"minQuantity":4,"price":85000},{"minQuantity":25,"price":80000},{"minQuantity":100,"price":75000}]'::jsonb, '2-3 hari', 4.6, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 20);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (13, 'Roll Banner', 'roll-banner', '/product-image/Roll Banner 1.webp', ARRAY['/product-image/Roll Banner 2.webp']::text[], 'Banner gulung portable dengan stand, sempurna untuk acara dan pameran.', 350000, NULL, 'Media Promosi', '[{"minQuantity":1,"price":350000},{"minQuantity":4,"price":170000},{"minQuantity":25,"price":160000},{"minQuantity":100,"price":150000}]'::jsonb, '3-4 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 21);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (14, 'Poster A3', 'poster-a3', '/product-image/Poster 1.webp', ARRAY['/product-image/Poster 2.webp']::text[], 'Poster ukuran A3 dicetak pada kertas berkualitas tinggi.', 25000, NULL, 'Media Promosi', '[{"minQuantity":1,"price":25000},{"minQuantity":4,"price":22000},{"minQuantity":25,"price":20000},{"minQuantity":100,"price":18000}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 22);

-- Merchandise
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (15, 'Cutting Stiker Kontur Chromo', 'cutting-stiker-kontur-chromo', '/product-image/Cut Stiker.webp', ARRAY['/product-image/cut-stiker1.webp']::text[], 'Stiker vinyl potong custom dengan desain Anda.', 15000, NULL, 'Merchandise', '[{"minQuantity":1,"price":15000},{"minQuantity":4,"price":12000},{"minQuantity":25,"price":10000},{"minQuantity":100,"price":8000}]'::jsonb, '1-2 hari', 4.6, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[{"type":"Laminasi Doff","price":0},{"type":"Laminasi Glossy","price":0},{"type":"Tanpa Laminasi","price":0}]'::jsonb, false, 23);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (32, 'Cutting Stiker Vinyl A3+', 'cutting-stiker-vinyl-a3', '/product-image/New Product/STIKER-VYNIL.webp', ARRAY['/product-image/New Product/STIKER-VYNIL-2.webp']::text[], 'Cetak stiker bahan vinyl berkualitas per lembar A3+.', 22000, NULL, 'Merchandise', '[{"minQuantity":1,"price":22000}]'::jsonb, '1-2 hari', 4.8, false, 'lembar', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 24);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (33, 'Cut Stiker Vynil Papan Bunga', 'cut-stiker-vynil-papan-bunga', '/product-image/vynilcut.webp', '{}', 'Jasa cutting stiker untuk papan bunga akrilik, desain dalam format CDR/JPG high resolution. Sudah termasuk Masking. Ukuran A3: 27.7 cm × 42 cm', 15000, NULL, 'Merchandise', '[{"minQuantity":1,"price":15000},{"minQuantity":4,"price":14000},{"minQuantity":25,"price":13000},{"minQuantity":100,"price":12000}]'::jsonb, '1-2 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 25);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (16, 'Ganci Akrilik', 'ganci-akrilik', '/product-image/ganciakrilik-1.webp', ARRAY['/product-image/ganciakrilik-2.webp', '/product-image/ganciakrilik-3.webp']::text[], 'Ganci akrilik custom cetak dengan desain Anda.', 8000, NULL, 'Merchandise', '[{"minQuantity":1,"price":8000},{"minQuantity":4,"price":7000},{"minQuantity":25,"price":6000},{"minQuantity":100,"price":5000}]'::jsonb, '1-2 hari', 4.5, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 26);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (17, 'Ganci 3 cm', 'ganci-3-cm', '/product-image/Ganci-3cm-1.webp', '{}', 'Ganci custom cetak diameter 3 cm.', 3000, NULL, 'Merchandise', '[{"minQuantity":1,"price":3000},{"minQuantity":4,"price":2700},{"minQuantity":25,"price":2500},{"minQuantity":100,"price":2300}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 27);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (18, 'Ganci 5 cm', 'ganci-5-cm', '/product-image/Ganci-5-cm1.webp', '{}', 'Ganci custom cetak diameter 5 cm.', 5000, NULL, 'Merchandise', '[{"minQuantity":1,"price":5000},{"minQuantity":4,"price":4500},{"minQuantity":25,"price":4000},{"minQuantity":100,"price":3000}]'::jsonb, '1 hari', 4.6, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 28);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (19, 'Ganci Tali', 'ganci-tali', '/product-image/ganci-tali.webp', ARRAY['/product-image/ganci-tali-2.webp']::text[], 'Ganci custom cetak dengan tambahan tali.', 4000, NULL, 'Merchandise', '[]'::jsonb, '1-2 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[{"code":"1 Sisi","image":"/product-image/ganci-tali.webp","price":4000},{"code":"2 Sisi","image":"/product-image/ganci-tali.webp","price":5000}]'::jsonb, '[]'::jsonb, false, 29);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (103, 'Pin Kait Peniti 3 cm', 'pin-kait-peniti-3-cm', '/product-image/pin-3cm.webp', '{}', 'Pin kait peniti diameter 3 cm.', 3000, NULL, 'Merchandise', '[{"minQuantity":1,"price":3000}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 30);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (104, 'Pin Kait Peniti 5 cm', 'pin-kait-peniti-5-cm', '/product-image/pin-5cm.webp', '{}', 'Pin kait peniti diameter 5 cm.', 5000, NULL, 'Merchandise', '[{"minQuantity":1,"price":5000}]'::jsonb, '1-2 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 31);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (20, 'Mug Custom', 'mug-custom', '/product-image/Mug 1.webp', ARRAY['/product-image/Mug 2.webp', '/product-image/Mug 3.webp']::text[], 'Mug keramik dengan desain cetak, aman untuk microwave dan mesin pencuci piring.', 28000, NULL, 'Merchandise', '[{"minQuantity":1,"price":28000},{"minQuantity":4,"price":25000},{"minQuantity":25,"price":22000},{"minQuantity":100,"price":19000}]'::jsonb, '3-5 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 32);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (21, 'Tumbler Custom', 'tumbler-custom', '/product-image/Insert Paper 1.webp', ARRAY['/product-image/Insert Paper 2.webp', '/product-image/Insert Paper 3.webp']::text[], 'Tumbler travel custom cetak dengan tutup, cocok untuk minuman panas dan dingin.', 28000, NULL, 'Merchandise', '[{"minQuantity":1,"price":28000},{"minQuantity":2,"price":25000},{"minQuantity":25,"price":23000},{"minQuantity":100,"price":20000}]'::jsonb, '3-5 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 33);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (22, 'Plakat Akrilik Reg', 'plakat-akrilik-reg', '/product-image/plakat/PKA 004.webp', ARRAY['/product-image/plakat-reg-1.webp', '/product-image/plakat-reg-2.webp', '/product-image/plakat-reg-3.webp', '/product-image/plakat/PKA 005.webp', '/product-image/plakat/PKA 006.webp', '/product-image/plakat/PKA 007.webp']::text[], 'Plakat akrilik berkualitas tinggi dengan berbagai pilihan model.', 90000, NULL, 'Merchandise', '[{"minQuantity":1,"price":90000}]'::jsonb, '3-5 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[{"code":"PKA004","image":"/product-image/plakat/PKA 004.jpg"},{"code":"PKA005","image":"/product-image/plakat/PKA 005.jpg"},{"code":"PKA006","image":"/product-image/plakat/PKA 006.jpg"},{"code":"PKA007","image":"/product-image/plakat/PKA 007.jpg"},{"code":"PKA008","image":"/product-image/plakat/PKA 008.jpg"},{"code":"PKA009","image":"/product-image/plakat/PKA 009.jpg"},{"code":"PKA010","image":"/product-image/plakat/PKA 010.jpg"},{"code":"PKA011","image":"/product-image/plakat/PKA 011.jpg"},{"code":"PKA012","image":"/product-image/plakat/PKA 012.jpg"}]'::jsonb, '[]'::jsonb, false, 34);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (2100, 'Plakat Akrilik UV', 'plakat-akrilik-uv', '/product-image/Merch/Plakat-UV/UV-1.webp', ARRAY['/product-image/Merch/Plakat-UV/UV-2.webp', '/product-image/Merch/Plakat-UV/UV-3.webp']::text[], 'Plakat Akrilik UV berkualitas tinggi dengan berbagai pilihan ketebalan. Sudah termasuk box bludru.', 125000, NULL, 'Merchandise', '[]'::jsonb, '3-5 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[{"code":"3 mm","image":"/product-image/Merch/Plakat-UV/UV-1.webp","price":125000},{"code":"5 mm","image":"/product-image/Merch/Plakat-UV/UV-1.webp","price":165000},{"code":"8 mm","image":"/product-image/Merch/Plakat-UV/UV-1.webp","price":190000},{"code":"10 mm","image":"/product-image/Merch/Plakat-UV/UV-1.webp","price":200000},{"code":"20 mm","image":"/product-image/Merch/Plakat-UV/UV-1.webp","price":285000}]'::jsonb, '[]'::jsonb, false, 35);

-- Papan Bunga
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1001, 'Papan Bunga Kecil - Pink Purple Gradient #PKK1', 'papan-bunga-kecil-pink-purple-gradient-pkk1', '/product-image/papan-bunga/Kecil - KODE PKK1 - Pink Purple gradient dengan bunga dan kupu-kupu.webp', '{}', 'Papan bunga kecil dengan desain pink purple gradient, dilengkapi dengan bunga dan kupu-kupu.', 65000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":65000},{"minQuantity":3,"price":63000},{"minQuantity":5,"price":60000}]'::jsonb, '1-2 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 36);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1002, 'Papan Bunga Kecil - Bunga Matahari Mini #PKK3', 'papan-bunga-kecil-bunga-matahari-mini-pkk3', '/product-image/papan-bunga/Kecil - KODE PKK3 dengan Bunga matahari mini dan anggrek putih.webp', '{}', 'Papan bunga kecil dengan bunga matahari mini dan anggrek putih.', 65000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":65000},{"minQuantity":3,"price":63000},{"minQuantity":5,"price":60000}]'::jsonb, '1-2 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 37);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1003, 'Papan Bunga Kecil - Pink Gold Tropical #PKK5', 'papan-bunga-kecil-pink-gold-tropical-pkk5', '/product-image/papan-bunga/Kecil - KODE PKK5 - Pink gold tropical.webp', '{}', 'Papan bunga kecil dengan tema pink gold tropical.', 65000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":65000},{"minQuantity":3,"price":63000},{"minQuantity":5,"price":60000}]'::jsonb, '1-2 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 38);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1004, 'Papan Bunga - Plakat Bunga Anggrek Biru #PKB2', 'papan-bunga-plakat-bunga-anggrek-biru-pkb2', '/product-image/papan-bunga/KODE PKB2 - Plakat Bunga dengan anggrek biru moonlight.webp', '{}', 'Plakat bunga dengan anggrek biru moonlight.', 70000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":70000},{"minQuantity":3,"price":68000},{"minQuantity":5,"price":65000}]'::jsonb, '1-2 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 39);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1005, 'Papan Bunga - Plakat Bulat Anggrek Putih #PKB1', 'papan-bunga-plakat-bulat-anggrek-putih-pkb1', '/product-image/papan-bunga/KODE PKB1 - Plakat Bulat dengan bunga anggrek putih.webp', '{}', 'Plakat bulat dengan bunga anggrek putih.', 70000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":70000},{"minQuantity":3,"price":68000},{"minQuantity":5,"price":65000}]'::jsonb, '1-2 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 40);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1006, 'Papan Bunga - Pink Mawar Love #PKK6', 'papan-bunga-pink-mawar-love-pkk6', '/product-image/papan-bunga/KODE PKK6 - Pink dengan bunga mawar dan love di tepi.webp', '{}', 'Papan bunga pink dengan bunga mawar dan love di tepi.', 70000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":70000},{"minQuantity":3,"price":68000},{"minQuantity":5,"price":65000}]'::jsonb, '1-2 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 41);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1007, 'Papan Bunga - Hitam Emas Mewah #PKK7', 'papan-bunga-hitam-emas-mewah-pkk7', '/product-image/papan-bunga/KODE PKK7 plakat hitam emas mewah dengan bunga monokromatik.webp', '{}', 'Plakat hitam emas mewah dengan bunga monokromatik.', 70000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":70000},{"minQuantity":3,"price":68000},{"minQuantity":5,"price":65000}]'::jsonb, '1-2 hari', 5, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 42);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (1008, 'Papan Bunga - Biru Muda Mawar #PKK4', 'papan-bunga-biru-muda-mawar-pkk4', '/product-image/papan-bunga/KODE PKK4  - Plakat biru muda dengan bunga mawar di tepi.webp', '{}', 'Plakat biru muda dengan bunga mawar di tepi.', 70000, NULL, 'Papan Bunga', '[{"minQuantity":1,"price":70000},{"minQuantity":3,"price":68000},{"minQuantity":5,"price":65000}]'::jsonb, '1-2 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 43);

-- Jasa & Layanan
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (200, 'Jasa Desain', 'jasa-desain', '/product-image/design-service.svg', '{}', 'Jasa desain profesional untuk semua kebutuhan grafis Anda. Konsultasi desain gratis.', 25000, NULL, 'Jasa & Layanan', '[{"minQuantity":1,"price":25000},{"minQuantity":3,"price":22500},{"minQuantity":5,"price":20000}]'::jsonb, '1-3 hari', 4.9, true, 'design', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 44);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (2001, 'Jasa Express', 'jasa-express', '/product-image/express-service.svg', '{}', 'Layanan express untuk pengerjaan cepat dalam 24 jam.', 25000, NULL, 'Jasa & Layanan', '[{"minQuantity":1,"price":25000}]'::jsonb, '24 jam', 4.9, false, 'order', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 45);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (2002, 'Ongkir', 'ongkir', '/product-image/ongkir.svg', '{}', 'Biaya pengiriman yang dapat disesuaikan.', 0, NULL, 'Jasa & Layanan', '[{"minQuantity":1,"price":0}]'::jsonb, 'Sesuai jadwal', 4.5, false, 'order', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, true, 46);

-- Apparel
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (101, 'Gelang Tiket Kertas', 'gelang-tiket-kertas', '/product-image/New Product/GELANG-TIKET.webp', '{}', 'Gelang tiket bahan kertas untuk event, konser, dan seminar.', 1000, NULL, 'Apparel', '[{"minQuantity":1,"price":1000},{"minQuantity":3000,"price":950},{"minQuantity":5000,"price":800},{"minQuantity":7000,"price":750},{"minQuantity":9000,"price":700},{"minQuantity":20001,"price":520}]'::jsonb, '3-5 hari', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 47);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (102, 'Gelang Tiket Tissue', 'gelang-tiket-tissue', '/product-image/New Product/GELANG-TIKET-TISSUE.webp', ARRAY['/product-image/New Product/GELANG-TIKET-TISSUE-2.webp']::text[], 'Gelang tiket premium bahan tissue, nyaman dipakai. Sudah termasuk cetak, potong, dan pengunci.', 3500, NULL, 'Apparel', '[{"minQuantity":1,"price":3500},{"minQuantity":2001,"price":3000},{"minQuantity":5001,"price":2500},{"minQuantity":10001,"price":2000}]'::jsonb, '7-25 hari', 4.9, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 48);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (23, 'Sablon Kaos DTF', 'sablon-kaos-dtf', '/product-image/t-shirt-1.webp', ARRAY['/product-image/t-shirt-2.webp', '/product-image/t-shirt-3.webp']::text[], 'Sablon Kaos DTF dengan kualitas warna solid dan sablon yang elastis tidak mudah pecah. Tersedia berbagai warna kaos.', 75000, NULL, 'Apparel', '[{"minQuantity":1,"price":75000},{"minQuantity":4,"price":70000},{"minQuantity":25,"price":65000},{"minQuantity":100,"price":60000}]'::jsonb, '5-7 hari', 4.7, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 49);
insert into public.products (id, name, slug, image, additional_images, description, price, discount_price, category, price_thresholds, time, rating, bestseller, unit, is_available, pricing_method, base_price_per_sqm, min_width, max_width, min_height, max_height, models, lamination_options, is_customizable, sort_order)
values (105, 'Baju PDH', 'baju-pdh', '/product-image/Merch/baju-pdh.webp', '{}', 'Baju PDH custom berkualitas untuk keperluan organisasi/komunitas.', 120000, NULL, 'Apparel', '[{"minQuantity":1,"price":120000},{"minQuantity":51,"price":115000},{"minQuantity":100,"price":110000},{"minQuantity":300,"price":105000}]'::jsonb, '2-4 Minggu', 4.8, false, 'pcs', true, NULL, NULL, NULL, NULL, NULL, NULL, '[]'::jsonb, '[]'::jsonb, false, 50);

-- ============================================================
-- Promo Codes (from constants/index.ts)
-- ============================================================
insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)
values ('DISCOUNT10', 'Diskon 10% untuk semua produk', 'percentage', 10, NULL, NULL, NULL, true);
insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)
values ('SAVE15', 'Diskon 15% untuk semua produk', 'percentage', 15, NULL, NULL, NULL, true);
insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)
values ('PROMO20', 'Diskon 20% untuk semua produk', 'percentage', 20, NULL, NULL, NULL, true);
insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)
values ('KKN15', 'Diskon 15% untuk Paket IDC LYD 2S (min 7 pcs)', 'percentage', 15, '[8]'::jsonb, 7, NULL, true);
insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)
values ('IDCARD15', 'Diskon 15% untuk ID Card 2S', 'percentage', 15, '[2]'::jsonb, NULL, NULL, true);
insert into public.promo_codes (code, description, type, discount_percent, product_ids, min_quantity, override_prices, is_active)
values ('HUT3TH', 'Promo ulang tahun 3 tahun! Harga spesial untuk IDC LYD', 'override', 0, '[8,7]'::jsonb, NULL, '{"7":13000,"8":15000}'::jsonb, true);

-- Seed complete
