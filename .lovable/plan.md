
# Make Everything 100% Mobile Friendly -- Full App Pass

A comprehensive mobile optimization across all inner pages, the pricing page, research hub, network, profile, deals, auth, and remaining landing page polish.

---

## 1. Pricing Page (`PricingPage.tsx`)

**Issues found:**
- Tab labels truncated on mobile ("Indi...", "AI T...", "Re...", "Ent...", "Co...") -- unusable
- Comparison table overflows horizontally without clear scroll indication
- 5-column grid TabsList is too cramped at 390px width

**Fixes:**
- Make TabsList horizontally scrollable with `overflow-x-auto` instead of `grid-cols-5`
- Add scroll shadow hints on the comparison table
- Ensure pricing cards stack properly with no `md:scale-105` on mobile (already OK)
- Make FAQ cards more compact on mobile

## 2. Research Papers Hub (`ResearchPapersPage.tsx`)

**Issues found:**
- Header buttons ("Lit Review Outline", "Annotated Bibliography", "Compare Papers") overflow on mobile
- 4 filter Select dropdowns stack vertically but take full width each -- excessive scrolling
- Sidebar (ResearchLevelCard, ReadingStatsCard, ResearchGapCard) pushes below content with no visual separator
- Compare floating bar at `bottom-6` overlaps MobileBottomNav

**Fixes:**
- Wrap header action buttons in a horizontal scroll container on mobile
- Make filter row use 2-column grid on mobile instead of full-width stacking
- Move compare floating bar to `bottom-20` on mobile to clear the nav bar
- Add `pb-20 md:pb-6` (already present -- verify)

## 3. Network Page (`NetworkPage.tsx`)

**Issues found:**
- Tab labels may truncate on narrow screens (depends on tab count)
- Connection cards and suggestion cards may overflow with long names

**Fixes:**
- Ensure TabsList is scrollable on mobile
- Truncate long names and institution names in connection cards
- Ensure all card layouts use `flex-wrap` for tag badges

## 4. Profile Page (`ProfilePage.tsx`)

**Issues found:**
- Multi-tab layout with Tabs may have truncation issues
- Trust score displays and badge grids may not wrap properly
- Sidebar content stacks below main content with no clear separation

**Fixes:**
- Make TabsList scrollable on mobile
- Ensure badge grid uses `flex-wrap` with proper spacing
- Add visual separators between stacked sections on mobile

## 5. Earn Page (`EarnPage.tsx`)

**Issues found:**
- Tab triggers ("Available Projects", "Saved", "My Projects", etc.) get truncated
- "Support" floating button overlaps with content on some views
- Stats cards grid works but text can overflow

**Fixes:**
- Make TabsList scrollable on mobile
- Ensure stats card text sizes are responsive
- Verify bottom padding for MobileBottomNav clearance

## 6. Auth Page (`AuthPage.tsx`)

**Status:** Already looks good on mobile based on screenshot. Minor:
- Ensure sign-up form fields don't cause iOS zoom (add `text-base` to inputs)

## 7. Messages Page (`MessagesPage.tsx`)

**Issues found:**
- Thread list items may have long names truncating oddly
- Search input needs `text-base` to prevent iOS zoom

**Fixes:**
- Add `text-base` to search inputs
- Verify thread list item layout wraps properly

## 8. Offers Page (`OffersPage.tsx`)

**Status:** Renders blank on mobile -- likely an auth redirect or loading issue (not a CSS problem). Layout structure looks sound with `flex-wrap` on tags.

## 9. Global Polish

**Fixes applied across all pages:**
- Add `text-base` to all Input components that don't already have it (prevents iOS auto-zoom when font-size < 16px)
- Ensure all TabsList components with 4+ tabs use horizontal scrolling on mobile instead of fixed grid
- Verify all fixed/sticky bottom bars use `bottom-16` or `bottom-20` to clear MobileBottomNav
- Ensure all touch targets meet minimum 44px height

---

## Technical Details

### Files to modify:

- **`src/pages/PricingPage.tsx`** -- Convert TabsList from `grid-cols-5` to scrollable horizontal layout on mobile; remove text truncation from tab triggers
- **`src/pages/ResearchPapersPage.tsx`** -- Wrap action buttons in scrollable container; fix compare bar bottom position; optimize filter layout
- **`src/pages/NetworkPage.tsx`** -- Make TabsList scrollable; truncate long text in connection cards
- **`src/pages/ProfilePage.tsx`** -- Make TabsList scrollable; ensure badge wrapping
- **`src/pages/EarnPage.tsx`** -- Make TabsList scrollable; verify bottom padding
- **`src/pages/AuthPage.tsx`** -- Add `text-base` to inputs to prevent iOS zoom
- **`src/pages/MessagesPage.tsx`** -- Add `text-base` to search input
- **`src/pages/ResearchPapersPage.tsx`** -- Fix compare floating bar position on mobile

### No new files or dependencies needed.
