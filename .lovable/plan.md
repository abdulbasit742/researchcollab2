

# Instagram-Style Social Features Integration

## Current State

RCollab already has pre-built Instagram-style UI components that are completely disconnected from the main app:

- **Stories** (`src/components/social/Stories.tsx`) -- Full story viewer with progress bars, tap navigation, gradient backgrounds. Uses mock data only.
- **Reels** (`src/components/social/ReelsViewer.tsx`) -- TikTok-style vertical swipe feed with double-tap like, music disc animation. Mock data only.
- **Explore Grid** (`src/components/social/ExploreGrid.tsx`) -- Instagram discover page with search, trending topics, suggested accounts. Mock data only.
- **Live Streams** (`src/components/social/LiveIndicator.tsx`) -- Live stream bar with viewer modal, floating hearts, chat sidebar. Mock data only.
- **Double-Tap Like** (`src/components/social/DoubleTapLike.tsx`) -- Heart animation on double-tap, floating hearts, emoji reaction picker.

Additionally, the LinkedIn-style posting system (Posts tab, reactions, composer) was just integrated into FeedPage. However, `/feed` currently redirects to `/home`, so users can't access it.

**Key problem**: All social routes (`/feed`, `/social`, `/posts`) redirect to `/home`. The social components exist but are completely inaccessible.

## What We Will Build

### 1. Activate the Feed as a Core Route
Remove the `/feed` redirect and make it a live route with the full social experience: Stories row at the top, Posts tab with LinkedIn-style reactions, and all existing feed tabs.

### 2. Add Feed to Navigation
Add a "Feed" link to both the desktop Navbar and mobile bottom nav so users can access the social experience from anywhere.

### 3. Stories with Database Backend
Connect the Stories component to real data using a new `stories` table. Users can create text-based stories that expire after 24 hours, view others' stories, and see view/like counts.

### 4. Explore/Discover Page
Create a dedicated `/explore` route that uses the ExploreGrid component, connected to real post data for discovery -- trending hashtags, suggested accounts, and content grid.

### 5. Reels Page
Create a dedicated `/reels` route using the ReelsViewer, connected to real posts tagged as reels/short-form content.

### 6. Instagram-Style Profile Grid
Add a grid view tab to the user profile page showing posts in an Instagram-style 3-column grid layout.

### 7. Direct Messages Enhancement
Wire the existing Messages page to support Instagram-style story replies and quick reactions.

### 8. Double-Tap Like on Feed Posts
Integrate the DoubleTapLike component into FeedPostCard so users can double-tap posts to react.

## Technical Plan

### Database Migration
Create a `stories` table:
- `id`, `user_id`, `content` (text), `background_color`, `story_type` (text/image), `created_at`, `expires_at` (auto 24h)
- `story_views` table: `story_id`, `viewer_id`, `viewed_at`
- `story_likes` table: `story_id`, `user_id`
- RLS policies matching existing post security patterns

### Files to Create
- `src/pages/ExplorePage.tsx` -- Explore/discover page using ExploreGrid connected to real data
- `src/pages/ReelsPage.tsx` -- Full-screen reels experience
- `src/hooks/useStories.ts` -- CRUD hooks for stories (create, fetch, view tracking, 24h expiry filtering)
- `src/hooks/useExplore.ts` -- Trending hashtags, suggested accounts, content discovery queries
- `src/components/feed/StoriesRow.tsx` -- Database-connected stories row for the feed page
- `src/components/profile/ProfilePostGrid.tsx` -- Instagram-style 3-column post grid for profile

### Files to Modify
- `src/App.tsx` -- Remove `/feed`, `/social` redirects; add routes for `/feed`, `/explore`, `/reels`
- `src/pages/FeedPage.tsx` -- Add StoriesRow at top of feed, integrate DoubleTapLike on post cards
- `src/components/layout/Navbar.tsx` -- Add "Feed" nav item
- `src/components/layout/MobileBottomNav.tsx` -- Replace one nav item or add Feed tab
- `src/components/feed/FeedPostCard.tsx` -- Wrap with DoubleTapLike for double-tap reactions
- `src/pages/ProfilePage.tsx` -- Add posts grid tab
- `src/components/social/Stories.tsx` -- Connect to database via useStories hook instead of mock data
- `src/components/social/ExploreGrid.tsx` -- Connect to real posts/hashtags via useExplore hook
- `src/components/feed/index.ts` -- Export new components

### Navigation Changes
Desktop navbar adds: Feed (between Dashboard and FYP)
Mobile bottom nav becomes: Dashboard | Feed | Opportunities | Deals | Profile

### No Breaking Changes
- All existing core routes remain untouched
- Feed adds Instagram social layer without affecting professional features
- Stories auto-expire after 24 hours (handled by query filter, no cron needed)

