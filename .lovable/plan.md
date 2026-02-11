

# Make Earn Pages 100% Mobile Friendly

## Issues Found

1. **MyProjectsFilterSort** - Fixed-width Select triggers (`w-[140px]`, `w-[160px]`) overflow on small screens. "Filters:" and "Sort:" labels waste space on mobile.
2. **BidStatusTimeline** - The 4-step horizontal timeline with connecting lines gets cramped on narrow screens.
3. **EarnProjectDetailPage bid rows** - Bid info (amount, days, time, dropdown) is `flex` with `gap-4` and doesn't stack properly on mobile. Owner dropdown menu items need touch-friendly sizing.
4. **RecommendedProjects** - Grid is `grid-cols-1 md:grid-cols-3` which is fine, but cards could use slightly more compact padding on mobile.
5. **EarningsDashboardCard** - Uses a local `cn()` function instead of the shared one from `@/lib/utils` (won't break but is inconsistent).
6. **EarnPage hero** - `py-12 md:py-24` is fine but the heading `text-3xl md:text-5xl lg:text-6xl` could use better line-height on mobile.
7. **EarnProjectDetailPage bid section** - The bid row layout `flex-col sm:flex-row` is okay but the inner stats row (`flex items-center gap-4`) overflows on very small screens.
8. **Bottom nav padding** - The page already has `pb-16` via MainLayout for mobile, which is correct.

## Changes

### 1. `src/components/earn/MyProjectsFilterSort.tsx`
- Make the filter bar stack vertically on mobile: change to `flex flex-col sm:flex-row` for the overall layout
- Remove fixed widths on SelectTriggers, use `w-full sm:w-[140px]` and `w-full sm:w-[160px]`
- Hide "Filters:" and "Sort:" text labels on mobile (use `hidden sm:inline`)

### 2. `src/components/earn/BidStatusTimeline.tsx`
- Make the timeline more compact on small screens: reduce connector width from `w-4` to `w-2 sm:w-4`
- Reduce icon container from `h-6 w-6` to `h-5 w-5 sm:h-6 sm:w-6` 
- Hide status text label on very small screens (`hidden sm:inline`)

### 3. `src/pages/EarnProjectDetailPage.tsx` (bid rows)
- Make the bid info section stack on mobile: change inner stats to `flex flex-wrap items-center gap-2 sm:gap-4`
- Ensure the owner dropdown is always accessible (already uses icon button, just ensure touch target)
- Make the bid row padding smaller on mobile: `p-2 sm:p-3`

### 4. `src/components/earn/EarningsDashboardCard.tsx`
- Import `cn` from `@/lib/utils` instead of the local function
- Make stat items slightly more compact on mobile with `gap-2 sm:gap-3`

### 5. `src/components/earn/RecommendedProjects.tsx`
- Already responsive, just tighten padding on mobile: `p-3 sm:p-4` on inner cards

### 6. `src/pages/EarnPage.tsx`
- The hero heading line-height is fine
- Ensure the tab list doesn't clip: already uses ScrollArea which handles this
- No major changes needed -- it's already well-structured

### 7. `src/components/earn/MyProjectCard.tsx`
- Footer buttons: add `w-full sm:w-auto` to each button on mobile so they stack nicely
- Change footer to `flex flex-col sm:flex-row` for button stacking

## Technical Details

### Files Modified (7 files)

| File | Change |
|------|--------|
| `MyProjectsFilterSort.tsx` | Stack layout vertically on mobile, full-width selects |
| `BidStatusTimeline.tsx` | Compact sizes, hide text on xs screens |
| `EarnProjectDetailPage.tsx` | Wrap bid info, smaller padding on bid rows |
| `EarningsDashboardCard.tsx` | Use shared `cn`, tighter mobile gaps |
| `RecommendedProjects.tsx` | Tighter card padding on mobile |
| `EarnPage.tsx` | Minor touch-up on spacing |
| `MyProjectCard.tsx` | Stack footer buttons on mobile |

### No Database Changes
All changes are CSS/layout only.

