

# Mobile-Friendly Pass -- Remaining Pages (Batch 3)

Polish the final batch of pages that still have desktop-first layouts: Grants, Jobs, Blog, About, Careers, Contact, and a few utility pages.

---

## Common Issues

- Missing `px-4` on `.container` elements causing edge clipping
- Hero sections with `py-16 md:py-24` wasting space on mobile (no small-screen override)
- Headings at `text-4xl` without mobile scaling
- Content sections with `py-16` not reduced for mobile
- Hero stats row overflowing or being too cramped on narrow screens
- Missing bottom padding for MobileBottomNav clearance on pages not using MainLayout's built-in `pb-20`

---

## 1. Grants Page (`GrantsPage.tsx`)

- Add `px-4` to all `.container` divs
- Reduce hero padding: `py-8 sm:py-16 md:py-24`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl lg:text-6xl`
- Scale subtext: `text-sm sm:text-lg`
- Reduce search/filter row gap and stack button below on mobile
- Content section: `py-6 sm:py-16`
- Newsletter CTA: reduce `p-8` to `p-5 sm:p-8 md:p-12`, scale text
- Empty state padding: `p-6 sm:p-12`

## 2. Jobs Page (`JobsPage.tsx`)

- Add `px-4` to all `.container` divs
- Reduce hero padding: `py-8 sm:py-16 md:py-24`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl lg:text-6xl`
- Scale subtext: `text-sm sm:text-lg`
- Stats grid: already `grid-cols-3` but reduce padding on mobile
- Content section: `py-6 sm:py-16`
- Empty state: `p-6 sm:p-12`

## 3. Blog Page (`BlogPage.tsx`)

- Add `px-4` to all `.container` divs
- Reduce hero padding: `py-8 sm:py-16 md:py-24`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl lg:text-6xl`
- Scale subtext: `text-sm sm:text-lg`
- Content section: `py-6 sm:py-16`
- Featured post metadata: wrap on mobile with `flex-wrap`

## 4. About Page (`AboutPage.tsx`)

- Reduce hero padding: `py-10 sm:py-20`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl`
- Scale subtext: `text-base sm:text-xl`
- Values grid: reduce card padding on mobile `p-4 sm:p-6`
- Capabilities grid: change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`
- Section padding: `py-8 sm:py-16`

## 5. Careers Page (`CareersPage.tsx`)

- Reduce hero padding: `py-10 sm:py-20`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl`
- Scale subtext: `text-base sm:text-xl`
- Hero stats row: stack on very small screens with `flex-wrap`
- Section padding: `py-8 sm:py-16`
- Job card buttons: stack on mobile `flex-col sm:flex-row`

## 6. Contact Page (`ContactPage.tsx`)

- Reduce hero padding: `py-8 sm:py-16 md:py-24`
- Scale heading: `text-2xl sm:text-4xl md:text-5xl`
- Scale subtext: `text-sm sm:text-lg`

## 7. Earn Page hero (`EarnPage.tsx`)

- Reduce hero padding from `py-12 md:py-24` to `py-8 sm:py-12 md:py-24`
- Content padding: already mostly good

---

## Technical Details

### Files to modify:

- **`src/pages/GrantsPage.tsx`** -- Add `px-4`, reduce hero/content padding, scale text, stack search controls on mobile
- **`src/pages/JobsPage.tsx`** -- Add `px-4`, reduce hero/content padding, scale text
- **`src/pages/BlogPage.tsx`** -- Add `px-4`, reduce hero/content padding, scale text, wrap featured post metadata
- **`src/pages/AboutPage.tsx`** -- Reduce hero/section padding, scale text, fix capabilities grid breakpoints
- **`src/pages/CareersPage.tsx`** -- Reduce hero/section padding, scale text, stack stats row and job card buttons
- **`src/pages/ContactPage.tsx`** -- Reduce hero padding, scale text
- **`src/pages/EarnPage.tsx`** -- Reduce hero top padding for mobile

### No new files or dependencies needed.
