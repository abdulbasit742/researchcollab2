

# Mobile-Friendly Pass -- Batch 6 (Final Stragglers)

Fix the last set of pages with desktop-first layouts, missing container padding, oversized typography, or task card overflow on mobile.

---

## 1. Help Center Page (`HelpCenterPage.tsx`)

- Missing `px-4` on hero container (line 129: `<div className="container">`)
- Missing `px-4` on content container (line 167: `<div className="container py-16">`)
- Hero padding: `py-16 md:py-24` needs `py-8 sm:py-16 md:py-24`
- Heading: `text-4xl` needs `text-2xl sm:text-4xl`
- Subtext: `text-lg` needs `text-sm sm:text-lg`
- Content section: `py-16` needs `py-6 sm:py-16`
- Section margins: `mb-16` to `mb-8 sm:mb-16`
- Contact card `p-6` to `p-4 sm:p-6`

## 2. Subscriptions Page (`SubscriptionsPage.tsx`)

- Missing `px-4` on hero container (line 149: `<div className="container">`)
- Missing `px-4` on content container (line 170: `<div className="container py-8">`)
- Empty state padding: `p-12` to `p-6 sm:p-12` (lines 256, 294, 336)
- TabsList with 3 tabs may overflow on very small screens -- add `overflow-x-auto` wrapper

## 3. Academic Task Marketplace Page (`AcademicTaskMarketplacePage.tsx`)

- No MobileBottomNav or MainLayout -- missing `pb-20` for bottom nav clearance
- Task card inner layout (line 59): `flex items-center justify-between` causes horizontal overflow on mobile -- stack vertically with `flex-col sm:flex-row`
- Header row (line 86): stack title and "Post Task" button with `flex-col sm:flex-row`
- TabsList with 5 tabs: add `overflow-x-auto` wrapper
- Scale heading: `text-2xl sm:text-3xl`

## 4. Press Kit Page (`PressKitPage.tsx`)

- Missing `px-4` on container (line 78: `<div className="container py-8 max-w-6xl">`)
- Heading: `text-4xl` needs `text-2xl sm:text-4xl`
- Subtext: `text-lg` needs `text-sm sm:text-lg`
- Section margins: `mb-12` to `mb-8 sm:mb-12`
- Separator margins: `my-10` to `my-6 sm:my-10`

## 5. Feed Page (`FeedPage.tsx`)

- Missing `px-4` on container (line 112: `<div className="container py-4 sm:py-6">`)

## 6. Verification Center Page (`VerificationCenterPage.tsx`)

- Heading: `text-3xl` needs `text-2xl sm:text-3xl`
- Verification options grid: `md:grid-cols-3` -- add `grid-cols-1 sm:grid-cols-2` for intermediate screens
- Trust score info grid: same treatment `grid-cols-1 sm:grid-cols-3`

---

## Technical Details

### Files to modify:

- **`src/pages/HelpCenterPage.tsx`** -- Add `px-4`, reduce hero/content padding, scale text, reduce section margins and contact card padding
- **`src/pages/SubscriptionsPage.tsx`** -- Add `px-4`, reduce empty state padding, make TabsList scrollable
- **`src/pages/AcademicTaskMarketplacePage.tsx`** -- Add `pb-20`, stack task card layout on mobile, stack header, scrollable TabsList, scale heading
- **`src/pages/PressKitPage.tsx`** -- Add `px-4`, scale heading/subtext, reduce section margins
- **`src/pages/FeedPage.tsx`** -- Add `px-4` to container
- **`src/pages/VerificationCenterPage.tsx`** -- Scale heading, improve grid breakpoints

### No new files or dependencies needed.

