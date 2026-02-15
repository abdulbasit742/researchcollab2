

# Mobile-Friendly Pass -- Batch 12 (Remaining Pages with Manual Navbar/MobileBottomNav)

Migrate pages that manually render `<Navbar />` and `<MobileBottomNav />` (or just `<Navbar />`) to use the standardized `MainLayout` component, and wrap standalone pages missing all navigation.

---

## Problem

After Batches 9-11, there are still pages that:
- Manually import and render `<Navbar />` and `<MobileBottomNav />` instead of using `MainLayout` (which provides both plus Footer, SwipeBackNavigator, PWA banner, etc.)
- Import `<Navbar />` only, missing `MobileBottomNav` entirely
- Have no navigation wrapper at all

---

## Pages to Migrate (13 total)

### Group A: Pages with manual Navbar + MobileBottomNav (5 pages)

These pages manually render both components. Replace the outer `div > Navbar > main > MobileBottomNav` pattern with `<MainLayout>`.

1. **AutomationPage.tsx** -- Replace manual Navbar/MobileBottomNav with MainLayout. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

2. **HRPage.tsx** -- Same migration. Scale heading.

3. **LearningPage.tsx** -- Same migration. Scale heading.

4. **ProjectManagementPage.tsx** -- Same migration. Scale heading.

5. **EventsPage.tsx** -- Same migration. Scale heading.

6. **FeaturesShowcasePage.tsx** -- Same migration. Large file (1041 lines) -- just swap the wrapper, keep all content.

### Group B: Pages with Navbar only, missing MobileBottomNav (4 pages)

7. **DeveloperApiDashboardPage.tsx** -- Has Navbar but no MobileBottomNav. Wrap in MainLayout. Scale heading `text-3xl` to `text-2xl sm:text-3xl`.

8. **ReputationExportPage.tsx** -- Same. Scale heading. Header row `flex items-center justify-between` -- stack with `flex-col sm:flex-row gap-4`.

9. **ResearchPapersPage.tsx** -- Has Navbar but no MobileBottomNav. Wrap in MainLayout. Heading already scaled.

10. **CareerPage.tsx** -- Has Navbar + Footer manually. Wrap in MainLayout (which provides Footer on desktop). Remove manual Footer import.

11. **ProfileSettingsPage.tsx** -- Has Navbar + Footer manually. Same treatment as CareerPage.

### Group C: Pages with no navigation at all (2 pages)

12. **GovernancePage.tsx** -- No Navbar or MobileBottomNav. Wrap in MainLayout. Remove outer `min-h-screen bg-background` div. Heading and header row already responsive.

13. **GovernanceConstitutionPage.tsx** -- No navigation. Wrap in MainLayout. Remove `min-h-screen bg-background` from outer div. Scale heading `text-3xl` to `text-2xl sm:text-3xl`. Change `p-6` to `px-4 py-8`.

14. **InstitutionalAcademicAnalyticsPage.tsx** -- No navigation. Wrap in MainLayout. Remove outer `min-h-screen bg-background` div. Scale heading if needed.

---

## Editor Pages (Excluded)

The following editor pages use a custom full-screen toolbar layout intentionally and should NOT be wrapped in MainLayout:
- SpreadsheetEditorPage.tsx
- PresentationEditorPage.tsx
- DocumentEditorPage.tsx
- PaperReaderPage.tsx

These have their own back-navigation buttons and are designed as standalone editing experiences.

---

## Technical Details

### Migration pattern for Group A (Navbar + MobileBottomNav):

Before:
```text
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

<div className="min-h-screen bg-background">
  <Navbar />
  <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
    ...content...
  </main>
  <MobileBottomNav />
</div>
```

After:
```text
import { MainLayout } from "@/components/layout/MainLayout";

<MainLayout>
  <div className="container mx-auto px-4 py-8">
    ...content...
  </div>
</MainLayout>
```

Remove `pb-20 md:pb-8` since MainLayout handles bottom clearance. Remove `min-h-screen bg-background` since MainLayout provides these.

### Migration pattern for Group B (Navbar only):

Same as above but also removes the missing MobileBottomNav gap.

### Migration pattern for Group C (no navigation):

Before:
```text
<div className="min-h-screen bg-background">
  <div className="container mx-auto px-4 py-8 space-y-6">
    ...content...
  </div>
</div>
```

After:
```text
<MainLayout>
  <div className="container mx-auto px-4 py-8 space-y-6">
    ...content...
  </div>
</MainLayout>
```

### Files to modify:

- `src/pages/AutomationPage.tsx`
- `src/pages/HRPage.tsx`
- `src/pages/LearningPage.tsx`
- `src/pages/ProjectManagementPage.tsx`
- `src/pages/EventsPage.tsx`
- `src/pages/FeaturesShowcasePage.tsx`
- `src/pages/DeveloperApiDashboardPage.tsx`
- `src/pages/ReputationExportPage.tsx`
- `src/pages/ResearchPapersPage.tsx`
- `src/pages/CareerPage.tsx`
- `src/pages/ProfileSettingsPage.tsx`
- `src/pages/GovernancePage.tsx`
- `src/pages/GovernanceConstitutionPage.tsx`
- `src/pages/InstitutionalAcademicAnalyticsPage.tsx`

### No new files or dependencies needed.

