-- ============================================================
-- Migration 006: Add products storage bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict do nothing;

-- Policy: Public can read product images
create policy "Public can read product images"
  on storage.objects for select
  using (bucket_id = 'products');

-- Policy: Staff can upload product images
create policy "Staff can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Policy: Staff can update product images
create policy "Staff can update product images"
  on storage.objects for update
  using (
    bucket_id = 'products'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );

-- Policy: Staff can delete product images
create policy "Staff can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'cashier')
    )
  );
