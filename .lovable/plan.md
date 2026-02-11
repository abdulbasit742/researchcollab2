

# Bid Status Tracking with Timeline + Quick Bid Feature

## Overview
The approved plan included **Bid Status Tracking** and **Quick Bid** as features 3 and 6, but they were not implemented in the last round. This plan delivers both, adding a `status` column to the `earning_bids` table and building the UI for project owners to manage bid statuses and for bidders to see visual progress.

## What Gets Built

### 1. Bid Status System (Database)
Add a `status` column to `earning_bids` with values: `pending`, `viewed`, `shortlisted`, `accepted`, `rejected`. Project owners can update bid statuses from the project detail page. Bidders see a visual timeline on their "My Bids" tab.

### 2. Bid Status Timeline (Bidder View)
In the "My Bids" tab on EarnPage, each bid card gets a horizontal step indicator showing progress through: Pending -> Viewed -> Shortlisted -> Accepted/Rejected. Color-coded dots and connecting lines show where the bid stands.

### 3. Bid Management for Project Owners
On `EarnProjectDetailPage`, when the logged-in user is the project owner, each bid row shows action buttons: "Shortlist", "Accept", "Reject". Status badges update in real-time.

### 4. Quick Bid Feature
A "Quick Bid" button on project cards that pre-fills the bid form with the user's last used amount and delivery days (stored in localStorage). One click navigates to the project detail page with the form pre-filled.

## Technical Details

### Database Migration
```sql
ALTER TABLE earning_bids
ADD COLUMN status text NOT NULL DEFAULT 'pending';
```
No new RLS policies needed -- existing policies on `earning_bids` already cover reads/writes. The project owner updates bids via a new hook that checks ownership.

### New Files

**`src/components/earn/BidStatusTimeline.tsx`**
- Horizontal step indicator component
- Props: `status: string`
- Steps: Pending, Viewed, Shortlisted, Accepted (or Rejected as alternate end state)
- Uses colored dots and lines; green for completed steps, gray for future

### Modified Files

**`src/hooks/useEarning.ts`**
- Add `useUpdateBidStatus(projectId)` hook -- allows project owner to update bid status
- Add `useQuickBidDefaults()` hook -- reads/writes last bid values from localStorage
- Update `EarningBid` interface to include `status` field

**`src/pages/EarnPage.tsx`**
- Replace hardcoded "Pending" badge with `BidStatusTimeline` component in My Bids tab
- Add Quick Bid button on project cards (for logged-in users who have bid before)

**`src/pages/EarnProjectDetailPage.tsx`**
- When logged-in user is the project owner: show status management buttons on each bid
- Dropdown or button group: Mark as Viewed / Shortlist / Accept / Reject
- Update `useSubmitBid` to save last-used values for Quick Bid

### Build Order
1. Database migration: add `status` column to `earning_bids`
2. Create `BidStatusTimeline.tsx` component
3. Add `useUpdateBidStatus` and `useQuickBidDefaults` hooks to `useEarning.ts`
4. Update `EarnProjectDetailPage.tsx` with owner bid management
5. Update `EarnPage.tsx` My Bids tab with timeline and Quick Bid integration

