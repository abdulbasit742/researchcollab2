

# Mobile-Friendly Pass -- Batch 4 (Final Sweep)

Polish the remaining pages that still have desktop-first issues: Passport, Governance, Governance Decisions, Datasets, Knowledge, and a wallet balance text fix.

---

## 1. Passport Page (`PassportPage.tsx`)

- Header: Stack title and button vertically on mobile (`flex-col sm:flex-row`)
- Scale heading: `text-2xl sm:text-3xl`
- Empty state: `p-6 sm:p-12`
- History cards: wrap badges on mobile with `flex-wrap`
- Scale balance text in wallet: `text-3xl sm:text-4xl` (line 127)

## 2. Governance Page (`GovernancePage.tsx`)

- Header buttons overflow on mobile -- wrap `flex gap-2` into `flex-wrap gap-2` and stack title/buttons with `flex-col sm:flex-row`
- Scale heading: `text-2xl sm:text-3xl`
- Add `pb-20 md:pb-0` since this page doesn't use MainLayout (uses own Navbar + no built-in bottom padding)

## 3. Governance Decisions Page (`GovernanceDecisionsPage.tsx`)

- Replace `p-6` with `px-4 py-6 sm:p-6`
- Scale heading: `text-2xl sm:text-3xl`
- Add `pb-20` for MobileBottomNav clearance (no MainLayout)
- Card header: wrap title and badge on mobile

## 4. Datasets Page (`DatasetsPage.tsx`)

- Add `px-4` to container (`container py-8` missing horizontal padding)
- Filter selects: change `w-[180px]` to `w-full sm:w-[180px]`
- Empty state: `p-6 sm:p-12`
- Scale heading: `text-2xl sm:text-3xl`

## 5. Knowledge Page (`KnowledgePage.tsx`)

- Add `px-4` to container
- TabsList with 4 tabs: make scrollable with `overflow-x-auto` and `inline-flex` instead of default layout
- Scale tab trigger text: hide label text on mobile, show icons only
- Header action buttons: stack on mobile `flex-col sm:flex-row`
- Empty states: `p-6 sm:p-12`

## 6. Wallet Page (`WalletPage.tsx`)

- Balance text: scale from `text-4xl` to `text-3xl sm:text-4xl` (line 127)

---

## Technical Details

### Files to modify:

- **`src/pages/PassportPage.tsx`** -- Stack header, scale text, reduce empty state padding, wrap history badges
- **`src/pages/GovernancePage.tsx`** -- Wrap header buttons, stack layout, scale heading, add `pb-20`
- **`src/pages/GovernanceDecisionsPage.tsx`** -- Fix padding, scale heading, add `pb-20`, wrap card header
- **`src/pages/DatasetsPage.tsx`** -- Add `px-4`, make filter selects full-width on mobile, reduce empty state padding
- **`src/pages/KnowledgePage.tsx`** -- Add `px-4`, make TabsList scrollable, stack header buttons, reduce empty state padding
- **`src/pages/WalletPage.tsx`** -- Scale balance text

### No new files or dependencies needed.

