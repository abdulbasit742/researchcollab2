

# Reputation Leaderboard at /leaderboard

## Overview
A full-featured leaderboard page that ranks professionals by verified metrics (trust score, delivery rate, earnings) with filters for skill, institution, and region. All data already exists in the database -- no schema changes needed.

## Data Sources (existing tables)
- **user_trust_profiles**: trust_score, trust_tier, total_projects_completed, successful_rate, dispute_rate
- **profile_proof_metrics**: total_earnings, escrow_success_rate, projects_completed, peer_reviews_received
- **profiles**: full_name, university, location, role, interests
- **user_skills**: skill_name, endorsement_count

## What Gets Built

### 1. Leaderboard Hook (`src/hooks/useLeaderboardData.ts`)
- Joins `user_trust_profiles` with `profiles` and `profile_proof_metrics`
- Supports sorting by: trust score, delivery rate (successful_rate), total earnings
- Supports filters: skill (via user_skills join), institution (profiles.university), region (profiles.location)
- Paginates results (top 100 by default)
- Returns the current user's own rank for comparison

### 2. Leaderboard Page (`src/pages/LeaderboardPage.tsx`)
- Wrapped in `MainLayout`
- Header with trophy icon and page title
- Three stat cards at top: Total Ranked Users, Average Trust Score, Total Platform Earnings
- Filter bar with:
  - Sort dropdown (Trust Score / Delivery Rate / Earnings)
  - Skill text filter
  - Institution text filter
  - Region text filter
  - Reset button
- Ranked list showing each user:
  - Rank number (gold/silver/bronze icons for top 3)
  - Name + institution
  - Trust score badge with tier color
  - Delivery rate percentage
  - Total earnings (PKR formatted)
  - Projects completed count
  - Link to their public profile
- "Your Position" highlight card if the logged-in user appears in results
- Empty state for when no results match filters

### 3. Route Registration (`src/App.tsx`)
- Add lazy import for `LeaderboardPage`
- Add `<Route path="/leaderboard" element={...} />`

## Technical Details

```text
Query Strategy:
  SELECT p.id, p.full_name, p.university, p.location,
         t.trust_score, t.trust_tier, t.total_projects_completed, t.successful_rate,
         m.total_earnings, m.escrow_success_rate, m.projects_completed
  FROM profiles p
  JOIN user_trust_profiles t ON t.user_id = p.id
  LEFT JOIN profile_proof_metrics m ON m.user_id = p.id
  WHERE t.is_frozen = false
  ORDER BY t.trust_score DESC
  LIMIT 100
```

Skill filtering: separate query to `user_skills` to get matching user_ids, then filter the main query with `.in('id', matchingIds)`.

Uses existing `formatPKR()` from `src/lib/currency.ts` for earnings display.

## Files

| File | Action |
|------|--------|
| `src/hooks/useLeaderboardData.ts` | Create -- data fetching with filters and sorting |
| `src/pages/LeaderboardPage.tsx` | Create -- full leaderboard UI with filters |
| `src/App.tsx` | Edit -- add lazy import and route |

