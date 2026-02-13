

# Fix Consistent Bottom Padding Across All Pages on Mobile

## Problem
13 pages bypass `MainLayout` and use `Navbar` directly. Of these, 7 pages have **no bottom padding** and **no `MobileBottomNav`**, meaning content can be hidden behind the bottom navigation bar on mobile. The remaining 6 already handle it correctly.

## Pages That Need Fixing (7 total)

1. **GlobalRankingsPage** - No bottom padding, no MobileBottomNav
2. **GlobalLiquidityAnalyticsPage** - No bottom padding, no MobileBottomNav
3. **ReputationExportPage** - No bottom padding, no MobileBottomNav
4. **DeveloperApiDashboardPage** - No bottom padding, no MobileBottomNav
5. **ResearchPapersPage** - No bottom padding, no MobileBottomNav
6. **CareerPage** - No bottom padding, no MobileBottomNav
7. **ProfileSettingsPage** - No bottom padding, no MobileBottomNav

## Pages Already Correct (6 total)
- AutomationPage, HRPage, EventsPage, LearningPage, ProjectManagementPage: all have `pb-20 md:pb-8`
- FeaturesShowcasePage: has `pb-24`

## Fix Strategy

For each of the 7 affected pages, add `pb-20 md:pb-8` to the main content container so content clears the bottom nav on mobile but has normal padding on desktop.

### Technical Details

**File: `src/pages/GlobalRankingsPage.tsx`**
- Change the content div class from `"max-w-5xl mx-auto px-4 py-8 space-y-6"` to `"max-w-5xl mx-auto px-4 py-8 pb-20 md:pb-8 space-y-6"`

**File: `src/pages/GlobalLiquidityAnalyticsPage.tsx`**
- Change `"max-w-6xl mx-auto px-4 py-8 space-y-6"` to `"max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8 space-y-6"`

**File: `src/pages/ReputationExportPage.tsx`**
- Change `"max-w-4xl mx-auto px-4 py-8 space-y-6"` to `"max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8 space-y-6"`

**File: `src/pages/DeveloperApiDashboardPage.tsx`**
- Change `"max-w-5xl mx-auto px-4 py-8 space-y-6"` to `"max-w-5xl mx-auto px-4 py-8 pb-20 md:pb-8 space-y-6"`

**File: `src/pages/ResearchPapersPage.tsx`**
- Change `"container py-6 px-4"` to `"container py-6 px-4 pb-20 md:pb-6"`

**File: `src/pages/CareerPage.tsx`**
- Change `"flex-1 container mx-auto px-4 py-6"` to `"flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6"`

**File: `src/pages/ProfileSettingsPage.tsx`**
- Change `"flex-1 container mx-auto px-4 py-8"` to `"flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8"`

This ensures every page in the app has consistent bottom clearance on mobile, preventing any content from being hidden behind the navigation bar.

