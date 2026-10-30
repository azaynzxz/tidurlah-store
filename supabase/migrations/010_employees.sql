-- ============================================================
-- Migration: 010_employees.sql
-- Description: Employee payroll master data for Tidurlah Grafika
-- ============================================================

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Staff',
  base_salary numeric(15, 2) not null default 0 check (base_salary >= 0),
  payment_method text not null default 'Transfer Bank',
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed initial employees if empty
insert into public.employees (name, role, base_salary, payment_method)
select 'Stevan', 'Staff Operasional / Admin', 3000000, 'Transfer Bank'
where not exists (select 1 from public.employees where name = 'Stevan');

insert into public.employees (name, role, base_salary, payment_method)
select 'Windy', 'Kasir & Front Office', 2500000, 'Transfer Bank'
where not exists (select 1 from public.employees where name = 'Windy');

insert into public.employees (name, role, base_salary, payment_method)
select 'Zayn', 'Supervisor Percetakan', 3500000, 'Transfer Bank'
where not exists (select 1 from public.employees where name = 'Zayn');

insert into public.employees (name, role, base_salary, payment_method)
select 'Freelance Desain', 'Desainer Grafis', 1500000, 'Transfer Bank'
where not exists (select 1 from public.employees where name = 'Freelance Desain');

-- Enable RLS
alter table public.employees enable row level security;

drop policy if exists "Allow all access to employees" on public.employees;
create policy "Allow all access to employees"
  on public.employees for all
  using (true)
  with check (true);

