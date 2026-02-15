

# Mobile-Friendly Pass -- Batch 9 (Admin Pages)

Migrate admin pages that use `AdminSidebar` directly (or no admin wrapper) to use the existing `AdminLayout` component, which already provides responsive padding (`p-4 md:p-6`), `AdminMobileNav` for small screens, and proper sidebar handling.

---

## Problem

Many admin pages manually render `<AdminSidebar />` with hardcoded `p-6` padding and no mobile navigation. The `AdminLayout` component already solves this with responsive padding, a mobile hamburger nav, and a sticky search bar -- but these pages bypass it.

Two pages (Deal Intelligence, Global Liquidity) skip admin navigation entirely.

---

## Solution

Wrap all affected admin pages in `<AdminLayout>` instead of manually rendering `<AdminSidebar />`. Remove the outer `div.flex` wrapper and `<main>` tag since `AdminLayout` provides its own.

---

## Pages to Migrate (11 total)

### Group A: Pages using `AdminSidebar` directly (9 pages)

1. **AdminEvolutionSimulatorPage.tsx** -- Remove outer flex div, AdminSidebar import, and `<main>` wrapper. Wrap content in `<AdminLayout>`.
2. **AdminCrisisModePage.tsx** -- Same migration.
3. **AdminFeatureGovernancePage.tsx** -- Same migration. Also fix `grid-cols-3` summary cards to `grid-cols-1 sm:grid-cols-3` for mobile.
4. **AdminPowerAuditPage.tsx** -- Same migration. Scale `text-4xl` decision authority to `text-3xl sm:text-4xl`.
5. **AdminSystemicRiskPage.tsx** -- Same migration (already has good responsive grids).
6. **AdminConstitutionalGuardianPage.tsx** -- Same migration (loading state also needs AdminLayout).
7. **AdminGovernanceOversightPage.tsx** -- Same migration.
8. **AdminRevenueIntelligencePage.tsx** -- Same migration. Add `overflow-x-auto` on TabsList with 6 tabs for mobile.
9. **AdminPricingOptimizerPage.tsx** -- Same migration.

### Group B: Pages missing admin nav entirely (2 pages)

10. **AdminDealIntelligencePage.tsx** -- Wrap in `<AdminLayout>`, remove standalone `max-w-7xl` container (AdminLayout handles layout). Scale heading.
11. **AdminGlobalLiquidityPage.tsx** -- Same treatment. Risk flag rows: add `flex-wrap` on badge containers.

---

## Additional Mobile Fixes Within Pages

- **EvolutionSimulator**: Card content `grid-cols-2` with JSON data -- change to `grid-cols-1 sm:grid-cols-2`
- **CrisisMode**: Header badge row -- add `flex-wrap`
- **FeatureGovernance**: Proposal card header `flex items-center justify-between` -- stack on mobile with `flex-col sm:flex-row`; summary grid `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
- **RevenueIntelligence**: TabsList with 6 tabs -- wrap in `overflow-x-auto` container
- **GlobalLiquidity**: Risk flag rows `flex items-center justify-between` -- add `flex-wrap` for long badge text

---

## Technical Details

### Migration pattern (same for all):

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

### Files to modify:

- `src/pages/admin/AdminEvolutionSimulatorPage.tsx`
- `src/pages/admin/AdminCrisisModePage.tsx`
- `src/pages/admin/AdminFeatureGovernancePage.tsx`
- `src/pages/admin/AdminPowerAuditPage.tsx`
- `src/pages/admin/AdminSystemicRiskPage.tsx`
- `src/pages/admin/AdminConstitutionalGuardianPage.tsx`
- `src/pages/admin/AdminGovernanceOversightPage.tsx`
- `src/pages/admin/AdminRevenueIntelligencePage.tsx`
- `src/pages/admin/AdminPricingOptimizerPage.tsx`
- `src/pages/admin/AdminDealIntelligencePage.tsx`
- `src/pages/admin/AdminGlobalLiquidityPage.tsx`

### No new files or dependencies needed.

