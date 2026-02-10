

# Enhance Earn Page -- Advanced Features

## Current State
The Earn page has: hero section with stats, project browsing with search, bid submission, "How It Works" tab, "My Bids" tracking, "My Projects" management with filter/sort, post/edit project modals, real-time bid notifications, and email notifications.

## What's Missing / Next-Level Features

### 1. Category Filters
Currently only free-text search exists. Add horizontal scrollable category chips (e.g., "Data Analysis", "Writing", "Programming", "Design", "Research", "Translation") above the project list so users can filter by discipline instantly.

### 2. Saved / Bookmarked Projects
Let users bookmark interesting projects they want to bid on later. Add a heart/bookmark icon on each project card and a "Saved" tab alongside the existing tabs. Stored in localStorage for non-logged-in users, or in the database for logged-in users.

### 3. Bid Status Tracking with Timeline
Currently "My Bids" only shows "Pending" status. Add proper bid statuses (Pending, Viewed, Shortlisted, Accepted, Rejected) with a visual timeline/progress indicator on each bid card. The project owner can update bid status from the project detail page.

### 4. Recommended Projects Sidebar
An "AI Recommended" section that appears at the top of the projects tab showing 2-3 projects matched to the user's profile skills and past bid history. Uses a simple keyword matching algorithm (no AI call needed -- match user profile tags against project tags).

### 5. Earnings Dashboard Card
A compact card in the "My Bids" tab header showing: total earnings (from completed projects), active contracts count, success rate (accepted bids / total bids), and average bid amount. Computed from existing data.

### 6. Quick Bid Feature
For returning users, add a "Quick Bid" button that pre-fills the bid form with their last used rate and delivery time, reducing friction. One-click to submit with default values.

---

## Technical Details

### New Files

**`src/components/earn/CategoryFilter.tsx`**
- Horizontal scrollable chip bar with preset categories
- "All" option to reset filter
- Accepts `selected` and `onSelect` props

**`src/components/earn/EarningsDashboardCard.tsx`**
- Compact stats card showing total earnings, success rate, active contracts
- Uses data from `useMyBids` and `useMyProjects`

**`src/components/earn/SavedProjectsTab.tsx`**
- Content for the "Saved" tab
- Uses localStorage for persistence (keeps it simple, no DB changes)

**`src/components/earn/RecommendedProjects.tsx`**
- Shows 2-3 tag-matched projects at top of "Available Projects"
- Matches user profile skills against project tags
- Falls back to most recent projects if no match

### Modified Files

**`src/hooks/useEarning.ts`**
- Add `useSavedProjects` hook (localStorage-based bookmarking)
- Add `useEarningsDashboard` hook (computed stats from bids/projects)

**`src/pages/EarnPage.tsx`**
- Add `CategoryFilter` below search bar
- Add "Saved" tab to TabsList
- Add `RecommendedProjects` section at top of projects tab (for logged-in users)
- Add `EarningsDashboardCard` at top of "My Bids" tab
- Wire category filter state to project filtering

**`src/components/earn/MyProjectCard.tsx`** (minor)
- No changes needed

### Project Card Updates (in EarnPage.tsx inline)
- Add bookmark/save icon button on each project card
- Visual indicator for already-saved projects

### No Database Changes
All new features use existing data or localStorage. No migrations needed.

### Build Order
1. Create `CategoryFilter.tsx` component
2. Create `EarningsDashboardCard.tsx` component  
3. Add `useSavedProjects` and `useEarningsDashboard` to `useEarning.ts`
4. Create `RecommendedProjects.tsx` component
5. Create `SavedProjectsTab.tsx` component
6. Update `EarnPage.tsx` with all integrations (categories, saved tab, recommendations, dashboard card)

