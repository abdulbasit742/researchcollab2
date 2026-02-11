

# Earn-to-Deal Pipeline and Bug Fixes Round

## Overview
The Earn module is fully built with all planned features. This round focuses on two things: (1) fixing active console warnings that affect every page load, and (2) connecting the Earn flow to the existing Deals system so that accepted bids automatically create Deal Rooms -- completing the end-to-end transaction lifecycle.

## Features

### 1. Fix React Ref Warnings on EarnNavItem and MobileBottomNav
The console shows "Function components cannot be given refs" warnings for `EarnNavItem` and `MobileBottomNav` on every page load. These need `React.forwardRef` wrappers to resolve.

### 2. Earn-to-Deal Room Bridge
When a project owner accepts a bid, automatically create a Deal Room linking the owner and the winning bidder. This connects the Earn workflow to the existing `deal_rooms` system, giving users a structured space to manage the work, track milestones, and handle payment.

### 3. Offers Page -- Replace Dummy Data with Real Opportunities
The Opportunities page (`/offers`) currently uses hardcoded `dummyOffers` from `src/data/offers.ts`. Replace this with real data from `earning_projects` (open projects) so users see actual opportunities they can bid on, creating a second entry point into the Earn system.

### 4. Home Dashboard Earn Widget
Add a small "Active Earn Projects" card to the Home Dashboard showing the user's active bids count, any status updates, and a link to the Earn page. Surfaces Earn activity on the main dashboard.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/layout/Navbar.tsx` | Wrap `EarnNavItem` and `MobileEarnNavItem` with `React.forwardRef` to fix ref warning |
| `src/components/layout/MobileBottomNav.tsx` | Wrap component with `React.forwardRef` to fix ref warning |
| `src/hooks/useEarning.ts` | Add `useCreateDealFromBid` hook that creates a `deal_rooms` entry when a bid is accepted |
| `src/pages/EarnProjectDetailPage.tsx` | Call `useCreateDealFromBid` after bid acceptance, add "Go to Deal Room" link on accepted bids |
| `src/pages/OffersPage.tsx` | Replace `dummyOffers` import with `useEarningProjects`, render real open projects as opportunity cards |
| `src/pages/HomeDashboard.tsx` | Add `EarnActivityWidget` showing active bid count and recent status changes |
| New: `src/components/home/EarnActivityWidget.tsx` | Small card component for Home Dashboard with earn stats |

### Database Changes
None. Uses existing `deal_rooms` table structure. The bridge hook inserts into `deal_rooms` using the accepted bid's data (owner as `buyer_id`, bidder as `seller_id`, bid amount as `agreed_amount`).

### Key Implementation Details

- **Ref Fix**: Simply wrap `EarnNavItem`, `MobileEarnNavItem`, and `MobileBottomNav` with `React.forwardRef`. The components don't use refs internally, so just forward them to the root element.
- **Earn-to-Deal Bridge**: When `useUpdateBidStatus` sets a bid to "accepted", also call `supabase.from('deal_rooms').insert({ buyer_id: project.owner_id, seller_id: bid.bidder_id, status: 'agreed', agreed_amount: bid.amount, title: project.title })`. Show a "View Deal Room" link on the accepted bid card.
- **Offers Page Migration**: Replace the `dummyOffers` import with `useEarningProjects()`. Map each `EarningProject` to a card showing title, budget range, deadline, tags, and a "Bid Now" button linking to `/earn/projects/:id`. Keep the same card layout style.
- **Home Dashboard Widget**: New `EarnActivityWidget` component that uses `useMyBids()` to show: (a) number of active bids, (b) any recently accepted/rejected bids, (c) link to Earn page. Placed alongside existing dashboard cards.

### Build Order
1. Fix ref warnings in Navbar.tsx and MobileBottomNav.tsx
2. Add `useCreateDealFromBid` hook to useEarning.ts
3. Update EarnProjectDetailPage.tsx with deal room creation on acceptance
4. Replace dummy data in OffersPage.tsx with real earning projects
5. Create EarnActivityWidget.tsx and add to HomeDashboard.tsx

