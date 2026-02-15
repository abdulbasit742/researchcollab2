

# Performance Optimization Pass

## Problem

All 180+ page components are statically imported in `App.tsx`. Every page is bundled into a single JavaScript file, meaning users download the entire app on first visit even though they only see one page. This is the single biggest performance bottleneck.

## Plan

### 1. Lazy-load all page routes (HIGH IMPACT)

Convert every page import in `App.tsx` from static to `React.lazy()` with a `Suspense` boundary. Only the landing page (`Index`) and `AuthPage` will remain as static imports for fastest initial load.

**Before:**
```
import ProfilePage from "./pages/ProfilePage";
import ToolsPage from "./pages/ToolsPage";
// ... 170+ more
```

**After:**
```
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
// ... 170+ more
```

A `<Suspense fallback={<LoadingScreen />}>` wrapper will be added around `<Routes>` to show the existing loading spinner during chunk loads.

This will split the bundle into ~180 separate chunks, loaded on demand. Expected initial bundle reduction: **60-80%**.

### 2. Group admin routes into a single lazy chunk (MEDIUM IMPACT)

All ~40 admin pages will be consolidated behind a single lazy-loaded admin route wrapper, so they share one chunk that only loads when an admin visits `/admin/*`.

### 3. Optimize QueryClient defaults (LOW IMPACT)

Add sensible defaults to prevent unnecessary refetches:

```
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min
      gcTime: 10 * 60 * 1000,       // 10 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

---

## Technical Details

### Files to modify

| File | Change |
|------|--------|
| `src/App.tsx` | Replace ~180 static imports with `React.lazy()`, add `Suspense` boundary, update `QueryClient` defaults |

### What stays static (for instant first paint)
- `Index` (landing page)
- `AuthPage` (login/signup)
- `NotFound` (404)
- All providers, layout components, and UI primitives

### Estimated impact
- Initial JS payload: reduced by 60-80%
- Time to Interactive on landing page: significantly faster
- Subsequent page navigations: small delay on first visit (chunk load), then cached

