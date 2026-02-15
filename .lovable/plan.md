

# Mobile-Friendly Pass -- Batch 8 (Deep Sweep)

Fix remaining pages that lack Navbar/MobileBottomNav, have missing padding, header overflow, badge wrapping issues, or grid overflows on mobile.

---

## 1. Economic Fairness Page (`EconomicFairnessPage.tsx`)

- No Navbar or MobileBottomNav -- standalone page with only `p-6` padding
- Wrap in MainLayout (or add Navbar + MobileBottomNav + `pb-20`)
- Scale heading: `text-2xl sm:text-3xl`
- Card content grid `grid-cols-2` overflows on mobile with JSON data -- change to `grid-cols-1 sm:grid-cols-2`
- Replace `p-6` with `px-4 py-6 sm:p-6`

## 2. Constitutional Health Page (`ConstitutionalHealthPage.tsx`)

- No Navbar or MobileBottomNav -- standalone page
- Wrap in MainLayout (or add Navbar + MobileBottomNav + `pb-20`)
- Header row: `flex items-center justify-between` -- stack title and "Run Audit" button with `flex-col sm:flex-row` and `gap-4`
- Scale heading: `text-2xl sm:text-3xl`
- Active violations text `text-4xl` -- scale to `text-3xl sm:text-4xl` (line 95, 119)
- Replace `p-6` with `px-4 py-6 sm:p-6`

## 3. Macro Risk Page (`MacroRiskPage.tsx`)

- No Navbar or MobileBottomNav -- standalone page
- Wrap in MainLayout (or add Navbar + MobileBottomNav + `pb-20`)
- Header row: stack title and "Compute Risk" button with `flex-col sm:flex-row`
- Scale risk score text `text-4xl` to `text-3xl sm:text-4xl` (line 86)

## 4. Market Liquidity Page (`MarketLiquidityPage.tsx`)

- No Navbar or MobileBottomNav -- standalone page
- Wrap in MainLayout (or add Navbar + MobileBottomNav + `pb-20`)
- Header row: stack title and "Refresh Index" button with `flex-col sm:flex-row`
- Summary cards grid `md:grid-cols-4`: add `grid-cols-2 sm:grid-cols-2 md:grid-cols-4` for mobile

## 5. Global Rankings Page (`GlobalRankingsPage.tsx`)

- Has Navbar but no MobileBottomNav (already has `pb-20` -- good)
- Ranking row badges `flex items-center gap-3` may overflow -- add `flex-wrap`
- Scale heading: `text-2xl sm:text-3xl`

## 6. Global Liquidity Analytics Page (`GlobalLiquidityAnalyticsPage.tsx`)

- Has Navbar but no MobileBottomNav (already has `pb-20` -- good)
- Region detail badges `flex items-center gap-3` overflow on mobile -- add `flex-wrap`
- Scale heading: `text-2xl sm:text-3xl`
- Stat card text `text-3xl` is fine

## 7. Interdisciplinary Page (`InterdisciplinaryPage.tsx`)

- Uses MainLayout (good), container missing `px-4` (line 63: `container py-8`)
- Empty state padding: `p-12` to `p-6 sm:p-12` (lines 217, 292)
- Scale heading: `text-2xl sm:text-3xl`

## 8. Outcome Feed Page (`OutcomeFeedPage.tsx`)

- Uses MainLayout (good), container missing `px-4` (line 84: `container py-6`)

## 9. Reality Feed Page (`RealityFeedPage.tsx`)

- Uses MainLayout (good), container missing `px-4` (line 74: `container py-6`)

---

## Technical Details

### Files to modify:

- **`src/pages/EconomicFairnessPage.tsx`** -- Wrap in MainLayout, fix padding, scale heading, make grid responsive
- **`src/pages/ConstitutionalHealthPage.tsx`** -- Wrap in MainLayout, stack header, scale heading and large numbers, fix padding
- **`src/pages/MacroRiskPage.tsx`** -- Wrap in MainLayout, stack header, scale score text
- **`src/pages/MarketLiquidityPage.tsx`** -- Wrap in MainLayout, stack header, fix summary grid breakpoints
- **`src/pages/GlobalRankingsPage.tsx`** -- Wrap badges, scale heading
- **`src/pages/GlobalLiquidityAnalyticsPage.tsx`** -- Wrap badges, scale heading
- **`src/pages/InterdisciplinaryPage.tsx`** -- Add `px-4`, reduce empty state padding, scale heading
- **`src/pages/OutcomeFeedPage.tsx`** -- Add `px-4` to container
- **`src/pages/RealityFeedPage.tsx`** -- Add `px-4` to container

### No new files or dependencies needed.

