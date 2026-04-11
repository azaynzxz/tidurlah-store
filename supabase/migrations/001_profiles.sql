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
