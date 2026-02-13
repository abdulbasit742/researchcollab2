

# Set Default Theme to Light

## Problem
The app currently defaults to `"system"` theme, which means users on dark-mode OS settings see dark mode immediately. You want the default to be **light** (white), with users able to switch to dark mode manually.

## Fix

### File: `src/App.tsx` (line 392)
Change `defaultTheme="system"` to `defaultTheme="light"`. This ensures every new visitor sees the light/white theme first. The toggle in the navbar still lets users switch to dark mode, and their preference is saved in local storage for future visits.

