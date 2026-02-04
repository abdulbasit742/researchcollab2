
# Ambient Professional Intelligence - Integration Completion Plan

## Current Status

The Ambient Professional Intelligence system has already been built with comprehensive components and hooks. This plan completes the integration by adding routing, navigation, real-time updates, and backend automation.

---

## What Already Exists

| Component | Status | Location |
|-----------|--------|----------|
| Core Hook | Complete | `src/hooks/useAmbientIntelligence.ts` |
| Nudge Components | Complete | `src/components/ambient/NudgeCard.tsx`, `NudgeTray.tsx` |
| Deal Health UI | Complete | `src/components/ambient/DealHealthIndicator.tsx` |
| Relationship Entropy | Complete | `src/components/ambient/RelationshipEntropyCard.tsx` |
| Dashboard | Complete | `src/components/ambient/AmbientDashboard.tsx` |
| Standalone Page | Complete | `src/pages/AmbientPage.tsx` |

---

## What Needs to Be Added

### 1. Route Registration

Register the `/ambient` route in App.tsx so users can access the Ambient Intelligence dashboard.

**Changes:**
- Import `AmbientPage` from `./pages/AmbientPage`
- Add route: `<Route path="/ambient" element={<AmbientPage />} />`

### 2. Navigation Integration

Add "Ambient Intelligence" to the main navigation and sidebar so users can discover the feature.

**Locations to update:**
- Admin sidebar (`src/components/admin/AdminSidebar.tsx`)
- Mobile navigation (`src/components/admin/AdminMobileNav.tsx`)
- Main navigation header (if applicable)

**Navigation entry:**
- Icon: Lightbulb
- Label: "Ambient Intelligence"
- Path: `/ambient`
- Group: Platform Features

### 3. Floating Nudge Indicator in Layout

Embed the `FloatingNudgeIndicator` component into the main layout so users see a persistent indicator when nudges are available.

**Changes:**
- Update `MainLayout.tsx` to include the floating indicator
- Connect it to the `useAmbientIntelligence` hook
- Link it to open the NudgeTray or navigate to `/ambient`

### 4. Real-Time Nudge Subscriptions

Add real-time Postgres subscriptions so nudges appear instantly without page refresh.

**Changes to `useAmbientIntelligence.ts`:**
- Subscribe to `ambient_insights` table changes
- Subscribe to `opportunity_alerts` table changes
- Auto-update state on INSERT events
- Clean up subscriptions on unmount

### 5. Backend Ambient Analyzer Edge Function

Create an Edge Function that runs periodic analysis and generates insights.

**Function:** `supabase/functions/ambient-analyzer/index.ts`

**Capabilities:**
- Analyze relationship entropy (identify cooling connections)
- Calculate deal health scores from activity data
- Generate opportunity proximity alerts for high matches
- Create ambient insights based on user patterns

**Trigger:** Can be called on-demand or via scheduled cron

---

## Technical Details

### Route Registration (App.tsx)
```text
Line ~122: Add import for AmbientPage
Line ~208: Add route after /social
```

### Navigation Update (AdminSidebar.tsx)
Add to "Platform Features" group:
```text
- Label: Ambient Intelligence
- Icon: Lightbulb
- Href: /ambient
```

### Floating Indicator Integration (MainLayout.tsx)
```text
- Import FloatingNudgeIndicator from ambient components
- Import useAmbientIntelligence hook
- Render indicator with count and highPriorityCount props
- Position: fixed bottom-right, above mobile nav
```

### Real-Time Subscriptions
```text
useEffect(() => {
  const channel = supabase.channel('ambient-updates')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'ambient_insights' 
    }, handleNewInsight)
    .subscribe();
    
  return () => { supabase.removeChannel(channel); };
}, [user?.id]);
```

### Edge Function: ambient-analyzer
The function will:
1. Query user's connections and calculate interaction decay
2. Query active deals and compute health metrics
3. Match user profile against new opportunities
4. Insert generated insights into `ambient_insights` table
5. Insert alerts into `opportunity_alerts` table

---

## Implementation Summary

| Task | Scope |
|------|-------|
| Register `/ambient` route | 2 lines in App.tsx |
| Add navigation links | 4 locations |
| Floating indicator | ~20 lines in MainLayout |
| Real-time subscriptions | ~30 lines in hook |
| Ambient analyzer function | New Edge Function (~150 lines) |

---

## Success Criteria

- Users can navigate to `/ambient` from the sidebar
- Floating indicator appears when nudges exist
- Real-time updates push new insights instantly
- Backend function generates automated insights based on user activity patterns
