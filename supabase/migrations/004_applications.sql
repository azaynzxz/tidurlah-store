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
