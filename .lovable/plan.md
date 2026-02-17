

# Next-Level Features: Better Than LinkedIn

## The Big Idea
LinkedIn shows who you *say* you are. RCollab shows who you *prove* you are. These 4 features create a moat LinkedIn can't copy because they require real work data flowing through the platform.

---

## Feature 1: Proof-of-Work Profile Banner

**What LinkedIn has**: Static headline, self-reported job titles
**What we build**: A live, dynamic banner on every profile showing verified outcomes

The top of every profile gets a "Proof Strip" -- a compact, auto-generated summary:

```text
+-------------------------------------------------------+
| 12 Projects Delivered | 96% On-Time | PKR 1.2M Earned |
| Top Skills: ML (8 projects) | NLP (5 projects)        |
| Trusted by: LUMS, NUST, IBA                           |
+-------------------------------------------------------+
```

- All numbers pulled from real deal completions, escrow releases, and institutional connections
- Cannot be faked -- every metric links back to a completed deal or verified milestone
- Shows "Claimed" vs "Proven" skill badges (already have `endorsement_count` in `user_skills`)
- Updates automatically as users complete work

**Technical scope**:
- New `ProofBanner` component using existing `profile_proof_metrics` + `user_skills` tables
- Add to `UserPublicProfilePage.tsx` and `ProfilePage.tsx`
- No database changes needed -- all data already exists

---

## Feature 2: Smart Availability & Intent Broadcasting

**What LinkedIn has**: A tiny "Open to Work" badge
**What we build**: Granular availability broadcasting with intent matching

Users set their current status with detail LinkedIn never offers:

- **Availability**: Full-time / Part-time (X hrs/week) / Project-only / Unavailable
- **Intent**: Looking for projects / Seeking collaborators / Open to mentoring / Hiring
- **Capacity**: "Can take 2 more projects this month"
- **Preferred deal size**: Budget range they're interested in
- **Response time**: Average response time (auto-calculated from messaging data)

This data feeds directly into the matching engine so opportunities find the *right* people at the *right* time.

**Technical scope**:
- New `user_availability` table: `user_id, status, intent[], capacity, preferred_budget_min, preferred_budget_max, response_time_hours, updated_at`
- New `AvailabilitySettings` component on profile settings
- `AvailabilityBadge` component shown on profile cards and search results
- Update opportunity matching to weight availability signals

---

## Feature 3: Mutual Work Context on Discovery

**What LinkedIn has**: "You share 3 connections" (meaningless)
**What we build**: Real professional overlap signals

When viewing any profile or opportunity, show actionable context:

- "You both worked with **LUMS Computer Science Dept**"
- "**2 shared collaborators** have worked with this person"
- "This person completed **3 projects** in your field (NLP)"
- "Their average delivery rating from mutual contacts: **4.8/5**"

This reduces uncertainty when deciding to collaborate -- far more valuable than knowing someone follows the same influencer.

**Technical scope**:
- New `useMutualWorkContext(targetUserId)` hook
- Queries: `deal_participants` for shared projects, `profiles.university` for institution overlap, `user_skills` for skill overlap
- `MutualWorkContext` component displayed on public profiles, opportunity cards, and bid review screens
- No new tables -- derived from existing deal and profile data

---

## Feature 4: Income Velocity Dashboard

**What LinkedIn has**: Nothing. Zero financial insight.
**What we build**: A personal financial operating system for freelancers

A dedicated panel (embedded in Progress page) showing:

- **Monthly income velocity**: Earnings trend over last 6 months
- **Pipeline value**: Total value of active deals in progress
- **Average deal cycle**: Days from bid to payment (with trend)
- **Revenue by skill**: Which skills generate the most income
- **Forecasted earnings**: Based on active pipeline and historical conversion rates
- **Comparison**: "You're earning 2.3x more than peers at your trust level"

This makes users *dependent* on the platform for financial planning -- a retention moat LinkedIn can never build.

**Technical scope**:
- New `useIncomeVelocity` hook querying `escrow_transactions`, `deal_participants`, `earning_projects`
- `IncomeVelocityPanel` component added to Progress page
- `EarningsBreakdownChart` using Recharts (already installed)
- No new tables -- aggregates from existing financial data

---

## Implementation Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Proof-of-Work Profile Banner | Small (no DB changes) | High -- instant credibility |
| 2 | Mutual Work Context | Medium (new hook + component) | High -- reduces collaboration friction |
| 3 | Smart Availability Broadcasting | Medium (new table + components) | High -- powers better matching |
| 4 | Income Velocity Dashboard | Medium (new hooks + charts) | Very High -- retention moat |

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/profile/ProofBanner.tsx` | Create -- verified outcomes strip |
| `src/components/profile/AvailabilityBadge.tsx` | Create -- status indicator |
| `src/components/profile/AvailabilitySettings.tsx` | Create -- settings form |
| `src/components/profile/MutualWorkContext.tsx` | Create -- overlap signals |
| `src/components/progress/IncomeVelocityPanel.tsx` | Create -- financial dashboard |
| `src/components/progress/EarningsBreakdownChart.tsx` | Create -- revenue chart |
| `src/hooks/useMutualWorkContext.ts` | Create -- shared work query |
| `src/hooks/useIncomeVelocity.ts` | Create -- financial aggregation |
| `src/hooks/useAvailability.ts` | Create -- availability CRUD |
| `src/pages/UserPublicProfilePage.tsx` | Edit -- add ProofBanner + MutualWorkContext |
| `src/pages/ProfilePage.tsx` | Edit -- add ProofBanner |
| `src/pages/ProfileSettingsPage.tsx` | Edit -- add AvailabilitySettings |
| `src/pages/ProgressPage.tsx` | Edit -- add IncomeVelocityPanel |
| Database migration | Create `user_availability` table with RLS |
