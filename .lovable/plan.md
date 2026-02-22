
# Restore All Missing Sections

Currently, your App.tsx redirects ~30+ fully-built pages to other routes (e.g., `/earn` redirects to `/wallet`, `/leaderboard` redirects to `/home`). These pages already have complete UI code but are inaccessible. This plan restores them all as active routes.

## What Changes

**1. Restore Core Feature Pages (App.tsx)**

Convert redirect routes back to actual page routes by adding lazy imports and replacing `<Navigate>` with the real page components for the following sections:

| Route | Page | What It Contains |
|-------|------|-----------------|
| `/earn` | EarnPage | Full earning hub with projects, bids, stats |
| `/leaderboard` | LeaderboardPage | Trust-ranked professional leaderboard |
| `/network` | NetworkPage | Connections, followers, suggestions |
| `/career` | CareerPage | AI career copilot with chat interface |
| `/passport` | PassportPage | W3C verifiable credentials export |
| `/research-papers` | ResearchPapersPage | AI paper analysis, gap detection, lit review |
| `/grants` | GrantsPage | Grant discovery with search and filters |
| `/tools` | ToolsPage | AI tools marketplace |
| `/learning` | LearningPage | Course catalog + learning dashboard |
| `/events` | EventsPage | Event discovery + calendar |
| `/hr` | HRPage | Recruitment dashboard |
| `/automation` | AutomationPage | Workflow automation dashboard |
| `/blog` | BlogPage | Blog with categories + featured posts |
| `/governance` | GovernancePage | Governance pods and decisions |
| `/social` | SocialFeaturesPage | Stories, Reels, Explore, Live |
| `/impact` | ImpactPage | Platform impact metrics + proof-of-value |
| `/equity` | EquityDashboardPage | Equity allocations tracker |

**2. Additional Restored Routes**

| Route | Page |
|-------|------|
| `/subscriptions` | SubscriptionsPage |
| `/install` | InstallPage |
| `/features` | FeaturesShowcasePage |
| `/careers` | CareersPage |
| `/press` | PressKitPage |

## Technical Details

**File modified:** `src/App.tsx` only

- Add ~22 new lazy imports for the restored pages
- Replace corresponding `<Navigate to="...">` redirect routes with `<Route element={<PageComponent />}>` entries
- Keep remaining redirects for truly deprecated/duplicate routes (e.g., `/dashboard/*` still goes to `/home`)
- No new files needed -- all pages already exist with full UI

**What stays redirected (intentionally):**
- `/dashboard/*`, `/my-os`, `/productivity`, `/progress` -- all dashboard variants still go to `/home`
- `/profile/student`, `/profile/researcher` -- profile variants still go to `/profile`
- `/opportunities` still redirects to `/offers` (same page, different URL)
- `/collaborations`, `/projects`, `/contracts` still redirect to `/deals`
- Strategic/visionary pages (civilization, planetary, federation, etc.) stay redirected

This is a single-file change that instantly unlocks 22+ complete feature sections.
