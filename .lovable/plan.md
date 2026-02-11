

# Earn Pages -- Deep Polish Round

## Overview
This round focuses on making the Earn pages feel production-grade: real-time notifications, smarter dashboards, better sorting, and micro-interactions that elevate the user experience.

## Features

### 1. Live Dashboard Stats Using Real Bid Statuses
The `EarningsDashboardCard` currently hardcodes `activeBids = totalBids` and `successRate = 0%`. Now that bids have a real `status` column, calculate these properly: Active = pending + viewed + shortlisted, Accepted count, and Success Rate = accepted / total.

### 2. Sort Options for Available Projects
Add a sort dropdown next to the search bar on the "Available Projects" tab. Options: Newest, Budget (High to Low), Budget (Low to High), Most Bids, Deadline (Soonest). Currently only urgency sorting exists.

### 3. Bid Status Filter in My Bids Tab
Add filter chips (All, Pending, Viewed, Shortlisted, Accepted, Rejected) above the My Bids list so users can quickly find bids by status.

### 4. Real-Time Bid Status Notifications
Subscribe to bid status changes via realtime. When a project owner updates a bid's status, the bidder sees a toast notification and the My Bids tab auto-refreshes.

### 5. Animated Number Counters on Stats Bar
The `EarnStatsBar` numbers pop in statically. Add a counting-up animation using `framer-motion` so numbers animate from 0 to their value when first visible.

### 6. Confirmation Toast on Bid Status Changes (Owner Side)
When a project owner changes a bid status (Accept, Reject, Shortlist), show a success toast confirming the action with the bidder's name.

### 7. Bidder Profile Links
On the project detail page, make bidder names clickable -- link to `/u/{bidder_id}` so project owners can review bidder profiles before accepting.

### 8. Project Card Hover Effects and Micro-interactions
Add subtle scale-on-hover and shadow transitions to project cards. Add a slide-in animation for the "Urgent" badge.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `EarningsDashboardCard.tsx` | Calculate real active/accepted/success stats from bid `status` field |
| `EarnPage.tsx` | Add sort dropdown for projects tab, add bid status filter chips in My Bids tab, add realtime subscription for bid status changes |
| `EarnStatsBar.tsx` | Add animated number counter using framer-motion `useMotionValue` + `useTransform` |
| `EarnProjectDetailPage.tsx` | Add bidder profile links, add success toast on status change, confirmation on accept/reject |
| `useEarning.ts` | Add realtime subscription to `useMyBids` for bid status updates |

### Key Implementation Details

- **Dashboard Stats**: Filter `bids` by status: `active = bids.filter(b => ['pending','viewed','shortlisted'].includes(b.status)).length`, `accepted = bids.filter(b => b.status === 'accepted').length`, `successRate = (accepted / total) * 100`
- **Sort Dropdown**: Add a `sortBy` state to EarnPage, apply in `filteredProjects` useMemo alongside urgency sort
- **Bid Status Filters**: Array of filter chips rendered above myBids list, filter using `myBids.filter(b => activeFilter === 'all' || b.status === activeFilter)`
- **Realtime**: In `useMyBids`, subscribe to `earning_bids` changes filtered by `bidder_id=eq.{userId}`, on UPDATE event refetch and show toast
- **Animated Counters**: Create a small `AnimatedNumber` component using `useSpring` from framer-motion that animates from 0 to target value over 1s
- **Profile Links**: Wrap bidder name in `<Link to={/u/${bid.bidder_id}}>` on the detail page bid rows
- **Hover Effects**: Add `hover:scale-[1.01] hover:shadow-md transition-all duration-200` to project Card wrappers

### Build Order
1. Update `EarningsDashboardCard.tsx` with real stats
2. Update `EarnStatsBar.tsx` with animated counters
3. Update `EarnPage.tsx` with sort dropdown and bid status filters
4. Update `useEarning.ts` with realtime bid status subscription
5. Update `EarnProjectDetailPage.tsx` with profile links and confirmation toasts
6. Add hover effects to project cards across pages

### No Database Changes
All changes use existing data and the `status` column already added.

