
# Mobile Tour Optimization Plan

## Problems Identified

1. **Tooltip card overlaps MobileBottomNav** -- The tooltip is fixed at `bottom: 32px`, but the `MobileBottomNav` is a fixed `h-16` (64px) bar at the bottom with safe-area padding. On mobile, the tooltip sits behind or overlaps the nav bar.

2. **TourLaunchButton overlaps MobileBottomNav** -- Fixed at `bottom-6 right-6` (24px), directly behind the bottom nav.

3. **Spotlight ellipse sizing not mobile-aware** -- Uses fixed minimum of `200px x 120px` which can be too wide on small screens (320-390px), causing the spotlight to bleed off-screen.

4. **No swipe gesture support** -- Mobile users expect swipe left/right to navigate steps, but only button taps are supported.

5. **Tooltip card padding too generous for small screens** -- `p-5` (20px) padding and `480px` max-width wastes space; step dots for 10 steps can overflow on narrow screens.

6. **Scroll-to-target doesn't account for bottom tooltip** -- `scrollIntoView({ block: "center" })` may position the target behind the tooltip card on short viewports.

7. **No body scroll lock** -- Users can scroll the page behind the backdrop on mobile, causing the spotlight to desync from its target.

8. **Touch target sizes** -- Back/Next buttons use `size="sm"` which may be too small for comfortable mobile tapping (should be at least 44px touch targets).

9. **Close button (X) is too small** -- Only `p-1` with a `w-4 h-4` icon -- hard to tap on touch screens.

10. **No haptic/visual feedback on step change** -- No animation feedback when swiping or tapping nav buttons on mobile.

---

## Implementation Plan

### 1. Mobile-aware tooltip positioning
- Detect mobile via `useIsMobile()` hook
- On mobile: position tooltip at `bottom: 80px` (above the 64px MobileBottomNav + safe area)
- On desktop: keep current `bottom: 32px`
- Reduce padding from `p-5` to `p-3` on mobile
- Reduce max-width to `calc(100vw - 16px)` on mobile for edge-to-edge feel

### 2. Mobile-aware TourLaunchButton
- On mobile: position at `bottom-20` (above MobileBottomNav) instead of `bottom-6`
- Make the button slightly smaller on mobile with compact text

### 3. Responsive spotlight sizing
- Cap spotlight ellipse width to `min(targetWidth + 40, viewportWidth - 32)` so it never bleeds off-screen
- Reduce the minimum from `200px` to `160px` on mobile

### 4. Add swipe gesture navigation
- Add touch event handlers (`onTouchStart`, `onTouchEnd`) to the tooltip card
- Swipe left = next step, swipe right = previous step
- Minimum swipe distance threshold of 50px to avoid accidental triggers

### 5. Scroll offset for mobile
- When scrolling to target on mobile, use `scrollIntoView({ block: "start" })` with a manual offset so the element isn't hidden behind the tooltip
- Add a small delay to let the tooltip render before scrolling

### 6. Body scroll lock during tour
- When tour is active on mobile, set `document.body.style.overflow = "hidden"` to prevent background scrolling
- Restore on tour end

### 7. Larger touch targets
- Increase Back/Next button height to `h-10` (40px) on mobile with `touch-manipulation`
- Increase close (X) button to `p-2` with `min-w-[44px] min-h-[44px]` tap area

### 8. Compact step indicator for mobile
- Replace 10 individual dots with a condensed format: show only the active dot, 2 neighbors, and ellipsis dots for the rest
- Prevents horizontal overflow on 320px screens

### 9. Hide MobileBottomNav during tour
- When `isActive` is true, hide the `MobileBottomNav` to free up screen space and avoid overlap entirely
- This gives the tooltip full bottom-of-screen real estate

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/walkthrough/WalkthroughOverlay.tsx` | Mobile-responsive tooltip positioning, swipe gestures, body scroll lock, responsive spotlight, larger touch targets, compact step dots |
| `src/components/walkthrough/TourLaunchButton.tsx` | Mobile-aware bottom positioning above nav bar |
| `src/components/layout/MobileBottomNav.tsx` | Hide when walkthrough is active |
| `src/contexts/DemoWalkthroughContext.tsx` | Adjust scroll behavior for mobile (offset from bottom tooltip) |

### No new dependencies required -- uses existing `framer-motion`, `useIsMobile`, and native touch events.
