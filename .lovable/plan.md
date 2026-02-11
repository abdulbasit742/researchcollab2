

# Earn Pages -- Final Completeness Round

## Overview
The Earn pages have nearly every feature built. This round closes remaining gaps and adds engagement/trust features that tie the Earn experience into the broader platform.

## Features

### 1. File Upload in EditProjectModal
The PostProjectModal supports file attachments, but EditProjectModal does not yet. Add the same file upload field plus a list of existing attachments with delete buttons so project owners can manage files when editing.

### 2. Bid Notifications via Badge on Navbar
Add a notification indicator on the "Earn" nav link when a user has bids with updated statuses they haven't seen. Uses the realtime subscription already in place -- just surface the count in the navigation.

### 3. Project Status Transitions (Close / Reopen)
Allow project owners to manually close a project (mark as "closed") or reopen it from the detail page. Closed projects stop accepting new bids and show a "Closed" badge.

### 4. Bidder Trust Score Display
Show the bidder's trust score next to their name on bid cards (both in the detail page and comparison table). Helps project owners make trust-informed decisions.

### 5. Earnings History / Completed Projects Log
Add a new "Completed" sub-section in the My Projects tab that shows projects marked as closed/completed with final accepted bid amount, creating a visible earning history.

### 6. EditProjectModal Attachment Management
Show existing attachments in the edit modal with delete capability, plus the ability to add new files.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `EditProjectModal.tsx` | Add file upload input, show existing attachments with delete buttons, integrate `useProjectAttachments`, `useUploadAttachment`, `useDeleteAttachment` hooks |
| `EarnProjectDetailPage.tsx` | Add Close/Reopen project button for owners, show bidder trust scores on bid cards |
| `BidComparisonTable.tsx` | Add trust score column |
| `useEarning.ts` | Add `useCloseProject` hook (update status to "closed"/"open"), add trust score join to bid queries |
| `EarnPage.tsx` | Add "Completed" filter in My Projects tab showing closed projects with accepted bid amounts |
| `MyProjectCard.tsx` | Show accepted bid amount on completed project cards |

### Database Changes
None -- uses existing `status` column on `earning_projects` and existing trust profile data.

### Key Implementation Details

- **EditProjectModal attachments**: Import `useProjectAttachments`, `useUploadAttachment`, `useDeleteAttachment`. Show existing files as a list with X delete buttons. Add file input below for new uploads. On submit, upload new files after project update.
- **Close/Reopen**: New `useCloseProject` hook calls `supabase.from('earning_projects').update({ status: newStatus }).eq('id', projectId).eq('owner_id', user.id)`. Button on detail page toggles between "Close Project" and "Reopen Project".
- **Trust Score on Bids**: Join `trust_profiles.trust_score` when fetching bids via the `bidder_id`. Display as a small shield icon with score next to bidder name.
- **Completed Projects**: Filter `myProjects` by `status === "closed"` and show the accepted bid's amount as "Earned" on each card.

### Build Order
1. Add `useCloseProject` hook to `useEarning.ts`, add trust score to bid queries
2. Update `EditProjectModal.tsx` with attachment management
3. Update `EarnProjectDetailPage.tsx` with close/reopen and trust scores
4. Update `BidComparisonTable.tsx` with trust score column
5. Update `EarnPage.tsx` and `MyProjectCard.tsx` with completed projects view
