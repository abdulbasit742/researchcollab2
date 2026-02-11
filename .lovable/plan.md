

# Earn Pages -- Workflow Completion and Trust Round

## Overview
The Earn pages now have strong discovery, bidding, and management features. This round focuses on completing critical user workflows and adding trust-building features: bid management for bidders, advanced budget/deadline filters, project attachment support, and an activity timeline on the project detail page.

## Features

### 1. Bid Management for Bidders (Edit and Withdraw)
Bidders currently cannot modify or withdraw their bids after submission. Add an "Edit Bid" and "Withdraw Bid" option on each bid card in the "My Bids" tab. Editing opens an inline form to update amount, delivery days, and message. Withdrawing shows a confirmation dialog and deletes the bid.

### 2. Advanced Filters Panel for Available Projects
Add expandable advanced filters below the sort bar on the "Available Projects" tab: Budget Range (min/max inputs), Deadline Range (max days), and Minimum Bids toggle (show projects with 0 bids for less competition). These collapse into a "Filters" button on mobile.

### 3. Project File Attachments
Allow project owners to attach files (briefs, specs, sample data) when posting or editing a project. Files are stored in backend storage. On the project detail page, show an "Attachments" section with download links.

### 4. Activity Timeline on Project Detail Page
Add a chronological activity log on the project detail page visible to the project owner. Shows events like "Project posted", "New bid from Ahmad", "Bid shortlisted", "Bid accepted". Built from bid data timestamps.

### 5. Bid Comparison Table for Project Owners
On the project detail page, add a "Compare Bids" view that shows all bids in a sortable table format (columns: Bidder, Amount, Delivery, Status, Date). Helps owners make informed decisions at a glance.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `useEarning.ts` | Add `useWithdrawBid` hook (delete bid), add `useUpdateMyBid` hook (update amount/days/message) |
| `EarnPage.tsx` | Add edit/withdraw controls on My Bids cards, add advanced filters panel on Projects tab |
| `EarnProjectDetailPage.tsx` | Add activity timeline section, add bid comparison table toggle, add attachments section |
| `PostProjectModal.tsx` | Add file upload field using backend storage |
| `EditProjectModal.tsx` | Add file upload/manage field |
| New: `src/components/earn/AdvancedFilters.tsx` | Collapsible filter panel with budget range, deadline, and competition filters |
| New: `src/components/earn/BidComparisonTable.tsx` | Sortable table view of all bids for project owners |
| New: `src/components/earn/ProjectActivityTimeline.tsx` | Chronological event log built from bid data |

### Database Changes
- Create a `earning_project_attachments` table: `id`, `project_id` (FK), `file_name`, `file_url`, `file_size`, `uploaded_by`, `created_at`
- Create a storage bucket `earning-attachments` for file uploads
- RLS: Only project owner can insert/delete attachments; anyone authenticated can read attachments for open projects

### Key Implementation Details

- **Withdraw Bid**: `supabase.from('earning_bids').delete().eq('id', bidId).eq('bidder_id', user.id)` with confirmation dialog
- **Edit Bid**: Inline form toggle on the bid card, calls `supabase.from('earning_bids').update({ amount, delivery_days, message }).eq('id', bidId).eq('bidder_id', user.id)`
- **Advanced Filters**: State stored in EarnPage, applied in `filteredProjects` useMemo. Budget filter: `budget_min >= filterMin && budget_max <= filterMax`. Collapsible with `Collapsible` from Radix
- **File Upload**: Use backend storage `supabase.storage.from('earning-attachments').upload(...)`, store metadata in `earning_project_attachments` table
- **Activity Timeline**: Derive events from bids array -- map each bid to events based on its status and timestamps (`created_at` for submission, infer status change times). Show in reverse-chronological order
- **Bid Comparison Table**: Simple `<table>` with sortable column headers using local state, renders all bids with key metrics side by side

### Build Order
1. Database migration: create `earning_project_attachments` table + storage bucket
2. Create `AdvancedFilters.tsx`
3. Create `BidComparisonTable.tsx`
4. Create `ProjectActivityTimeline.tsx`
5. Update `useEarning.ts` with withdraw/edit bid hooks
6. Update `EarnPage.tsx` with advanced filters and bid edit/withdraw
7. Update `EarnProjectDetailPage.tsx` with activity timeline, comparison table, attachments
8. Update `PostProjectModal.tsx` and `EditProjectModal.tsx` with file upload

