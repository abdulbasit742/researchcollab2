-- Role request workflow for users who need elevated or different access.
-- This migration is safe-by-default: users can create and read their own requests,
-- while admin/super_admin users can review all requests.

create table if not exists public.role_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_role text not null default 'student',
  requested_role text not null,
  reason text,
  source_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id uuid references auth.users(id),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists idx_role_requests_user_id on public.role_requests(user_id);
create index if not exists idx_role_requests_status on public.role_requests(status);
create index if not exists idx_role_requests_requested_role on public.role_requests(requested_role);

alter table public.role_requests enable row level security;

create or replace function public.set_role_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_role_requests_updated_at on public.role_requests;
create trigger trg_role_requests_updated_at
before update on public.role_requests
for each row
execute function public.set_role_requests_updated_at();

drop policy if exists "Users can create their own role requests" on public.role_requests;
create policy "Users can create their own role requests"
on public.role_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can view their own role requests" on public.role_requests;
create policy "Users can view their own role requests"
on public.role_requests
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can update role requests" on public.role_requests;
create policy "Admins can update role requests"
on public.role_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'super_admin')
  )
);

comment on table public.role_requests is 'Role access requests submitted by users and reviewed by admins.';
comment on column public.role_requests.source_path is 'Route/path where the user needed access, if submitted from an access-denied screen.';
