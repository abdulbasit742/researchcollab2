-- Account status fields for profile-level workflow limits.
-- Review admin update policy before using these fields for production enforcement.

alter table public.profiles
  add column if not exists account_status text not null default 'active',
  add column if not exists account_status_reason text,
  add column if not exists account_status_updated_at timestamptz,
  add column if not exists account_status_updated_by uuid references auth.users(id);

create index if not exists idx_profiles_account_status on public.profiles(account_status);

comment on column public.profiles.account_status is 'Account workflow status: active, pending_review, restricted, suspended, or deactivated.';
comment on column public.profiles.account_status_reason is 'Admin-facing reason for current account status.';
comment on column public.profiles.account_status_updated_at is 'Timestamp of latest account status change.';
comment on column public.profiles.account_status_updated_by is 'Admin user id that last changed the account status.';
