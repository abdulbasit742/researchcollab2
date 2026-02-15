

# Mobile-Friendly Pass -- Batch 14 (Redundant Wrappers + Table Overflow)

Two cleanup categories to finish the mobile pass: remove redundant `min-h-screen bg-background` divs inside MainLayout, and wrap unwrapped `<Table>` components in `overflow-x-auto` containers to prevent horizontal overflow on mobile.

---

## Part A: Remove Redundant `min-h-screen bg-background` Inside MainLayout (3 files)

MainLayout already provides `min-h-screen` and `bg-background`. These pages have leftover inner divs duplicating those classes.

1. **AffiliateDashboardPage.tsx** -- Four return branches each have `<div className="min-h-screen bg-background py-8">` inside `<MainLayout>`. Remove `min-h-screen bg-background` from all four, keeping `py-8` / `py-16`.

2. **AffiliateAssetsPage.tsx** -- One return with `<div className="min-h-screen bg-background py-8">` inside `<MainLayout>`. Remove `min-h-screen bg-background`, keep `py-8`.

3. **CareersPage.tsx** -- One return with `<div className="min-h-screen bg-background">` inside `<MainLayout>`. Remove the redundant div entirely (content sections have their own padding).

---

## Part B: Wrap Tables in `overflow-x-auto` (5 files, 8 tables)

These pages render `<Table>` components directly inside `<CardContent>` without a scrollable wrapper, causing horizontal overflow on narrow screens.

4. **OrganizationBillingPage.tsx** -- 6-column invoice table (line 161). Wrap in `<div className="overflow-x-auto">`.

5. **AdminAIPricingPage.tsx** -- 7-column AI-scoped projects table (line 322). Wrap in `<div className="overflow-x-auto">`.

6. **admin/AdminPremiumAnalyticsPage.tsx** -- Two tables: 5-column feature impact table (line 420) and 4-column role breakdown table (line 499). Wrap both in `<div className="overflow-x-auto">`.

7. **admin/AdminPricingPage.tsx** -- A/B test results table with `flex items-center justify-between` header (line 394). Wrap in `<div className="overflow-x-auto">` if it contains a `<Table>`.

8. **ResearcherPublicProfilePage.tsx** -- Scale heading from `text-3xl md:text-4xl` to `text-2xl sm:text-3xl md:text-4xl` (line 259) for better small-screen fit.

---

## Technical Details

### Redundant wrapper removal pattern:

Before:
```text
<MainLayout>
  <div className="min-h-screen bg-background py-8">
    <div className="container ...">
```

After:
```text
<MainLayout>
  <div className="py-8">
    <div className="container ...">
```

### Table overflow pattern:

Before:
```text
<CardContent>
  <Table>
    ...
  </Table>
</CardContent>
```

After:
```text
<CardContent>
  <div className="overflow-x-auto">
    <Table>
      ...
    </Table>
  </div>
</CardContent>
```

### Files to modify:

- `src/pages/AffiliateDashboardPage.tsx`
- `src/pages/AffiliateAssetsPage.tsx`
- `src/pages/CareersPage.tsx`
- `src/pages/OrganizationBillingPage.tsx`
- `src/pages/AdminAIPricingPage.tsx`
- `src/pages/admin/AdminPremiumAnalyticsPage.tsx`
- `src/pages/ResearcherPublicProfilePage.tsx`

### No new files or dependencies needed.

