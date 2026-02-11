

# Earn Pages -- Next Level Polish and Power Features

## Overview
The Earn pages now have core features (categories, saved projects, bid tracking, recommendations, dashboard, quick bid) and are mobile-friendly. This next round adds polish, engagement, and workflow improvements.

## New Features

### 1. Search Debounce and Result Count
Currently search filters on every keystroke. Add a 300ms debounce and show a result count badge (e.g., "12 projects found") below the search bar for instant feedback.

### 2. Project Urgency Indicators
Show visual urgency on projects where the deadline is approaching (less than 3 days left). Add a pulsing "Urgent" badge and sort these higher when no other sort is active.

### 3. Share Project Button
Add a share button on each project card and detail page. Uses the Web Share API on mobile (native share sheet) and copies the link to clipboard on desktop with a toast confirmation.

### 4. Bid Count Badge on "My Bids" Tab
Show an unread/total count badge on the "My Bids" tab trigger so users can see at a glance how many bids they have. Same for "My Projects" tab.

### 5. Related Projects Section on Detail Page
At the bottom of `EarnProjectDetailPage`, show 2-3 related projects matched by tags. Encourages browsing and keeps users engaged.

### 6. Pagination / "Load More" for Project Lists
If there are more than 10 projects, show a "Load More" button instead of rendering everything at once. Improves initial load performance.

### 7. Enhanced Empty States
Replace plain text empty states with illustrated icons, better copy, and action buttons. Add a subtle animation on empty state icons.

### 8. Pull-to-Refresh Indicator
Add a visual refresh indicator at the top of project lists. On mobile, show a refresh button that's always accessible. Auto-refetch data when tab becomes visible again (using `visibilitychange` event).

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `EarnPage.tsx` | Add debounced search, result count display, tab badges for My Bids/My Projects counts, "Load More" pagination, visibility-based auto-refresh, urgency sorting |
| `EarnProjectDetailPage.tsx` | Add share button in header, related projects section at bottom using tag matching |
| `CategoryFilter.tsx` | Add result count prop to show filtered count next to "All" |
| `useEarning.ts` | Add pagination support (limit/offset) to `useEarningProjects`, add `useRelatedProjects` hook |
| New: `src/components/earn/ShareProjectButton.tsx` | Reusable share button using Web Share API with clipboard fallback |
| New: `src/components/earn/RelatedProjects.tsx` | Shows 2-3 tag-matched projects at bottom of detail page |
| `SavedProjectsTab.tsx` | Enhanced empty state with animation |
| `EarningsDashboardCard.tsx` | No changes needed |

### New Files (2)

**`src/components/earn/ShareProjectButton.tsx`**
- Props: `projectId`, `projectTitle`
- Uses `navigator.share()` on mobile, `navigator.clipboard.writeText()` on desktop
- Shows toast on success

**`src/components/earn/RelatedProjects.tsx`**
- Props: `currentProjectId`, `currentTags`, `projects` (or fetches its own)
- Filters out current project, scores by tag overlap, shows top 3
- Compact card layout with "View" button

### Key Implementation Details

- **Debounce**: Use existing `debounce` utility from `src/lib/utils.ts` for search input
- **Urgency**: Calculate from `deadline_days` and `created_at` -- if `created_at + deadline_days` is within 3 days of now, mark as urgent
- **Pagination**: Add `page` state, fetch 10 at a time, append on "Load More"
- **Tab badges**: Use the existing `myBids.length` and `myProjects.length` values already fetched
- **Auto-refresh**: Add `useEffect` with `document.addEventListener('visibilitychange', ...)` to refetch when user returns to tab
- **Share**: Feature-detect `navigator.share` for mobile native share vs clipboard fallback

### Build Order
1. Create `ShareProjectButton.tsx`
2. Create `RelatedProjects.tsx`
3. Update `useEarning.ts` with pagination support
4. Update `EarnPage.tsx` (debounce, counts, badges, pagination, urgency, auto-refresh)
5. Update `EarnProjectDetailPage.tsx` (share button, related projects)
6. Update `SavedProjectsTab.tsx` (enhanced empty state)

### No Database Changes
All changes are frontend-only using existing data.

