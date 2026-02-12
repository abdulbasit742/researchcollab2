
# Professional Opportunity Operating System - Implementation Plan

## Overview

This plan builds 5 integrated systems on top of existing architecture. No duplicate tables or hooks -- we extend what exists and add only what's missing.

## Architecture Audit (What Already Exists)

- `useOpportunityEngine.ts` -- fetches earning_projects, scores by skill/location/university
- `useOpportunityIntelligence.ts` -- calls edge function for opportunity_score, projected_income, skill gaps
- `useOutcomeGraph.ts` -- mock-based People-Work-Results-Impact graph
- `useTrustEngine.ts` -- 5-dimension trust scoring with DB backing
- `useSkillGapEngine.ts` -- mock-based gap detection
- `useCareerEvolution.ts` -- mock-based career trajectory
- `useEconomicEngine.ts` -- full economic subsystem (830 lines)
- `useRiskIndex.ts` -- entity risk scoring from DB
- `useInstitutionalDashboard.ts` -- institution metrics, members, policies
- `OpportunitiesPage.tsx` at `/opportunities` -- basic listing page
- No `/opportunities/dashboard`, no `/my-os`, no strategic feed, no `opportunity_graph` table

## What Gets Built

---

### System 1: Opportunity Graph Engine

**Database Migration:**
- `opportunity_graph` table: `id, user_id, opportunity_type (project|job|grant|collaboration|advisory|cofounder|institutional_funding), title, description, source_entity_type, source_entity_id, relevance_score, skill_match_score, trust_match_score, outcome_match_score, network_proximity_score, readiness_score, composite_score, status (active|applied|matched|expired), created_at, updated_at`
- `opportunity_edges` table: `id, user_id, opportunity_id (FK), edge_type (skill_match|trust_fit|network_link|outcome_history|readiness_match), weight, metadata JSONB, created_at`
- RLS: users see only their own rows
- Indexes on `user_id`, `composite_score`, `opportunity_type`

**Hook:** `src/hooks/useOpportunityGraph.ts`
- Fetches from `opportunity_graph` with filters
- Computes composite score client-side from 5 dimensions (skill, trust, outcomes, network, readiness)
- Reuses `useAuth` for profile context
- Exports `useOpportunityGraph`, `useOpportunityPipeline`, `useOpportunityScore`

**UI Components:**
- `src/components/opportunity/OpportunityDashboard.tsx` -- main dashboard with pipeline view, score card, and trajectory
- `src/components/opportunity/OpportunityScoreCard.tsx` -- radial score display with 5 dimension breakdown
- `src/components/opportunity/OpportunityTrajectory.tsx` -- line chart of composite score over time using Recharts

**Route:** `/opportunities/dashboard`

---

### System 2: Reputation-to-Opportunity Converter

**Database Migration:**
- Add `opportunity_visibility_multiplier NUMERIC DEFAULT 1.0` column to `profiles` table
- `opportunity_multiplier_log` table: `id, user_id, previous_multiplier, new_multiplier, trigger_type, trigger_details JSONB, created_at`
- RLS: users read own logs, admins read all

**Hook:** `src/hooks/useOpportunityMultiplier.ts`
- Reads multiplier from profile
- Provides `computeMultiplier(trustScore, dealSuccessRate, outcomeValue)` utility
- Admin override function

**Integration:** The `OpportunityScoreCard` component will display the multiplier badge. The multiplier logic will be documented for future edge function integration with compute-trust.

---

### System 3: Strategic Feed

**Hook:** `src/hooks/useStrategicFeed.ts`
- Wraps `useProfessionalSignalFeed` with additional ranking logic
- Ranks by: outcome_value, credibility_score (from trust), skill relevance, opportunity signals
- Deprioritizes low-trust accounts and empty engagement
- Supports mode toggle: "social" vs "opportunity"

**Page:** `src/pages/StrategicFeedPage.tsx`
- Reuses existing `ProfessionalSignalCard` for rendering
- Adds mode toggle in header ("Social Mode" / "Opportunity Mode")
- In opportunity mode: intersperses `OpportunityMatchCard` items between signals
- Clean, minimal layout following existing feed patterns

**Route:** `/feed/strategic`

---

### System 4: Personal Operating System Dashboard (/my-os)

**Page:** `src/pages/MyOSPage.tsx`
- Single dashboard pulling from existing hooks:
  - `useTrustProfile` -- trust trajectory (score + level)
  - `useLiquidityIndex` -- economic velocity
  - `useOpportunityGraph` -- pipeline count + top 5 matches
  - `useSkillGapEngine` -- radar chart of gaps
  - `useCareerEvolution` -- career projection phase
  - `useRiskIndex` -- economic risk indicator
- Layout: 2-column grid on desktop, single column mobile
- Top row: 4 KPI cards (Trust Score, Income Velocity, Pipeline Size, Risk Level)
- Middle: Opportunity Pipeline (top 5 matches) + Skill Gap Radar (RadarChart)
- Bottom: Career Projection timeline + Next Best Action card
- Progressive disclosure: collapsed sections expand on click

**Route:** `/my-os`

---

### System 5: Institutional Layer (Enterprise Moat)

**Database Migration:**
- `institutional_metrics` table: `id, institution_id, talent_count, avg_trust_score, skill_distribution JSONB, economic_contribution NUMERIC, deal_volume INTEGER, active_risk_signals INTEGER, period_start DATE, period_end DATE, computed_at TIMESTAMPTZ, created_at TIMESTAMPTZ`
- RLS: institution admins can read their own metrics
- Index on `institution_id, period_start`

**Component:** `src/components/institution/InstitutionDashboardV2.tsx`
- Talent heatmap (skill distribution bar chart)
- Trust averages gauge
- Economic contribution trend line
- Deal volume bar chart
- Risk signals alert list
- Reuses `useInstitutionalDashboard` for member/policy data
- New `useInstitutionalMetrics` hook for the metrics table

**Route:** Enhances existing `/org/:id/dashboard` with new metrics tab

---

## Technical Details

### Migration SQL (single migration file)
1. CREATE `opportunity_graph` with RLS (owner-only SELECT/INSERT/UPDATE)
2. CREATE `opportunity_edges` with RLS (owner-only)
3. ALTER `profiles` ADD COLUMN `opportunity_visibility_multiplier`
4. CREATE `opportunity_multiplier_log` with RLS
5. CREATE `institutional_metrics` with RLS (institution admin check)
6. CREATE indexes on scoring columns

### New Files (8 total)
1. `supabase/migrations/[timestamp]_opportunity_os.sql`
2. `src/hooks/useOpportunityGraph.ts`
3. `src/hooks/useOpportunityMultiplier.ts`
4. `src/hooks/useStrategicFeed.ts`
5. `src/components/opportunity/OpportunityScoreCard.tsx`
6. `src/components/opportunity/OpportunityTrajectory.tsx`
7. `src/pages/OpportunityDashboardPage.tsx`
8. `src/pages/StrategicFeedPage.tsx`
9. `src/pages/MyOSPage.tsx`
10. `src/components/institution/InstitutionDashboardV2.tsx`

### Modified Files (3 total)
1. `src/App.tsx` -- add 3 routes: `/opportunities/dashboard`, `/my-os`, `/feed/strategic`
2. `src/components/opportunity/index.ts` -- export new components
3. `src/components/admin/AdminSidebar.tsx` -- add My OS nav link

### No Duplications
- Reuses `useOpportunityEngine` data as source for graph population
- Reuses `useTrustProfile` instead of creating new trust hooks
- Reuses `useProfessionalSignalFeed` as base for strategic feed
- Reuses `useInstitutionalDashboard` for institution member data
- Reuses existing `RadarChart`, `LineChart`, `BarChart` from Recharts
