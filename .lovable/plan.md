

# Fix Mobile Bottom Navigation Bar Clipping on Scroll

## Problem
On mobile devices, the bottom navigation bar icons get cut off (showing only half) when scrolling. This happens because mobile browsers dynamically resize the viewport when the address bar appears/disappears during scrolling, which can shift fixed-position elements.

## Root Cause
The viewport meta tag uses the default behavior where the browser's dynamic toolbar resizing affects layout. The `min-h-screen` (100vh) also uses the "largest viewport" size, which causes content to shift when the browser chrome appears/disappears.

## Solution

### 1. Update viewport meta tag in `index.html`
Add `interactive-widget=resizes-visual` to the viewport meta tag. This tells the browser that dynamic UI changes (like the address bar hiding) should only affect the **visual viewport**, not the **layout viewport**. This keeps `fixed` elements stable.

```text
Before: width=device-width, initial-scale=1.0
After:  width=device-width, initial-scale=1.0, interactive-widget=resizes-visual
```

### 2. Update `min-h-screen` to use `dvh` in `MainLayout.tsx`
Replace `min-h-screen` (which uses `100vh` -- the largest possible viewport) with `min-h-[100dvh]` (dynamic viewport height). This ensures the layout correctly adjusts to the actual visible area.

### 3. Harden the bottom nav in `MobileBottomNav.tsx`
- Add explicit `will-change-transform` and `transform: translateZ(0)` to force GPU compositing, which prevents the nav from being affected by scroll-triggered viewport changes.
- Ensure the nav background is fully opaque (change from `bg-background/95` to `bg-background`) so icons are never visible through it during transitions.

## Files to Change

| File | Change |
|------|--------|
| `index.html` | Add `interactive-widget=resizes-visual` to viewport meta |
| `src/components/layout/MainLayout.tsx` | Use `min-h-[100dvh]` instead of `min-h-screen` |
| `src/components/layout/MobileBottomNav.tsx` | Add GPU compositing hints and solid background |

