-- ============================================================
-- Migration: 009_expenses.sql
-- Description: Business expenses tracking table for Tidurlah Grafika
-- ============================================================

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  amount numeric(15, 2) not null check (amount >= 0),
  date date not null default current_date,
  payment_method text not null default 'Cash',
  platform text not null default 'Toko Offline / Agen',
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_expenses_date on public.expenses(date);
create index if not exists idx_expenses_category on public.expenses(category);
create index if not exists idx_expenses_platform on public.expenses(platform);

-- Enable Row Level Security
alter table public.expenses enable row level security;

-- Policies for expenses
drop policy if exists "Allow all access to expenses" on public.expenses;
create policy "Allow all access to expenses"
  on public.expenses for all
  using (true)
  with check (true);

