

# Console Warning Fixes and Legacy Page Cleanup

## Overview
Two remaining ref warnings fire on every page load, and two legacy pages still use hardcoded dummy data instead of the real Earn system. This round fixes those warnings and redirects the legacy pages to their real-data equivalents.

## Features

### 1. Fix Remaining Ref Warnings
Two console warnings appear on every page:
- `FloatingSupportChat` -- rendered inside `MainLayout`, the `TooltipTrigger asChild` passes a ref to the component's child `div`, but the warning points to the Tooltip wrapping. The fix is to ensure the trigger element properly receives the ref.
- `GlobalAIChatButton` -- rendered in `MainLayout`, but it's a plain function component that doesn't accept a ref. Wrapping with `forwardRef` resolves this.

### 2. Redirect Legacy Dummy-Data Pages
Two pages still use `dummyOffers` from `src/data/offers.ts`:
- **`OfferDetailPage` (`/offers/:id`)** -- Uses dummy data. Since individual project details are now handled by `/earn/projects/:id`, redirect `/offers/:id` to `/earn/projects/:id`.
- **`JobsPage` (`/earn/jobs`)** -- Uses dummy data. The Offers/Opportunities page already shows real data. Redirect `/earn/jobs` to `/offers`.

This eliminates all references to dummy data from active routes.

---

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/support/FloatingSupportChat.tsx` | Wrap with `forwardRef`, forward ref to root `div` inside `TooltipTrigger` |
| `src/components/ai/GlobalAIChatButton.tsx` | Wrap with `forwardRef`, forward ref to the Fragment's first rendered element (the button) |
| `src/App.tsx` | Replace `OfferDetailPage` route with a redirect to `/earn/projects/:id`. Replace `JobsPage` route with a redirect to `/offers`. Remove the imports for both pages. |

### No Database Changes

### Key Implementation Details

- **FloatingSupportChat**: The `TooltipTrigger asChild` expects its child to accept a ref. Wrap the component with `forwardRef` and forward the ref to the outer `div` inside the trigger.
- **GlobalAIChatButton**: Wrap with `forwardRef`. Forward ref to the floating button element.
- **Route Redirects**: Replace `<Route path="/offers/:id" element={<OfferDetailPage />} />` with `<Route path="/offers/:id" element={<Navigate to="/earn/projects/:id" replace />} />` (using a small wrapper to extract the param). Replace `<Route path="/earn/jobs" element={<JobsPage />} />` with a `Navigate` to `/offers`.

### Build Order
1. Fix `FloatingSupportChat.tsx` with `forwardRef`
2. Fix `GlobalAIChatButton.tsx` with `forwardRef`
3. Update `App.tsx` routes to redirect legacy pages

