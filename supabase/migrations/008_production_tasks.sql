-- ============================================================
-- Migration 008: Production Tasks (Daily Schedule)
-- ============================================================
-- Allows admins to create daily production schedules from
-- orders and custom tasks, synced across users via Supabase.
-- ============================================================

create table if not exists public.production_tasks (
  id uuid primary key default gen_random_uuid(),
  schedule_date date not null,
  order_id text references public.orders(order_id) on delete set null,
  title text not null,
  description text not null default '',
  priority integer not null default 0, -- 0=normal, 1=urgent
  is_completed boolean not null default false,
  sort_order integer not null default 0,
  created_by text not null default '',
  deadline timestamptz,
  customer_name text not null default '',
  items_summary text not null default '',
  cabang text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.production_tasks is 'Daily production schedule tasks. Each row is a task for a specific date, optionally linked to an order.';

-- Performance indexes
create index if not exists idx_production_tasks_date
  on public.production_tasks(schedule_date);
create index if not exists idx_production_tasks_order
  on public.production_tasks(order_id)
  where order_id is not null;
create index if not exists idx_production_tasks_date_sort
  on public.production_tasks(schedule_date, sort_order);

-- Updated_at trigger (reuses existing function from 001_profiles)
create trigger production_tasks_updated_at
  before update on public.production_tasks
  for each row execute function public.update_updated_at();

-- ============================================================
-- RLS Policies (same staff-only pattern as orders)
-- ============================================================
alter table public.production_tasks enable row level security;

-- Staff can read all tasks
create policy "Staff can read production tasks"
  on public.production_tasks for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can insert tasks
create policy "Staff can insert production tasks"
  on public.production_tasks for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can update tasks
create policy "Staff can update production tasks"
  on public.production_tasks for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Staff can delete tasks
create policy "Staff can delete production tasks"
  on public.production_tasks for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );
