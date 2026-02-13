

# Phase: Data Activation & System Hardening

## Problem

Multiple pages built in recent phases use hardcoded mock data instead of real database queries. This means:
- Supervisor Review Queue shows fake reviews
- Student Performance Scorecard shows static numbers
- Academic Rankings shows placeholder names
- Employability Export generates nothing real
- Academic Task Marketplace has no real task data
- Supervisor Performance uses static metrics
- The `forecast-revenue` edge function (planned in Revenue Engine) was never created

## What Gets Built

### 1. Wire Academic Pages to Real Database

**SupervisorReviewQueuePage.tsx** -- Replace mock reviews with real `supervisor_reviews` table queries. Add insert mutations for approve/reject/revision decisions with `trust_adjustment` writes.

**StudentPerformancePage.tsx** -- Query `student_performance_metrics` table using current user's auth ID. Fall back to computed values from `user_trust_profiles` and `fyp_projects` if no row exists.

**AcademicRankingsPage.tsx** -- Query `student_performance_metrics` (top students), `supervisor_performance_metrics` (top supervisors), and aggregate `fyp_projects` by institution for department rankings. Order by relevant score columns.

**AcademicTaskMarketplacePage.tsx** -- Query `micro_academic_tasks` with status filters. Add apply mutation (set `assigned_to` + status change). Show real institution names from `organizations` join.

**SupervisorPerformancePage.tsx** -- Query `supervisor_performance_metrics` for the logged-in user. Display real completion rates and trust growth.

**EmployabilityExportPage.tsx** -- Query `employability_reports` for current user. If none exists, compute from `user_trust_profiles` + `fyp_projects` + `research_validations` and insert a new report row.

### 2. Institutional Academic Analytics Page (Phase 9 -- Missing)

Create **`/org/:id/academic-analytics`** route and page.

**InstitutionalAcademicAnalyticsPage.tsx:**
- FYP completion rate (from `fyp_projects` where `institution_id` matches)
- Average milestone delay (computed from `fyp_risk_flags`)
- Student trust distribution (histogram from `user_trust_profiles` joined via org members)
- Faculty workload balance (from `supervisor_reviews` count per supervisor)
- Economic output by department (sum `economic_value` from `fyp_projects`)
- Skill demand heatmap (from `micro_academic_tasks` task_type distribution)

Uses Recharts bar/pie/area charts. Boardroom-ready layout with Cards.

### 3. FYP Risk Detection Hook

Create **`useAcademicData.ts`** -- a unified hook that:
- Exports `useSupervisorReviews(projectId?)` -- fetches from `supervisor_reviews`
- Exports `useStudentMetrics(studentId?)` -- fetches from `student_performance_metrics`
- Exports `useFYPRiskFlags(projectId?)` -- fetches from `fyp_risk_flags`
- Exports `useAcademicTasks(filters?)` -- fetches from `micro_academic_tasks`
- Exports `useSupervisorMetrics(supervisorId?)` -- fetches from `supervisor_performance_metrics`

### 4. Revenue Forecast Edge Function

Create **`supabase/functions/forecast-revenue/index.ts`**:
- Reads last 30 days from `revenue_metrics_daily`
- Computes projected MRR using linear trend
- Estimates churn risk from declining user activity
- Writes to `revenue_forecasts` table
- Returns forecast data in response

### 5. Routing & Navigation

- Add `/org/:id/academic-analytics` route in App.tsx
- Add navigation link in AdminSidebar under academic section

## Technical Details

### New Files (3)
1. `src/hooks/useAcademicData.ts`
2. `src/pages/InstitutionalAcademicAnalyticsPage.tsx`
3. `supabase/functions/forecast-revenue/index.ts`

### Modified Files (8)
1. `src/pages/SupervisorReviewQueuePage.tsx` -- replace mock with DB queries
2. `src/pages/StudentPerformancePage.tsx` -- replace mock with DB queries
3. `src/pages/AcademicRankingsPage.tsx` -- replace mock with DB queries
4. `src/pages/AcademicTaskMarketplacePage.tsx` -- replace mock with DB queries
5. `src/pages/SupervisorPerformancePage.tsx` -- replace mock with DB queries
6. `src/pages/EmployabilityExportPage.tsx` -- replace mock with DB queries
7. `src/App.tsx` -- add academic-analytics route
8. `src/components/admin/AdminSidebar.tsx` -- add academic analytics nav item

### No New Database Tables
All tables already exist from previous migrations. No schema changes needed.

### Edge Function
`forecast-revenue` -- reads `revenue_metrics_daily`, computes linear projection, writes to `revenue_forecasts`. Authenticated endpoint using service role key for writes.

