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
