

# Fix Bottom Nav Sliding Down on Mobile Scroll

## Root Cause
The `MobileBottomNav` uses framer-motion with `initial={{ y: 100 }}` and `animate={{ y: 0 }}`. When framer-motion completes, it sets `transform: translateY(0px)` on the element, which **overwrites** the `style={{ transform: 'translateZ(0)' }}` GPU compositing hint. Without the compositing layer, mobile browsers can shift the fixed nav when the address bar appears/disappears during scrolling.

## Fix

### File: `src/components/layout/MobileBottomNav.tsx`
1. Remove the framer-motion `motion.nav` wrapper entirely and use a plain `<nav>` element instead. The entrance animation is unnecessary for a persistent nav bar and causes the transform conflict.
2. Keep `will-change-transform` and `transform: translateZ(0)` for GPU compositing.
3. This eliminates all transform conflicts and ensures the nav stays pinned at `bottom: 0` at all times.

### Summary of Change
Replace `<motion.nav initial/animate/transition ...>` with a plain `<nav>` that has solid fixed positioning and GPU compositing -- no animation transforms that can interfere with the browser's fixed-position rendering on mobile.

