

# Mobile-Friendly Pass -- Batch 11 (Standalone Pages Missing Navigation)

Wrap 10 standalone pages that have no Navbar or MobileBottomNav in `MainLayout`, and apply standard mobile fixes (heading scale, header stacking, bottom-nav clearance).

---

## Problem

10 user-facing pages render as standalone `min-h-screen bg-background` containers with no Navbar, no MobileBottomNav, and no bottom padding clearance. On mobile, users cannot navigate away from these pages without using the browser back button.

One page (GovernanceDecisionsPage) has `pb-20` but still lacks Navbar/MobileBottomNav.

---

## Pages to Migrate (10 total)

1. **AcademicOutputAnalyticsPage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

2. **SupervisorPerformancePage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

3. **SupervisorReviewQueuePage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

4. **SupervisorDashboardPage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`. Header row `flex items-center justify-between` -- stack with `flex-col sm:flex-row gap-4`.

5. **FYPDashboardPage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`. Header row `flex items-center justify-between` -- stack with `flex-col sm:flex-row gap-4` (title + "New FYP Project" button).

6. **StudentPerformancePage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

7. **PassportPage.tsx** -- Wrap in `MainLayout`. Heading already scaled. Already has responsive header. Just needs navigation wrapper.

8. **EmployabilityExportPage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

9. **AcademicRankingsPage.tsx** -- Wrap in `MainLayout`. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

10. **GovernanceDecisionsPage.tsx** -- Wrap in `MainLayout`. Already has responsive padding and `pb-20`. Remove the outer `min-h-screen bg-background` div (MainLayout provides this). Keep the `max-w-5xl mx-auto` container.

11. **ProductivityDashboardPage.tsx** -- Wrap in `MainLayout`. Heading already scaled. Just needs navigation wrapper.

12. **AcademicTaskMarketplacePage.tsx** -- Wrap in `MainLayout`. Already has `pb-20`. Keep responsive classes.

---

## Technical Details

### Migration pattern:

Before:
```text
<div className="min-h-screen bg-background">
  <div className="max-w-Xxl mx-auto px-4 py-8 space-y-6">
    ...content...
  </div>
</div>
```

After:
```text
<MainLayout>
  <div className="max-w-Xxl mx-auto px-4 py-8 space-y-6">
    ...content...
  </div>
</MainLayout>
```

MainLayout already provides min-h-screen, bg-background, Navbar, MobileBottomNav, and `pb-20` clearance.

### Files to modify:

- `src/pages/AcademicOutputAnalyticsPage.tsx`
- `src/pages/SupervisorPerformancePage.tsx`
- `src/pages/SupervisorReviewQueuePage.tsx`
- `src/pages/SupervisorDashboardPage.tsx`
- `src/pages/FYPDashboardPage.tsx`
- `src/pages/StudentPerformancePage.tsx`
- `src/pages/PassportPage.tsx`
- `src/pages/EmployabilityExportPage.tsx`
- `src/pages/AcademicRankingsPage.tsx`
- `src/pages/GovernanceDecisionsPage.tsx`
- `src/pages/ProductivityDashboardPage.tsx`
- `src/pages/AcademicTaskMarketplacePage.tsx`

### No new files or dependencies needed.

