

# Money Safety P0: Atomic Escrow, Fee Deduction, and Refund Engine

## Problem Statement

The `deal-runtime` edge function -- the core money movement engine -- is critically broken. It references **14 columns that don't exist** in the database, creates money from nothing during payment release, never deducts platform fees, and has no refund path when deals are cancelled. Every action in this function will fail silently or corrupt data.

This plan fixes the foundation so that every PKR is accounted for at every step.

---

## Critical Bugs Found

| Bug | Severity | Detail |
|-----|----------|--------|
| `offers.amount` doesn't exist | Fatal | Column is `price` |
| `offers.deal_terms` doesn't exist | Fatal | No such column |
| `offers.completed_at` doesn't exist | Fatal | No such column |
| `offers.cancelled_at` doesn't exist | Fatal | No such column |
| `offers.cancellation_reason` doesn't exist | Fatal | No such column |
| `milestones.started_at` doesn't exist | Fatal | No such column |
| `milestones.submission_notes` doesn't exist | Fatal | No such column |
| `milestones.approved_by` doesn't exist | Fatal | No such column |
| `milestones.due_date` doesn't exist | Fatal | Column is `expected_delivery` |
| `disputes.offer_id` doesn't exist | Fatal | Column is `milestone_id` only |
| `disputes.raised_by_id` doesn't exist | Fatal | Column is `initiated_by` |
| `wallet_transactions.user_id` doesn't exist | Fatal | No such column |
| `release_payment` creates money | Critical | Credits provider without debiting buyer escrow |
| `release_payment` skips fees | Critical | `get_platform_fee()` never called |
| `cancel_deal` doesn't refund | Critical | Sets status but leaves money in limbo |

---

## Solution Architecture

### Step 1: Database Migration -- Add Missing Columns

Add the columns the deal lifecycle genuinely needs (rather than changing the edge function to avoid them, since they represent real business data):

**`offers` table -- add:**
- `deal_terms` (text, nullable) -- negotiated terms
- `completed_at` (timestamptz, nullable)
- `cancelled_at` (timestamptz, nullable)
- `cancellation_reason` (text, nullable)

**`milestones` table -- add:**
- `started_at` (timestamptz, nullable) -- when work began
- `submission_notes` (text, nullable) -- provider's submission notes
- `approved_by` (uuid, nullable) -- who approved

**`disputes` table -- add:**
- `offer_id` (uuid, nullable, FK to offers) -- link dispute to deal

**`wallet_transactions` table -- add:**
- `user_id` (uuid, nullable) -- for quick lookup without joining through wallet

### Step 2: Create Atomic Database Function -- `execute_milestone_release`

A single SECURITY DEFINER function that handles the entire payment release atomically:

```text
INPUT: milestone_id, released_by_user_id

1. Lock milestone row (SELECT FOR UPDATE)
2. Verify status = 'approved'
3. Get offer (sender_id = provider, recipient_id = buyer)
4. Calculate platform fee via get_platform_fee(provider_id, amount)
5. Net amount = milestone.amount - platform_fee
6. Get buyer's wallet -> debit escrow_balance by milestone.amount
7. Get provider's wallet -> credit available_balance by net_amount
8. Get platform wallet -> credit available_balance by platform_fee
9. Create 3 wallet_transactions:
   - buyer: type='escrow_release', amount=-milestone.amount
   - provider: type='milestone_release', amount=+net_amount
   - platform: type='commission', amount=+platform_fee
10. Update milestone status to 'released', set released_at
11. Return success with fee breakdown

FAILURE: Any step fails -> entire transaction rolls back
```

This ensures money never appears or disappears. Every debit has a matching credit.

### Step 3: Create Atomic Database Function -- `execute_escrow_lock`

Called when a deal moves from "proposed" to "active":

```text
INPUT: offer_id, buyer_id, total_amount

1. Get buyer's wallet (SELECT FOR UPDATE)
2. Verify available_balance >= total_amount
3. Debit buyer available_balance by total_amount
4. Credit buyer escrow_balance by total_amount
5. Create wallet_transaction: type='escrow_deposit', amount=-total_amount
6. Update buyer total_spent
7. Return success

FAILURE: Insufficient funds -> raise exception, no state change
```

### Step 4: Create Atomic Database Function -- `execute_escrow_refund`

Called when a deal is cancelled or a dispute is resolved with refund:

```text
INPUT: offer_id, refund_reason

1. Get all unreleased milestones for offer
2. Calculate total refund = sum of unreleased milestone amounts
3. Get buyer's wallet (SELECT FOR UPDATE)
4. Debit buyer escrow_balance by refund amount
5. Credit buyer available_balance by refund amount
6. Create wallet_transaction: type='refund', amount=+refund_amount
7. Update all unreleased milestones to 'cancelled'
8. Return success with refund amount

FAILURE: Rolls back entirely
```

### Step 5: Rewrite `deal-runtime` Edge Function

Fix every action to use correct column names and call the new atomic functions:

**`create_deal`:**
- Use `price` instead of `amount`
- Use existing columns only
- Create milestones with `expected_delivery` instead of `due_date`

**`advance_milestone`:**
- Write to `updated_at` only (no `started_at` until migration adds it)
- After migration: also set `started_at`

**`submit_milestone`:**
- Remove `submission_notes` reference until migration adds it
- After migration: include it

**`approve_milestone`:**
- Remove `approved_by` reference until migration adds it  
- After migration: include it

**`release_payment` (CRITICAL REWRITE):**
- Call `execute_milestone_release()` database function instead of manual wallet updates
- Return fee breakdown to caller

**`dispute`:**
- Insert into `disputes` using `milestone_id` and `initiated_by` (correct columns)
- Add `offer_id` after migration

**`cancel_deal`:**
- Call `execute_escrow_refund()` to return unreleased funds to buyer
- Then update deal status

**`complete_deal`:**
- Verify all milestones released (no change needed, already correct)

### Step 6: Create Platform Wallet

Insert a system/platform wallet row for collecting fees. This wallet accumulates commission from every milestone release.

### Step 7: Update `useAcceptDeal` Hook

When a buyer clicks "Accept & Lock Escrow" in the Deal Detail Page, the hook should call the `deal-runtime` edge function with a new `activate_deal` action (or modify `create_deal`) that triggers `execute_escrow_lock`. Currently it just updates `deal_rooms.escrow_status` to "locked" without actually moving any wallet funds.

### Step 8: Add Balance Verification to Wallet Page

Update `WalletPage.tsx` to show fee breakdowns on completed transactions. The `wallet_transactions` table will now contain `commission_deduction` type entries that the existing `transactionTypeConfig` already handles.

---

## Money Flow After Fix

```text
DEAL ACCEPTED:
  Buyer wallet: available -10,000 | escrow +10,000
  Net effect: 0 (money moved, not created/destroyed)

MILESTONE RELEASED (amount: 5,000, fee: 500 at 10%):
  Buyer wallet: escrow -5,000
  Provider wallet: available +4,500
  Platform wallet: available +500
  Net effect: 0 (5,000 out of escrow = 4,500 to provider + 500 to platform)

DEAL CANCELLED (remaining escrow: 5,000):
  Buyer wallet: escrow -5,000 | available +5,000
  Net effect: 0 (money returned)
```

Every transaction sums to zero. Money is never created or destroyed.

---

## Files Changed

| File | Change |
|------|--------|
| Migration SQL | Add missing columns to offers, milestones, disputes, wallet_transactions |
| Migration SQL | Create `execute_milestone_release()` function |
| Migration SQL | Create `execute_escrow_lock()` function |
| Migration SQL | Create `execute_escrow_refund()` function |
| Migration SQL | Insert platform wallet row |
| `supabase/functions/deal-runtime/index.ts` | Full rewrite with correct schema + atomic function calls |
| `src/hooks/useDealRoom.ts` | Update `useAcceptDeal` to call deal-runtime for escrow lock |
| `src/pages/WalletPage.tsx` | Add fee breakdown display for commission transactions |

---

## What This Does NOT Do (Deferred)

- Stripe integration (Phase 2 -- requires enabling Stripe connector)
- Webhook idempotency (not needed until Stripe is live)
- Subscription billing (separate system)
- Institutional funding flows (separate system)

This plan focuses exclusively on making the internal money movement bulletproof so that when Stripe is added later, it connects to a system that already works correctly.

