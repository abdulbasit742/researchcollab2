

## Global Talent Risk Index (GTRI) - Implementation Plan

### Overview
Build a macro-level risk monitoring system that continuously calculates ecosystem stability indicators across skills, institutions, capital allocation, liquidity, and trust. This is the defensive counterpart to the growth-prediction systems already built.

---

### Phase 1: Database Schema (Migration)

Create 3 new tables with full RLS:

**`risk_metrics`** - Core risk scores per entity
- `id` (uuid, PK), `entity_type` (text: skill/institution/region/platform), `entity_id` (text), `trust_volatility` (numeric), `dispute_spike_rate` (numeric), `liquidity_distortion` (numeric), `capital_concentration_index` (numeric), `pricing_anomaly_score` (numeric), `centralization_risk` (numeric), `composite_risk_score` (numeric), `risk_level` (text: stable/elevated/high/critical), `calculated_at` (timestamptz)
- Indexes on `entity_type`, `entity_id`, and `(entity_type, entity_id)`
- RLS: Platform admins can read all; authenticated users can read skill/region/platform-level (public macro data); institution-level restricted to institution admins

**`systemic_alerts`** - Triggered warnings when thresholds crossed
- `id` (uuid, PK), `entity_type` (text), `entity_id` (text), `alert_type` (text), `severity` (text: info/warning/critical), `description` (text), `triggered_at` (timestamptz), `resolved_at` (timestamptz nullable)
- RLS: Admin-only read/write

**`risk_trends`** - Historical risk score snapshots
- `id` (uuid, PK), `entity_type` (text), `entity_id` (text), `risk_score` (numeric), `recorded_at` (timestamptz)
- Indexes on `(entity_type, entity_id, recorded_at)`
- RLS: Same as risk_metrics (public for skill/region/platform; restricted for institution)

---

### Phase 2: Edge Function - `compute-risk-index`

New edge function that:
1. Accepts optional `entity_type` and `entity_id` filters (defaults to computing all)
2. Pulls trust score volatility from `user_trust_profiles` and `trust_score_history`
3. Pulls dispute frequency from `disputes` table
4. Pulls liquidity data from `skill_market_metrics`
5. Pulls capital data from `wallet_transactions` / `wallets`
6. Pulls pricing variance from `earning_bids`
7. Computes weighted composite score:
   - trust_volatility (25%) + dispute_spike_rate (20%) + liquidity_distortion (15%) + capital_concentration_index (15%) + pricing_anomaly_score (15%) + centralization_risk (10%)
8. Assigns risk_level thresholds (0-25 Stable, 25-50 Elevated, 50-75 High, 75+ Critical)
9. Generates systemic_alerts when crossing from one level to another
10. Stores results in `risk_metrics` and appends to `risk_trends`
11. Applies smoothing (EMA) to avoid false spikes

Config: `verify_jwt = false` in `supabase/config.toml` with in-code auth check.

---

### Phase 3: React Hook - `useRiskIndex`

`useRiskIndex(entityType?, entityId?)`
- Fetches latest risk_metrics for entity
- Fetches risk_trends for historical chart
- Fetches active systemic_alerts
- Provides `computeRisk()` trigger function
- Loading/error states via TanStack Query

---

### Phase 4: UI Pages

**Public page: `/macro-risk`**
- Global Ecosystem Risk Overview panel (composite score gauge, trend line)
- Skill Risk Explorer (table of skills sorted by risk, color-coded severity)
- Capital Risk Heatmap (bar chart of concentration)
- Active Alerts list with severity badges
- Uses Recharts: RadialBarChart for composite score, LineChart for trends, BarChart for breakdown

**Admin page: `/admin/systemic-risk`**
- Full alert management (view/resolve)
- Institution comparative risk table
- Skill bubble detection dashboard
- Dispute hotspot analysis
- National-level risk score

---

### Phase 5: Integration Points

- Add route imports and `<Route>` entries in `App.tsx`
- Add sidebar links in `AdminSidebar.tsx` (systemic-risk under admin nav)
- Deploy edge function via config.toml entry

---

### Technical Details

**Files to create:**
1. `supabase/migrations/[timestamp]_gtri_schema.sql` - 3 tables + RLS + indexes
2. `supabase/functions/compute-risk-index/index.ts` - Edge function
3. `src/hooks/useRiskIndex.ts` - React hook
4. `src/pages/MacroRiskPage.tsx` - Public risk dashboard
5. `src/pages/admin/AdminSystemicRiskPage.tsx` - Admin risk panel

**Files to edit:**
1. `supabase/config.toml` - Add `[functions.compute-risk-index]`
2. `src/App.tsx` - Import pages + add routes
3. `src/components/admin/AdminSidebar.tsx` - Add "Systemic Risk" nav item

