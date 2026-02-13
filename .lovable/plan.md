

# Fix Tour Button Mobile Issues

## Problems Identified from Screenshot

1. The "Tour" floating button appears on the authenticated `/home` dashboard where it covers important content ("What Matters Today" items)
2. The tour walkthrough is designed for the public landing page (`/`) but the button renders globally on every page
3. On mobile, the button blocks scrollable content even when positioned above the bottom nav

## Solution

### 1. Restrict Tour Button to Landing Page Only

Update `TourLaunchButton.tsx` to check the current route and only render on the public landing page (`/`). The tour steps all reference landing page elements, so showing the button on `/home`, `/onboarding`, or other authenticated pages makes no sense.

### 2. Improve Mobile Positioning

When visible on the landing page, ensure the button doesn't overlap critical CTAs by:
- Using `bottom-24` on mobile (96px) to clear both the bottom nav and any content
- Adding a slight transparency/smaller size so it's less intrusive

## Files to Modify

| File | Change |
|------|--------|
| `src/components/walkthrough/TourLaunchButton.tsx` | Add `useLocation()` check to only render on `/` route; refine mobile positioning to `bottom-24` |

## Technical Details

```text
TourLaunchButton.tsx changes:
- Import useLocation from react-router-dom
- Add: const location = useLocation()
- Add condition: if pathname !== "/") return null
- Change mobile bottom class from bottom-20 to bottom-24
```

This is a small, focused fix that prevents the tour button from appearing on pages where it's irrelevant and ensures it doesn't block content on mobile.

