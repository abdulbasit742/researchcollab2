

# Mobile-Friendly Pass -- Remaining Inner Pages

Optimize 7 more inner pages that still have desktop-first layouts: Offers, Collaborations, Home Dashboard, Opportunities, Wallet, Notifications, and Search.

---

## Common Issues Across These Pages

- Excessive vertical padding on heroes (`py-16`, `py-24`) wastes mobile screen space
- Missing `px-4` on container divs causes edge-clipping on small screens
- Missing `pb-20` bottom padding for MobileBottomNav clearance
- Some text sizes too large for mobile (`text-4xl`, `text-5xl`, `text-6xl`)
- Empty states with `p-12` padding take too much space on mobile

---

## 1. Offers Page (`OffersPage.tsx`)

- Reduce hero padding: `py-8 sm:py-16 md:py-24`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl lg:text-6xl`
- Add `px-4` to containers
- Reduce content section padding: `py-6 sm:py-16`
- Empty state: `p-6 sm:p-12`
- Add `pb-20 md:pb-0` to page wrapper

## 2. Collaborations Page (`CollaborationsPage.tsx`)

- Same hero padding reduction
- Scale heading down for mobile
- Add `px-4` to containers
- Reduce content padding: `py-6 sm:py-16`
- Fix card title `pr-20` to `pr-16 sm:pr-20` to prevent text squishing
- Stack footer buttons on mobile: `flex-col sm:flex-row`
- Add `pb-20 md:pb-0`

## 3. Home Dashboard (`HomeDashboard.tsx`)

- Add `px-4` to container
- Add `pb-20 md:pb-4` for bottom nav clearance
- Already looks mostly good

## 4. Opportunities Page (`OpportunitiesPage.tsx`)

- Add `px-4` to containers
- Make filter selects full-width on mobile: `w-full sm:w-36`
- Add `pb-20 md:pb-0`

## 5. Wallet Page (`WalletPage.tsx`)

- Reduce balance text on mobile: `text-3xl sm:text-4xl`
- Already has decent mobile classes -- just verify bottom padding `pb-20`

## 6. Notifications Page (`NotificationsPage.tsx`)

- Wrap header actions for mobile -- stack title and buttons
- Move TabsList out of the card header row on mobile (it's too cramped)
- Add `px-4` to container
- Add `pb-20 md:pb-0`
- Reduce ScrollArea height on mobile: `h-[calc(100vh-280px)] sm:h-[600px]`

## 7. Search Page (`SearchPage.tsx`)

- Add `px-4` to containers
- Stack search form on mobile: search button below input
- Add `pb-20 md:pb-0`

---

## Technical Details

### Files to modify:

- **`src/pages/OffersPage.tsx`** -- Reduce padding, scale text, add `px-4` and `pb-20`
- **`src/pages/CollaborationsPage.tsx`** -- Reduce padding, fix card layout, stack buttons, add `pb-20`
- **`src/pages/HomeDashboard.tsx`** -- Add `px-4` and `pb-20`
- **`src/pages/OpportunitiesPage.tsx`** -- Add `px-4`, full-width selects on mobile, add `pb-20`
- **`src/pages/WalletPage.tsx`** -- Scale balance text, verify `pb-20`
- **`src/pages/NotificationsPage.tsx`** -- Fix header layout, responsive tab filters, add `px-4` and `pb-20`
- **`src/pages/SearchPage.tsx`** -- Add `px-4`, stack search form, add `pb-20`

### No new files or dependencies needed.

