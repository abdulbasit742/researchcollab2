-- Verification badge system schema placeholder.
-- Tables support verification submissions, trust profiles, and earned badges.
-- Review row-level policies in Supabase before enabling production use.

create table if not exists public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verification_type text not null,
  status text not null default 'pending',
  documents jsonb not null default '[]'::jsonb,
  submitted_data jsonb not null default '{}'::jsonb,
  reviewer_id uuid references auth.users(id),
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_trust_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  trust_score integer not null default 0,
  verification_level text not null default 'none',
  total_projects_completed integer not null default 0,
  total_projects_posted integer not null default 0,
  successful_rate numeric not null default 0,
  response_time_hours numeric,
  is_verified_student boolean not null default false,
  is_verified_researcher boolean not null default false,
  is_verified_partner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_type text not null,
  badge_name text not null,
  description text,
  earned_at timestamptz not null default now(),
  source text,
  is_public boolean not null default true
);

create index if not exists idx_verification_submissions_user_id on public.verification_submissions(user_id);
create index if not exists idx_verification_submissions_status on public.verification_submissions(status);
create index if not exists idx_user_trust_profiles_user_id on public.user_trust_profiles(user_id);
create index if not exists idx_user_badges_user_id on public.user_badges(user_id);

comment on table public.verification_submissions is 'Verification requests for student, researcher, partner, and other trust workflows.';
comment on table public.user_trust_profiles is 'Aggregated public trust and verification summary per user.';
comment on table public.user_badges is 'Earned verification and trust badges for display across the platform.';
