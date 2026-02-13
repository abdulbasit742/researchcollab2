
# Fix: Project Detail 404 on `/opportunities/:id`

## Problem
When you click on a posted project from the daily loop / notifications, the URL goes to `/opportunities/[id]` which has no route defined -- resulting in a 404 page.

## Root Cause
In `src/hooks/useDailyLoop.ts` (line 56), opportunity links are generated as `/opportunities/${opp.id}`, but no route exists for that pattern.

## Fix (Two changes)

### 1. Fix the link source
Update `src/hooks/useDailyLoop.ts` line 56 to use `/offers/${opp.id}` instead of `/opportunities/${opp.id}`. This matches the existing route at `/offers/:id` which properly redirects to the project detail page.

### 2. Add a safety redirect route
Add a catch-all redirect in `src/App.tsx` so that `/opportunities/:id` redirects to `/earn/projects/:id`. This prevents future 404s if any other link still uses the old pattern.

```
/opportunities/:id  -->  /earn/projects/:id
```

## Files Modified
1. `src/hooks/useDailyLoop.ts` -- fix href from `/opportunities/` to `/offers/`
2. `src/App.tsx` -- add redirect route for `/opportunities/:id`
