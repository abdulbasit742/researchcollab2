

# Proof-of-Value Engine — Implementation Plan

## Current State Assessment

The platform already has significant raw infrastructure for impact tracking:

- **`fyp_impact_metrics`** table: milestones_completed, funded_projects, total_earnings, on_time_pct, impact_score (per user)
- **`fyp_sponsorships`** table: pledge_amount, funded_amount, status per sponsor-topic pair
- **`fyp_execution_tracks`** table: milestone status, released_amount, timestamps
- **`hiring_conversions`** table: offer_made, hired, salary_band, role_title, retention_months
- **`escrow_transactions`** table: amount, status, payer/beneficiary, timestamps
- **`trust_events`** table: trust score changes
- **`sponsor_pipeline`** table: sponsor stages, first_deposit_at, avg_funding_size
- **`capital_flow_snapshots`** table: periodic financial snapshots
- **`institutional_metrics`** table: talent_count, economic_contribution, deal_volume
- **Existing hooks**: `useSponsorROI`, `useSponsorPipeline`, `useHiringConversions`, `useFYPImpactMetrics`, `useFYPInstitutionStats`
- **Existing pages**: `SponsorROIDashboardPage`, `InstitutionalFYPIntelligencePage`, `InstitutionalCommandCenterPage`

**Gaps identified:**
1. No unified "Proof-of-Value" metrics engine computing all 10 core metrics from real data in one place
2. No exportable Sponsor ROI Report (current page is view-only, no PDF/export)
3. No unified University Impact Dashboard with export
4. No Student Outcome tracking page with career trajectory visualization
5. No Platform Impact Index (composite score)
6. No data integrity validation layer for metrics

---

## Implementation Steps

### Step 1 — Impact Metrics Core (New Hook + Edge Function)

Create a `useProofOfValue` hook and a `compute-impact-metrics` edge function that auto-calculates all 10 metrics from real data:

**Metrics computed from existing tables:**
| Metric | Source |
|--------|--------|
| Time to Funding | `fyp_sponsorships.created_at` vs `fyp_topics.created_at` |
| Time to Completion | `fyp_execution_tracks` first vs last approved milestone timestamps |
| Milestone Success Rate | `fyp_execution_tracks` approved / total |
| Escrow Accuracy Rate | `escrow_transactions` where status = 'released' vs total |
| Sponsor Satisfaction Score | Derived from repeat rate + low dispute rate |
| Student Completion Rate | `fyp_impact_metrics.on_time_pct` aggregated |
| Trust Score Delta per Deal | `trust_events` grouped by deal |
| Hiring Conversion Rate | `hiring_conversions` hired / total |
| Startup Formation Count | Count of deals with `outcome_type = 'startup'` (new column) |
| Repeat Sponsor Rate | `sponsor_pipeline` repeat_funder / funded |

**Files to create:**
- `supabase/functions/compute-impact-metrics/index.ts` — Edge function that queries all source tables and returns computed metrics
- `src/hooks/useProofOfValue.ts` — Frontend hook that calls the edge function

**Database changes:**
- Create `proof_of_value_snapshots` table to cache computed metrics per institution, per period
- Columns: `id`, `institution_id` (nullable for platform-wide), `sponsor_id` (nullable), `snapshot_date`, `time_to_funding_days`, `time_to_completion_days`, `milestone_success_rate`, `escrow_accuracy_rate`, `sponsor_satisfaction_score`, `student_completion_rate`, `trust_delta_avg`, `hiring_conversion_rate`, `startup_count`, `repeat_sponsor_rate`, `platform_impact_index`, `computed_at`
- RLS: Admins and institution members can read their own institution's data

### Step 2 — Sponsor ROI Report Generator

Enhance the existing `SponsorROIDashboardPage` with an exportable report:

**Files to create:**
- `src/components/reports/SponsorROIReport.tsx` — Print-optimized report component with all ROI metrics, charts rendered as static, professional layout
- `src/hooks/useReportExport.ts` — Utility hook using `window.print()` with print-specific CSS for clean PDF output

**Files to modify:**
- `src/pages/admin/SponsorROIDashboardPage.tsx` — Add "Export Report" button that opens the report in print view

**Report sections:**
1. Header: Sponsor name, organization, reporting period
2. Capital Summary: Total deployed, projects funded, completion rate
3. Trust Growth: Average trust delta of funded students
4. Hiring Outcomes: Offers made, hires, roles, salary bands
5. Time Metrics: Avg time to delivery
6. Dispute Rate (from escrow data)
7. ROI Narrative: Auto-generated summary sentence

### Step 3 — University Impact Dashboard

Create a unified dashboard pulling from all existing data sources:

**Files to create:**
- `src/pages/admin/UniversityImpactDashboardPage.tsx` — Full dashboard with export
- `src/components/reports/UniversityImpactReport.tsx` — Print-optimized export

**Sections:**
- Total Funded FYPs, Escrow Volume, Completion %, Hiring %, Startup Spin-offs
- Trust Score Average across all students
- Department Ranking (from `fyp_topics` grouped by department field)
- Sponsor Partnerships list
- Export button for print/PDF

**Files to modify:**
- `src/App.tsx` — Add route `/admin/university-impact`

### Step 4 — Student Outcome Tracking Page

Create a student-facing outcome page with career trajectory visualization:

**Files to create:**
- `src/pages/StudentOutcomePage.tsx` — Personal outcome dashboard
- `src/components/outcomes/CareerTrajectoryGraph.tsx` — Recharts line graph showing trust score, earnings, milestones over time

**Data from existing tables:**
- `fyp_impact_metrics`: milestones_completed, funded_projects, total_earnings
- `hiring_conversions`: hired, salary_band, role_title
- `trust_events`: trust score progression over time
- `fyp_execution_tracks`: milestone timeline

**Files to modify:**
- `src/App.tsx` — Add route `/my-outcomes`
- `src/components/layout/Navbar.tsx` — Add outcomes link in profile dropdown

### Step 5 — Platform Impact Index

Create a composite index and optional public display:

**Computation (in the edge function from Step 1):**
```
Platform Impact Index = 
  (Escrow Volume normalized * 0.25) +
  (Completion Rate * 0.25) +
  (Hiring Conversion * 0.20) +
  (Sponsor Retention * 0.15) +
  (Trust Stability * 0.15)
```

**Files to create:**
- `src/components/impact/PlatformImpactIndex.tsx` — Visual gauge component showing the composite score with breakdown

**Files to modify:**
- `src/pages/admin/UniversityImpactDashboardPage.tsx` — Include the index component
- `src/pages/ImpactPage.tsx` — Add the index to the public impact page

### Step 6 — Data Integrity Validation

Ensure computed metrics cannot be manipulated:

**Approach:**
- All metrics computed server-side in the edge function (not client-side)
- `proof_of_value_snapshots` table has RLS: no INSERT/UPDATE/DELETE for regular users
- Only the edge function (via service_role) writes to the snapshots table
- Financial metrics cross-referenced with `ledger_entries` in the edge function
- Hiring conversions require `sponsor_id` match (already enforced by FK)

**Database changes:**
- RLS on `proof_of_value_snapshots`: SELECT only for authenticated users (filtered by institution_id membership), no INSERT/UPDATE/DELETE via client

### Step 7 — Sales-Ready Output

Create exportable data packs for sales:

**Files to create:**
- `src/pages/admin/SalesDataPackPage.tsx` — Aggregated view combining University Impact, Sponsor ROI, and Platform Index into exportable formats
- `src/components/reports/GovernmentBriefReport.tsx` — Innovation impact brief template

**Three export templates:**
1. University Pitch: Total FYPs, completion rate, hiring conversions, economic impact
2. Sponsor Summary: ROI per sponsor with visual gauges
3. Government Brief: Economic contribution, employment generation, innovation index

All templates use the same print-CSS approach for clean PDF export.

**Files to modify:**
- `src/App.tsx` — Add route `/admin/sales-data-pack`

---

## Technical Details

### New Database Table

```sql
CREATE TABLE proof_of_value_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  sponsor_id UUID,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_to_funding_days NUMERIC,
  time_to_completion_days NUMERIC,
  milestone_success_rate NUMERIC,
  escrow_accuracy_rate NUMERIC,
  sponsor_satisfaction_score NUMERIC,
  student_completion_rate NUMERIC,
  trust_delta_avg NUMERIC,
  hiring_conversion_rate NUMERIC,
  startup_count INTEGER DEFAULT 0,
  repeat_sponsor_rate NUMERIC,
  platform_impact_index NUMERIC,
  total_escrow_volume NUMERIC DEFAULT 0,
  total_funded_fyps INTEGER DEFAULT 0,
  total_hires INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, sponsor_id, snapshot_date)
);
```

### Edge Function: `compute-impact-metrics`
- Accepts optional `institution_id` and `sponsor_id` filters
- Queries all source tables with service_role
- Computes all 10 metrics + composite index
- Upserts into `proof_of_value_snapshots`
- Returns computed results

### Export Strategy
- Uses `window.print()` with `@media print` CSS
- Report components rendered in a separate route/modal with print-optimized layout
- No external PDF library needed — browser native print-to-PDF

### Files Summary

**Create (10 files):**
1. `supabase/functions/compute-impact-metrics/index.ts`
2. `src/hooks/useProofOfValue.ts`
3. `src/hooks/useReportExport.ts`
4. `src/components/reports/SponsorROIReport.tsx`
5. `src/components/reports/UniversityImpactReport.tsx`
6. `src/components/reports/GovernmentBriefReport.tsx`
7. `src/components/impact/PlatformImpactIndex.tsx`
8. `src/components/outcomes/CareerTrajectoryGraph.tsx`
9. `src/pages/StudentOutcomePage.tsx`
10. `src/pages/admin/UniversityImpactDashboardPage.tsx`
11. `src/pages/admin/SalesDataPackPage.tsx`

**Modify (4 files):**
1. `src/App.tsx` — Add routes
2. `src/pages/admin/SponsorROIDashboardPage.tsx` — Add export button
3. `src/pages/ImpactPage.tsx` — Add Platform Impact Index
4. `src/components/layout/Navbar.tsx` — Add outcomes link

**Database:**
1. Create `proof_of_value_snapshots` table with RLS

