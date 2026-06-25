-- Expand public FYP problem briefs into a broader FYP/research/project creation intake.
-- Existing public insert policy remains unchanged from the original table migration.

alter table public.fyp_problem_briefs
  add column if not exists project_title text,
  add column if not exists project_type text not null default 'fyp',
  add column if not exists academic_department text,
  add column if not exists expected_outcomes text,
  add column if not exists skills_needed text[] not null default '{}'::text[],
  add column if not exists preferred_timeline text,
  add column if not exists sponsor_type text;

create index if not exists idx_fyp_problem_briefs_project_type on public.fyp_problem_briefs(project_type);

comment on column public.fyp_problem_briefs.project_title is 'Short project title for FYP, research, or prototype intake.';
comment on column public.fyp_problem_briefs.project_type is 'Project intake type: fyp, research, or prototype.';
comment on column public.fyp_problem_briefs.expected_outcomes is 'Expected outputs such as demo, report, publication, dataset, or MVP.';
comment on column public.fyp_problem_briefs.skills_needed is 'Requested skills/technologies for matching teams.';
