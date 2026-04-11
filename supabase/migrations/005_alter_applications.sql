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
