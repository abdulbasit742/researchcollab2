

# Earn Pages -- Navigation and Discoverability Round

## Overview
The Earn pages have all major features built and polished. This round focuses on connecting the Earn section to the rest of the platform through navigation, notifications, and a completed projects / earnings history view -- the last items from previous plans that remain unwired.

## Features

### 1. Add "Earn" to Desktop Navbar
The Earn page is accessible via the mobile bottom nav but missing from the desktop navbar's `navItems` array. Add it so desktop users can reach it directly.

### 2. Bid Notification Badge on Earn Nav Link
When a bidder has bids whose status changed (e.g., accepted, shortlisted, rejected) since they last viewed the My Bids tab, show a notification dot/count on the "Earn" link in both desktop and mobile nav. Uses a simple `last_seen_bid_status_at` timestamp stored in localStorage, compared against bid `created_at` timestamps of status-bearing bids.

### 3. Completed / Earnings History Section
Add a "Completed" sub-tab or section inside the My Projects tab that filters for `status === "closed"` projects. For each closed project, display the accepted bid amount as the "Earned" figure. This creates a visible earnings ledger for project owners.

### 4. Accepted Bid Amount on MyProjectCard
When a project is closed and has an accepted bid, show the accepted bid amount prominently on the `MyProjectCard` as a green "Earned: PKR X" badge.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/layout/Navbar.tsx` | Add `{ label: "Earn", href: "/earn", icon: DollarSign }` to `navItems` array |
| `src/components/layout/MobileBottomNav.tsx` | Add bid notification badge count to Earn nav item |
| `src/hooks/useEarning.ts` | Add `useEarnNotificationCount` hook: fetches bids with status != "pending" whose updated_at > localStorage `earn_last_seen`, returns count. Add `markEarnSeen` function. Also add `useAcceptedBidForProject(projectId)` hook. |
| `src/pages/EarnPage.tsx` | Call `markEarnSeen()` when My Bids tab is active. Add "Completed" section in My Projects tab below active projects list, filtering closed projects and showing accepted bid amounts. |
| `src/components/earn/MyProjectCard.tsx` | Accept optional `acceptedBidAmount` prop. When project status is "closed" and amount exists, show green "Earned" badge. |

### No Database Changes
All data is already available via existing tables. The notification count uses localStorage for "last seen" tracking to avoid adding a new column.

### Key Implementation Details

- **Desktop Navbar**: Simply add `{ label: "Earn", href: "/earn", icon: DollarSign }` to the `navItems` array on line 26 of `Navbar.tsx`. Import `DollarSign` from lucide-react (already imported in EarnPage).
- **Notification Count**: New `useEarnNotificationCount` hook queries `earning_bids` for the current user where `status` is not `pending` and `created_at` is more recent than `localStorage.getItem("earn_last_seen")`. Returns the count. `markEarnSeen` sets the timestamp to `new Date().toISOString()`.
- **Navbar Badge**: In `Navbar.tsx`, create an `EarnNavItem` component (similar to `MessagesNavItem`) that uses `useEarnNotificationCount` and shows a badge. In `MobileBottomNav.tsx`, pass the count as the `badge` property on the Earn item.
- **Completed Projects**: In `EarnPage.tsx` My Projects tab, after the active projects list, add a "Completed Projects" section header and render `myProjects.filter(p => p.status === "closed")` with their accepted bid amounts. Query accepted bids in batch inside the My Projects tab render.
- **MyProjectCard Earned Badge**: When `acceptedBidAmount` is provided and status is "closed", render a `<Badge variant="success">Earned: PKR {amount}</Badge>` in the card header next to the status badge.

### Build Order
1. Add `useEarnNotificationCount` and `markEarnSeen` to `useEarning.ts`
2. Update `Navbar.tsx` with Earn link + notification badge
3. Update `MobileBottomNav.tsx` with notification count
4. Update `MyProjectCard.tsx` with accepted bid amount display
5. Update `EarnPage.tsx` with completed projects section and `markEarnSeen` call

