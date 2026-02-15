

# Mobile-Friendly Pass -- Batch 15 (Final Heading Scale + Remaining Table Overflow)

Two final cleanup categories to fully close out the mobile-friendly pass.

---

## Part A: Scale Remaining H1 Headings (10 pages)

These pages have `h1` headings starting at `text-3xl` on mobile without a `text-2xl` base. Add `text-2xl sm:text-3xl` scaling (preserving any existing md/lg breakpoints).

### Dashboard pages (2 pages)
1. **dashboard/ResearcherDashboard.tsx** (line 97) -- `text-3xl font-bold md:text-4xl` becomes `text-2xl sm:text-3xl font-bold md:text-4xl`
2. **dashboard/StudentDashboard.tsx** (line 81) -- same pattern

### User-facing pages (8 pages)
3. **StudentProfilePage.tsx** (line 163) -- `text-3xl font-bold md:text-4xl` becomes `text-2xl sm:text-3xl font-bold md:text-4xl`
4. **EarnPage.tsx** (line 248) -- `text-3xl font-bold md:text-5xl lg:text-6xl` becomes `text-2xl sm:text-3xl font-bold md:text-5xl lg:text-6xl`
5. **SubscriptionsPage.tsx** (line 159) -- `text-3xl font-bold md:text-4xl` becomes `text-2xl sm:text-3xl font-bold md:text-4xl`
6. **PrivacyPolicyPage.tsx** (line 16) -- `text-3xl md:text-4xl` becomes `text-2xl sm:text-3xl md:text-4xl`
7. **TermsOfServicePage.tsx** (line 16) -- same pattern
8. **CookiePolicyPage.tsx** (line 17) -- same pattern
9. **UserPublicProfilePage.tsx** (line 177) -- `text-3xl md:text-4xl` becomes `text-2xl sm:text-3xl md:text-4xl`
10. **PricingPage.tsx** (line 266) -- `text-3xl md:text-5xl` becomes `text-2xl sm:text-3xl md:text-5xl`

---

## Part B: Wrap Remaining Tables in `overflow-x-auto` (8 pages, ~14 tables)

These pages render `<Table>` directly without a scrollable wrapper.

11. **admin/AdminStewardshipPage.tsx** -- 2 tables (lines 235, 284). Wrap each in `<div className="overflow-x-auto">`.
12. **AffiliateDashboardPage.tsx** -- 1 table (line 643). Wrap in overflow container.
13. **InstitutionContractPage.tsx** -- 1 table (line 159). Wrap in overflow container.
14. **OrganizationMembersPage.tsx** -- 1 table (line 218). Wrap in overflow container.
15. **AdminEnterprisePage.tsx** -- 3 tables (lines 176, 262, 324). Wrap each.
16. **AdminAffiliatePage.tsx** -- 1 table (line 243). Wrap in overflow container.
17. **admin/AdminHealthPage.tsx** -- 2 tables (lines 111, 145). Wrap each.
18. **admin/AdminPermissionsPage.tsx** -- 3 tables (lines 230, 306, 378). Wrap each.
19. **admin/AdminFeedModerationPage.tsx** -- 1 table (line 224). Wrap in overflow container.

---

## Technical Details

### Heading scale pattern:

Before:
```text
<h1 className="text-3xl font-bold md:text-4xl">
```

After:
```text
<h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
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

For tables inside conditional rendering (ternary), the wrapper goes around the `<Table>` only, not around the empty state.

### Files to modify:

- `src/pages/dashboard/ResearcherDashboard.tsx`
- `src/pages/dashboard/StudentDashboard.tsx`
- `src/pages/StudentProfilePage.tsx`
- `src/pages/EarnPage.tsx`
- `src/pages/SubscriptionsPage.tsx`
- `src/pages/PrivacyPolicyPage.tsx`
- `src/pages/TermsOfServicePage.tsx`
- `src/pages/CookiePolicyPage.tsx`
- `src/pages/UserPublicProfilePage.tsx`
- `src/pages/PricingPage.tsx`
- `src/pages/admin/AdminStewardshipPage.tsx`
- `src/pages/AffiliateDashboardPage.tsx`
- `src/pages/InstitutionContractPage.tsx`
- `src/pages/OrganizationMembersPage.tsx`
- `src/pages/AdminEnterprisePage.tsx`
- `src/pages/AdminAffiliatePage.tsx`
- `src/pages/admin/AdminHealthPage.tsx`
- `src/pages/admin/AdminPermissionsPage.tsx`
- `src/pages/admin/AdminFeedModerationPage.tsx`

### No new files or dependencies needed.
