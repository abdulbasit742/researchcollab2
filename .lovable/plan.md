

# Connect EarnPage & AffiliateDashboardPage to Real Database

## Overview
Replace all mock/dummy data usage in EarnPage, EarnProjectDetailPage, and AffiliateDashboardPage with real database queries using the existing hooks (`useEarningProjects`, `useEarningProject`, `useMyBids`, `useMyAffiliate`). This completes the backend integration milestone for these sections.

---

## Current State Analysis

### EarnPage.tsx
- **Issue**: Uses hardcoded `mockProjects` array (lines 26-70) and `topEarners` array (lines 72-110)
- **Solution**: Use `useEarningProjects()` hook for projects, keep topEarners as featured showcase (or create leaderboard query later)

### EarnProjectDetailPage.tsx
- **Issue**: Uses `mockProjects` object (lines 31-116) and `mockBids` array (lines 118-122)
- **Solution**: Use `useEarningProject(id)` hook which fetches both project and bids

### AffiliateDashboardPage.tsx
- **Issue**: Uses `dummyAffiliates`, `dummyConversions`, `affiliateTransactions` from `src/data/affiliates.ts`
- **Solution**: Use `useMyAffiliate()` hook for real affiliate data and conversions

---

## Implementation Details

### Phase 1: EarnPage.tsx Updates

**Changes:**
1. Import and use `useEarningProjects` and `useMyBids` hooks
2. Replace `mockProjects` with real projects from database
3. Add loading skeleton while fetching
4. Add empty state when no projects exist
5. Connect "My Bids" tab to real user bids
6. Format budget using `formatPKRRange` utility

**Data mapping:**
| Mock Field | Database Field |
|------------|----------------|
| `id` | `id` |
| `title` | `title` |
| `description` | `description` |
| `budget` (string) | `budget_min`, `budget_max` (format to "PKR X - Y") |
| `deadline` (string) | `deadline_days` (format to "X days") |
| `bids` | `bid_count` |
| `skills` | `tags` |
| `posted` | `created_at` (format relative time) |
| `status` | `status` |

### Phase 2: EarnProjectDetailPage.tsx Updates

**Changes:**
1. Import and use `useEarningProject(id)` hook
2. Remove `mockProjects` and `mockBids` objects
3. Use real project data with proper null handling
4. Use real bids from the hook
5. Connect bid submission to `useSubmitBid` hook
6. Show actual bid count from database

**Bid form integration:**
- Use `useSubmitBid()` hook instead of mock timeout
- Refetch project data after successful bid
- Show real bidder names from profiles

### Phase 3: AffiliateDashboardPage.tsx Updates

**Changes:**
1. Import and use `useMyAffiliate()` hook
2. Remove imports from `src/data/affiliates.ts`
3. Handle loading and empty states
4. Use real affiliate data for stats grid
5. Use real conversions for earnings table
6. Generate referral links using hook's helper
7. Add "Become an Affiliate" CTA for users without affiliate profile

**Data mapping:**
| Mock Field | Database Field |
|------------|----------------|
| `totalClicks` | `total_clicks` |
| `totalSignups` | `total_signups` |
| `totalConversions` | `total_conversions` |
| `pendingCommission` | `pending_earnings` |
| `availableCommission` | `available_earnings` |
| `lifetimeEarnings` | `lifetime_earnings` |
| `referralCode` | `referral_code` |
| `status` | `status` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/EarnPage.tsx` | Replace mock data with `useEarningProjects`, `useMyBids` hooks |
| `src/pages/EarnProjectDetailPage.tsx` | Replace mock data with `useEarningProject`, `useSubmitBid` hooks |
| `src/pages/AffiliateDashboardPage.tsx` | Replace dummy data with `useMyAffiliate` hook |

---

## UI States to Handle

### Loading States
- Show skeleton loaders while data fetches
- Reuse existing skeleton patterns from project

### Empty States
- **EarnPage**: "No projects available yet" with CTA to post first project
- **EarnProjectDetailPage**: "Project not found" (already exists)
- **AffiliateDashboardPage**: "Become an Affiliate" signup prompt

### Error States
- Show error message with retry button
- Log errors to console for debugging

---

## Code Examples

### EarnPage Integration
```
// Before
const mockProjects = [...];
const filteredProjects = mockProjects.filter(...);

// After  
const { projects, loading, error } = useEarningProjects();
const { bids: myBids, loading: bidsLoading } = useMyBids();
const filteredProjects = projects.filter(...);
```

### AffiliateDashboard Integration
```
// Before
import { dummyAffiliates, dummyConversions } from "@/data/affiliates";
const affiliate = dummyAffiliates[0];

// After
import { useMyAffiliate } from "@/hooks/useMyAffiliate";
const { affiliate, conversions, loading } = useMyAffiliate();
```

---

## Benefits After Implementation

1. **Real Data**: Users see actual projects posted by other users
2. **Live Updates**: Bid counts and project status reflect real database state
3. **User Bids**: "My Bids" tab shows user's actual bid history
4. **Affiliate Stats**: Real commission tracking for affiliate users
5. **Consistency**: All pages use same data source (Supabase)

---

## Testing Checklist

After implementation, verify:
- [ ] EarnPage loads projects from database
- [ ] EarnPage shows loading skeleton during fetch
- [ ] EarnPage handles empty state (no projects)
- [ ] EarnProjectDetailPage loads project by ID from database
- [ ] EarnProjectDetailPage shows real bids
- [ ] Bid submission creates real database record
- [ ] My Bids tab shows user's actual bids
- [ ] AffiliateDashboardPage loads user's affiliate profile
- [ ] AffiliateDashboardPage shows "Become Affiliate" for non-affiliates
- [ ] All amounts display in PKR format

