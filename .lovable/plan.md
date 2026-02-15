
# Mobile-Friendly Pass -- Batch 5 (Stragglers)

Fix remaining pages that still have desktop-first hero sections, missing container padding, or oversized typography on mobile.

---

## 1. Smart Matching Page (`SmartMatchingPage.tsx`)

- Missing `px-4` on `.container` divs (lines 78, 124)
- Hero padding too large on mobile: `py-16 md:py-24` needs `py-8 sm:py-16 md:py-24`
- Heading not scaled for mobile: `text-4xl` needs `text-2xl sm:text-4xl`
- Subtext not scaled: `text-lg` needs `text-sm sm:text-lg`
- "How it works" grid: `grid-cols-2 md:grid-cols-4` for mobile (currently jumps straight to 4-col on md)
- Content section: `py-16` needs `py-6 sm:py-16`
- "Top Matches" and "All Matches" section margins too large on mobile: `mb-16` to `mb-8 sm:mb-16`

## 2. Network Page (`NetworkPage.tsx`)

- Missing `px-4` on container (line 116: `container py-6`)
- Empty state `py-12` reduce to `py-6 sm:py-12` (lines 240, 280, 384)

## 3. Social Features Page (`SocialFeaturesPage.tsx`)

- Missing `px-4` on container (line 24)
- Feature comparison grid `grid-cols-4` needs horizontal scroll wrapper or smaller text on mobile (line 222)

## 4. Features Showcase Page (`FeaturesShowcasePage.tsx`)

- Missing `px-4` on `.container` divs (lines 230, 280)
- Missing `pb-20` for MobileBottomNav clearance (uses own Navbar, not MainLayout -- line 280 has `pb-24` which is fine)
- Header icon+text row could overflow on very small screens -- stack on mobile

## 5. Pricing Page (`PricingPage.tsx`)

- Hero section already decent (`py-10 md:py-24`)
- Pricing card text `text-4xl` for price needs `text-3xl sm:text-4xl` (line 319)
- Comparison table at bottom needs horizontal scroll wrapper (already has `overflow-x-auto` on tool table -- verify comparison table too)

---

## Technical Details

### Files to modify:

- **`src/pages/SmartMatchingPage.tsx`** -- Add `px-4`, reduce hero/content padding, scale heading, fix "how it works" grid breakpoints
- **`src/pages/NetworkPage.tsx`** -- Add `px-4` to container, reduce empty state padding
- **`src/pages/SocialFeaturesPage.tsx`** -- Add `px-4`, wrap feature comparison grid for mobile
- **`src/pages/FeaturesShowcasePage.tsx`** -- Add `px-4` to containers, stack header on mobile
- **`src/pages/PricingPage.tsx`** -- Scale pricing card text, verify comparison table scroll

### No new files or dependencies needed.
