
# Comprehensive Bug Fix & PKR Currency Standardization Plan

## Executive Summary
This plan addresses two major categories of issues discovered in the codebase:
1. **Currency Inconsistency**: Multiple pages display prices in USD ($) instead of PKR, violating the platform's localization strategy for the Pakistan/South Asia market
2. **Mock Data Usage**: Several pages still use hardcoded mock data instead of real database integration

---

## Issues Discovered

### Category 1: Currency Display Issues ($ instead of PKR)

The following files display amounts with "$" or "USD" that need to be converted to PKR:

| File | Issue |
|------|-------|
| `src/components/wallet/WalletCard.tsx` | All balance displays use "$" |
| `src/pages/EarnPage.tsx` | Mock project budgets use "$" (e.g., "$500 - $800") |
| `src/pages/EarnProjectDetailPage.tsx` | Budget and bid amounts use "$" |
| `src/pages/OffersPage.tsx` | Offer budgets display with "$" |
| `src/pages/OfferDetailPage.tsx` | Budget and counter-offer amounts use "$" |
| `src/pages/AffiliateDashboardPage.tsx` | All commission amounts use "$" |
| `src/components/offers/BidModal.tsx` | Bid amounts use "$" |
| `src/pages/StudentProfilePage.tsx` | Hourly rate label says "USD" |
| `src/components/messages/SendOfferModal.tsx` | Has USD as currency option |
| `src/data/offers.ts` | Mock data budgets are in USD |
| `src/data/affiliates.ts` | All earnings/commissions in USD |

**Pages Already Correctly Using PKR:**
- `src/pages/ToolsPage.tsx` 
- `src/pages/WalletPage.tsx` 
- `src/pages/PricingPage.tsx`
- `src/pages/FYPServicesPage.tsx`

### Category 2: Mock Data Still in Use (Should Use Database)

| Page | Current State | Required Change |
|------|---------------|-----------------|
| `EarnPage.tsx` | Uses hardcoded `projects` array | Should use `useEarningProjects` hook |
| `EarnProjectDetailPage.tsx` | Uses `mockProjects` and `mockBids` | Should use `useEarningProject` hook |
| `OffersPage.tsx` | Uses `dummyOffers` from data file | Should use Supabase `offers` table |
| `OfferDetailPage.tsx` | Uses `dummyOffers` and `dummyBids` | Should use Supabase queries |
| `AffiliateDashboardPage.tsx` | Uses `dummyAffiliates`, `dummyConversions` | Should use `useMyAffiliate` hook |

### Category 3: Database Default Currency

| Table | Current Default | Required Change |
|-------|-----------------|-----------------|
| `wallets` | `currency = 'USD'` | Change to `'PKR'` |
| `tool_orders` | `currency = 'USD'` | Change to `'PKR'` |

---

## Implementation Plan

### Phase 1: Database Migration for Currency Defaults

Create a migration to update currency defaults:

```sql
-- Update default currency for wallets table
ALTER TABLE public.wallets 
  ALTER COLUMN currency SET DEFAULT 'PKR';

-- Update default currency for tool_orders table  
ALTER TABLE public.tool_orders
  ALTER COLUMN currency SET DEFAULT 'PKR';

-- Update existing records (if any) to PKR
UPDATE public.wallets SET currency = 'PKR' WHERE currency = 'USD';
UPDATE public.tool_orders SET currency = 'PKR' WHERE currency = 'USD';
```

### Phase 2: Fix Currency Display in Components

#### 2.1 WalletCard.tsx
- Change all `$` prefixes to `PKR `
- Lines 38, 44, 72, 83, 92, 101, 110

#### 2.2 BidModal.tsx
- Change label from `($)` to `(PKR)`
- Change suggested text from `$` to `PKR `

#### 2.3 SendOfferModal.tsx
- Remove USD option from currency dropdown
- Keep only PKR as the currency option

#### 2.4 StudentProfilePage.tsx
- Change "Hourly Rate (USD, optional)" to "Hourly Rate (PKR, optional)"

### Phase 3: Fix Mock Data Pages

#### 3.1 EarnPage.tsx
- Replace hardcoded `projects` array with `useEarningProjects()` hook
- Update budget display format from `$X - $Y` to `PKR X - Y`
- Update `topEarners` mock data to use PKR

#### 3.2 EarnProjectDetailPage.tsx
- Replace `mockProjects` with `useEarningProject(id)` hook
- Replace `mockBids` with real bids from the hook
- Change all `$` displays to `PKR `

#### 3.3 OffersPage.tsx
- Create `useOffers()` hook to fetch from Supabase `offers` table
- Replace `dummyOffers` usage with real data
- Update budget display to PKR

#### 3.4 OfferDetailPage.tsx
- Use Supabase queries for offer and bids data
- Update all currency displays to PKR
- Fix counter-offer modal labels

#### 3.5 AffiliateDashboardPage.tsx
- Use `useMyAffiliate()` hook for real affiliate data
- Update all commission displays from `$` to `PKR `

### Phase 4: Update Mock Data Files

#### 4.1 src/data/offers.ts
- Convert all `budget` values to PKR equivalents (multiply by ~280)
- Or remove mock data entirely if pages are using real DB

#### 4.2 src/data/affiliates.ts
- Convert all commission/earnings to PKR
- Update display logic in pages

---

## Technical Details

### Currency Formatting Helper
Create a utility function for consistent currency display:

```typescript
// src/lib/currency.ts
export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

// Usage: formatPKR(5000) returns "PKR 5,000"
```

### Hook Updates Required

**New Hook: useOffers()**
```typescript
// Fetch offers from database instead of mock data
export function useOffers() {
  const { user } = useAuth();
  // Query offers where user is sender or recipient
  // Return sent and received offers
}
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/wallet/WalletCard.tsx` | Replace $ with PKR |
| `src/components/offers/BidModal.tsx` | Replace $ with PKR |
| `src/components/messages/SendOfferModal.tsx` | Remove USD option |
| `src/pages/StudentProfilePage.tsx` | Update label text |
| `src/pages/EarnPage.tsx` | Use real data + PKR |
| `src/pages/EarnProjectDetailPage.tsx` | Use hooks + PKR |
| `src/pages/OffersPage.tsx` | Create hook + use real data + PKR |
| `src/pages/OfferDetailPage.tsx` | Use real data + PKR |
| `src/pages/AffiliateDashboardPage.tsx` | Use hook + PKR |
| `src/data/offers.ts` | Optional: Update mock values |
| `src/data/affiliates.ts` | Optional: Update mock values |
| `src/lib/currency.ts` | New: Create currency helper |

### New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/currency.ts` | Currency formatting utility |
| `src/hooks/useOffers.ts` | Hook for fetching offers from DB |

---

## Testing Checklist

After implementation, verify:
- [ ] WalletPage displays all amounts in PKR
- [ ] WalletCard component shows PKR everywhere
- [ ] EarnPage shows projects with PKR budgets
- [ ] EarnProjectDetailPage shows PKR for budgets and bids
- [ ] OffersPage displays offer budgets in PKR
- [ ] OfferDetailPage shows PKR amounts
- [ ] AffiliateDashboardPage shows PKR commissions
- [ ] BidModal shows PKR labels
- [ ] SendOfferModal only offers PKR as currency
- [ ] StudentProfilePage shows PKR for hourly rate
- [ ] Database wallets default to PKR
- [ ] Tool orders default to PKR

---

## Priority Order

1. **High Priority**: Currency display fixes (user-facing)
2. **High Priority**: Database migration for defaults
3. **Medium Priority**: Replace mock data with real DB queries
4. **Low Priority**: Update mock data files (may become obsolete)

---

## Estimated Changes

- **Database Migration**: 1 migration file
- **New Files**: 2 (currency utility, offers hook)
- **Modified Files**: ~11 files
- **Lines Changed**: ~200-300 lines across all files
