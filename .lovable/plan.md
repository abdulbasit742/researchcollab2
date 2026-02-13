

# Fix Bottom Nav Icons Getting Clipped

## Problem
The bottom navigation bar has a fixed height of `h-16` (64px), but the `safe-area-bottom` class adds extra padding inside via `padding-bottom: env(safe-area-inset-bottom)`. This pushes the icon content down within the fixed-height container, causing icons and labels to be clipped at the bottom.

## Fix

### File: `src/components/layout/MobileBottomNav.tsx`
- Remove the fixed `h-16` from the inner flex container
- Instead, apply explicit padding: `pt-2 pb-2` for the content area
- Move `safe-area-bottom` so it adds padding **below** the content naturally
- Use `pb-[env(safe-area-inset-bottom)]` or keep the class but remove the fixed height so the nav expands to fit content + safe area

Specifically:
1. On the outer `<nav>`, remove `safe-area-bottom` class
2. Change the inner `<div>` from `h-16` to `py-2` so it sizes to content
3. Add a separate safe-area spacer div at the bottom of the nav, OR use `pb-[max(0.5rem,env(safe-area-inset-bottom))]` on the outer nav

This ensures the nav always shows all icons fully, regardless of device safe area insets.
