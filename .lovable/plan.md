
# Expand sitemap.xml with Missing Public Routes

## What's Already Done
The sitemap already exists with 34 public routes and is referenced in `robots.txt`. However, comparing against the 180+ routes in `App.tsx`, approximately 20 additional public-facing pages are missing.

## Routes to Add

The following publicly accessible pages will be added to the sitemap:

| Route | Priority | Change Frequency |
|-------|----------|-----------------|
| `/hr` | 0.6 | weekly |
| `/automation` | 0.6 | weekly |
| `/projects` | 0.7 | weekly |
| `/social` | 0.6 | weekly |
| `/ambient` | 0.5 | monthly |
| `/collective` | 0.6 | weekly |
| `/briefings` | 0.7 | daily |
| `/career` | 0.7 | weekly |
| `/passport` | 0.6 | weekly |
| `/market-liquidity` | 0.6 | daily |
| `/macro-risk` | 0.5 | weekly |
| `/constitutional-health` | 0.5 | monthly |
| `/analytics/fairness` | 0.5 | weekly |
| `/analytics/global-liquidity` | 0.5 | daily |
| `/analytics/academic-output` | 0.5 | weekly |
| `/academic/tasks` | 0.6 | daily |
| `/academic/rankings` | 0.6 | weekly |
| `/my-os` | 0.6 | weekly |
| `/productivity` | 0.6 | weekly |
| `/opportunity-intelligence` | 0.7 | weekly |
| `/deals` | 0.7 | daily |

## Routes Intentionally Excluded
These remain excluded (matching `robots.txt` Disallow rules and auth-required pages):
- `/admin/*` -- all admin routes
- `/dashboard/*` -- user dashboards
- `/profile/*`, `/u/:id` -- user profiles
- `/workroom/*`, `/messages/*`, `/settings/*` -- private areas
- `/onboarding`, `/org/*` -- auth-required
- `/wallet`, `/subscriptions`, `/affiliate/*`, `/verification/*` -- account features
- `/developer/*`, `/faculty/*`, `/fyp/dashboard` -- role-specific
- `/documents/*`, `/sheets/*`, `/slides/*` -- editor tools
- Dynamic routes like `/blog/:slug`, `/posts/:postId`, `/earn/projects/:id`

## Files to Modify

| File | Change |
|------|--------|
| `public/sitemap.xml` | Add ~21 new URL entries |

## Technical Details
- All new entries use `lastmod` of 2026-02-15 (today)
- Priority values range from 0.5 to 0.7 based on page importance
- Change frequencies set based on expected content update cadence
- Total sitemap will grow from 34 to ~55 entries
