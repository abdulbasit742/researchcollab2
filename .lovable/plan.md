

# Mobile-Friendly Pass -- Batch 13 (Remaining Heading Scale + Header Stacking)

Fix the last ~20 pages with unscaled `text-3xl` h1 headings and unstacked header rows that overflow on mobile.

---

## Problem

After Batches 9-12, all pages use the correct layout wrappers (MainLayout / AdminLayout). However, roughly 20 pages still have `h1` elements with `text-3xl` that are not responsively scaled down for mobile, and several have side-by-side header rows (`flex items-center justify-between`) that don't stack on narrow screens.

---

## Pages to Fix (20 total)

### User-facing pages (11 pages)

1. **MobilityPage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
2. **NotificationSettingsPage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
3. **AffiliateAssetsPage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
4. **AffiliateDashboardPage.tsx** -- Three `h1` elements with `text-3xl`: scale all to `text-2xl sm:text-3xl`. Header row `flex items-center justify-between` (line 275) -- stack with `flex-col sm:flex-row gap-4`.
5. **InstitutionApplyPage.tsx** -- Two `h1` elements with `text-3xl`: scale both to `text-2xl sm:text-3xl`.
6. **InstitutionRankingsPage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
7. **InstallPage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
8. **AIProjectScopePage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
9. **FYPServicesPage.tsx** -- Two section `h2` headings with `text-3xl`: scale to `text-2xl sm:text-3xl`.
10. **OrganizationsListPage.tsx** -- Scale `h1` from `text-3xl` to `text-2xl sm:text-3xl`.
11. **SubscriptionsPage.tsx** -- Already has `text-3xl md:text-4xl` which is acceptable (scales up not down). **Skip** -- no change needed.

### Admin pages (9 pages)

12. **AdminHealthPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row `flex items-center justify-between` -- stack with `flex-col sm:flex-row gap-4`.
13. **AdminDeploymentPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row -- stack.
14. **AdminFeatureFlagsPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header already has `flex-col sm:flex-row`.
15. **AdminFederationPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row -- stack.
16. **AdminSecurityPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row -- stack.
17. **AdminPermissionsPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row -- stack.
18. **AdminAIGovernancePage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row -- stack.
19. **AdminSchemaPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`.
20. **AdminReproducibilityPage.tsx** -- Scale `h1` to `text-2xl sm:text-3xl`. Header row -- stack.

---

## Technical Details

### Heading scale pattern:

Before:
```text
<h1 className="text-3xl font-bold">Title</h1>
```

After:
```text
<h1 className="text-2xl sm:text-3xl font-bold">Title</h1>
```

### Header stacking pattern:

Before:
```text
<div className="flex items-center justify-between">
```

After:
```text
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
```

### Files to modify:

- `src/pages/MobilityPage.tsx`
- `src/pages/NotificationSettingsPage.tsx`
- `src/pages/AffiliateAssetsPage.tsx`
- `src/pages/AffiliateDashboardPage.tsx`
- `src/pages/InstitutionApplyPage.tsx`
- `src/pages/InstitutionRankingsPage.tsx`
- `src/pages/InstallPage.tsx`
- `src/pages/AIProjectScopePage.tsx`
- `src/pages/FYPServicesPage.tsx`
- `src/pages/OrganizationsListPage.tsx`
- `src/pages/admin/AdminHealthPage.tsx`
- `src/pages/admin/AdminDeploymentPage.tsx`
- `src/pages/admin/AdminFeatureFlagsPage.tsx`
- `src/pages/admin/AdminFederationPage.tsx`
- `src/pages/admin/AdminSecurityPage.tsx`
- `src/pages/admin/AdminPermissionsPage.tsx`
- `src/pages/admin/AdminAIGovernancePage.tsx`
- `src/pages/admin/AdminSchemaPage.tsx`
- `src/pages/admin/AdminReproducibilityPage.tsx`

### No new files or dependencies needed.

