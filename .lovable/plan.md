

# Mobile-Friendly Pass -- Batch 10 (Admin Pages Round 2)

Migrate the remaining 9 admin pages that still use `AdminSidebar` directly (or have no admin wrapper at all) to the standardized `AdminLayout` component.

---

## Problem

After Batch 9 migrated 11 pages, 9 more admin pages were missed. They fall into three categories:

- 7 pages render `AdminSidebar` manually with hardcoded `p-6` and no mobile nav
- 2 pages (Pod Analytics, Passport Analytics) have no admin navigation at all -- they render a standalone `max-w-7xl` container
- 2 pages (Conversion Metrics, Institution Intelligence) wrap in both `MainLayout` and `AdminSidebar`, creating double navigation

---

## Pages to Migrate (9 total)

### Group A: Pages using AdminSidebar directly (5 pages)

1. **AdminInfrastructureCostsPage.tsx** -- Remove outer flex div, AdminSidebar, and `<main>` wrapper. Wrap in `<AdminLayout>`. Header row with h1 + description stays as-is (already responsive).

2. **AdminOperationalHealthPage.tsx** -- Same migration for both loading state (line 63) and main return (line 97). Stack header row (title + Refresh button) with `flex-col sm:flex-row`.

3. **AdminRevenueDashboardPage.tsx** -- Same migration. Has Tabs with 4 triggers and a Table -- add `overflow-x-auto` wrapper on Table containers for mobile. Scale heading.

4. **AdminGlobalExpansionPage.tsx** -- Same migration. Has TabsList with 5 tabs -- add `overflow-x-auto` wrapper. Scale heading from `text-3xl` to `text-2xl sm:text-3xl`.

5. **AdminProfitDashboardPage.tsx** -- Same migration. Has TabsList with 4 tabs. Complexity registry badge rows: add `flex-wrap` on badge containers.

### Group B: Pages with double wrapping -- MainLayout + AdminSidebar (2 pages)

6. **AdminConversionMetricsPage.tsx** -- Remove `MainLayout` and `AdminSidebar`. Wrap in `<AdminLayout>` only. Remove inner `max-w-6xl` container (AdminLayout handles layout).

7. **AdminInstitutionIntelligencePage.tsx** -- Same treatment. Application card action buttons: stack with `flex-col sm:flex-row` on mobile. TabsList with 4 tabs is fine.

### Group C: Pages missing admin nav entirely (2 pages)

8. **AdminPodAnalyticsPage.tsx** -- Wrap in `<AdminLayout>`. Remove standalone `min-h-screen` and `max-w-7xl` container. Scale heading from `text-3xl` to `text-2xl sm:text-3xl`.

9. **AdminPassportAnalyticsPage.tsx** -- Same treatment. Scale heading.

---

## Additional Mobile Fixes

- **OperationalHealth**: Header row `flex items-center justify-between` -- stack with `flex-col sm:flex-row gap-4`
- **RevenueDashboard**: Table containers -- wrap in `overflow-x-auto` div for horizontal scrolling on mobile
- **GlobalExpansion**: TabsList with 5 tabs -- wrap in `overflow-x-auto`; federation/capital card rows `flex items-center justify-between` -- add `flex-wrap`
- **ProfitDashboard**: Complexity registry badge container -- add `flex-wrap`; TabsList -- add `overflow-x-auto`
- **InstitutionIntelligence**: Application review card buttons -- stack vertically on mobile with `flex-col sm:flex-row`; info row spans -- add `flex-wrap`

---

## Technical Details

### Migration pattern (same for all Group A/C):

Before:
```text
<div className="flex min-h-screen bg-background">
  <AdminSidebar />
  <main className="flex-1 p-6 space-y-6">
    ...content...
  </main>
</div>
```

After:
```text
<AdminLayout>
  <div className="space-y-6">
    ...content...
  </div>
</AdminLayout>
```

### Migration pattern for Group B (double wrapped):

Before:
```text
<MainLayout>
  <div className="flex min-h-[calc(100vh-4rem)]">
    <AdminSidebar />
    <main className="flex-1 p-6">
      ...content...
    </main>
  </div>
</MainLayout>
```

After:
```text
<AdminLayout>
  <div className="space-y-6">
    ...content...
  </div>
</AdminLayout>
```

### Files to modify:

- `src/pages/admin/AdminInfrastructureCostsPage.tsx`
- `src/pages/admin/AdminOperationalHealthPage.tsx`
- `src/pages/admin/AdminRevenueDashboardPage.tsx`
- `src/pages/admin/AdminGlobalExpansionPage.tsx`
- `src/pages/admin/AdminProfitDashboardPage.tsx`
- `src/pages/admin/AdminConversionMetricsPage.tsx`
- `src/pages/admin/AdminInstitutionIntelligencePage.tsx`
- `src/pages/admin/AdminPodAnalyticsPage.tsx`
- `src/pages/admin/AdminPassportAnalyticsPage.tsx`

### No new files or dependencies needed.

