

# Make Everything 100% Mobile Friendly

A targeted pass across all landing page sections and the Paper Reader page to ensure every element looks and works perfectly on small screens.

---

## 1. Paper Reader Page (`PaperReaderPage.tsx`)

**Current issues:** Sidebar AI Summarizer is hidden below content on mobile with no way to scroll to it easily. The sticky bottom bar overlaps the mobile bottom nav. Header metadata overflows on narrow screens.

**Fixes:**
- Move the AI Summarizer sidebar **above** the paper sections on mobile (reorder grid so sidebar comes first on small screens, or use a collapsible sheet)
- Add `pb-20` to the page container so the sticky bottom bar clears the MobileBottomNav
- Increase bottom bar's `bottom` to sit above the nav (`bottom-16` + safe area)
- Truncate long metadata items (authors, journal) and make them wrap gracefully
- Make the DOI button text smaller and ensure it doesn't overflow

## 2. Global Network Map (`GlobalNetworkMap.tsx`)

**Current issues:** Labels only show on hover (unusable on touch). The map is too small on mobile.

**Fixes:**
- Show 3-4 key labels permanently on mobile (not hover-dependent)
- Increase dot sizes on mobile for better touch visibility
- Reduce aspect ratio on mobile so the map takes less vertical space

## 3. WhyChoose Before/After Section (`WhyChooseSection.tsx`)

**Current issues:** On mobile the 2-column grid stacks but the "With" header is hidden (`hidden md:block`), making it confusing which cards are "without" and which are "with". Items appear as interleaved cards without context.

**Fixes:**
- On mobile, show grouped layout: all "Without" items together under a header, then all "With" items together
- Alternatively, stack each comparison pair as a single card with both without/with inside it
- Ensure minimum touch target of 44px on all interactive elements

## 4. Research Discovery Section (`ResearchDiscoverySection.tsx`)

**Current issues:** The search bar's inner button is cramped on mobile. The 4-column paper grid doesn't adapt well to small screens. The search input with `pr-28` pushes the button out of view on very narrow screens.

**Fixes:**
- Change paper grid to `grid-cols-1 sm:grid-cols-2` instead of jumping straight to `md:grid-cols-2 lg:grid-cols-4`
- Make the search button stack below the input on very small screens, or reduce `pr-28` and make button smaller
- Add horizontal scroll for the stats row on very small screens

## 5. Testimonials Section (`TestimonialsSection.tsx`)

**Current issues:** On mobile, 6 cards stacked vertically creates excessive scroll. Long institution names can overflow.

**Fixes:**
- Show only 3 testimonials on mobile with a "Show more" toggle, or use a horizontal scroll carousel
- Ensure all text truncates properly

## 6. Featured Tools Carousel (`FeaturedToolsCarousel.tsx`)

**Current issues:** Works well already with horizontal scroll. Minor: the header badge and title can collide on very narrow screens.

**Fixes:**
- Stack the header (title above, nav arrows below) on mobile
- Ensure scroll snap works smoothly with momentum scrolling (`-webkit-overflow-scrolling: touch`)

## 7. How It Works Section (`HowItWorksSection.tsx`)

**Current issues:** On mobile the steps stack but the connecting line is hidden. No visual flow between steps.

**Fixes:**
- Add a vertical connecting line on mobile between steps (instead of the horizontal one)
- Reduce padding for tighter mobile layout

## 8. Footer (`Footer.tsx`)

**Current issues:** Footer is hidden on mobile (`!isMobile` check in MainLayout). If shown, the 5-column grid would be cramped.

**Status:** Already hidden on mobile via MainLayout -- this is intentional since the bottom nav handles navigation. No changes needed.

## 9. Hero Section (`HeroSection.tsx`)

**Current issues:** Mostly good. The cycling placeholder input could be taller for easier tapping.

**Fixes:**
- Ensure the search input has `min-h-[44px]` for touch accessibility
- Add `text-base` to inputs to prevent iOS zoom on focus (font-size < 16px triggers auto-zoom)

## 10. Live Activity Feed (`LiveActivityFeed.tsx`)

**Current issues:** Text can be cut off on very narrow screens.

**Fixes:**
- Reduce padding on mobile, allow text to wrap to 2 lines instead of truncating

---

## Technical Details

### Files to modify:

- **`src/pages/PaperReaderPage.tsx`** -- Reorder grid for mobile (sidebar first), fix bottom bar positioning with safe area clearance, improve metadata wrapping
- **`src/components/home/GlobalNetworkMap.tsx`** -- Show permanent labels on mobile, increase dot sizes
- **`src/components/home/WhyChooseSection.tsx`** -- Restructure mobile layout to group without/with items clearly with visible headers
- **`src/components/home/ResearchDiscoverySection.tsx`** -- Fix search bar overflow, improve grid breakpoints
- **`src/components/home/TestimonialsSection.tsx`** -- Add horizontal scroll carousel on mobile instead of vertical stack
- **`src/components/home/FeaturedToolsCarousel.tsx`** -- Stack header on mobile
- **`src/components/home/HowItWorksSection.tsx`** -- Add vertical connecting line for mobile
- **`src/components/home/HeroSection.tsx`** -- Add `text-base` to inputs to prevent iOS zoom, ensure 44px touch targets
- **`src/components/home/LiveActivityFeed.tsx`** -- Allow text wrapping on narrow screens

### No new files or dependencies needed.

