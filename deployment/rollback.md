# RCollab — Rollback Strategy

## When to Rollback

Trigger rollback if ANY of these occur within 15 minutes of deployment:

- Critical `platform_alerts` entry (escrow failure, ledger mismatch)
- Wallet consistency check fails (negative balances detected)
- Stripe webhook processing errors
- Health check returns "unhealthy"
- Error rate spikes above 5% of requests

## Rollback Procedure

### 1. Code Rollback

Lovable provides built-in version history:
- Navigate to version history in editor
- Restore previous working version
- Publish restored version

### 2. Database Rollback Precautions

**CRITICAL**: Database schema changes are NOT automatically rolled back.

Before any destructive migration (column removal, table drop):
1. Check Live environment for existing data first
2. Export affected data via Cloud View → Run SQL
3. Only then publish the migration
4. Keep export for 30 days minimum

Non-destructive migrations (adding columns, tables) are safe — no rollback needed.

### 3. Stripe Reconciliation After Rollback

After rolling back:
1. Check `stripe_events` table for any events processed during failed deploy
2. Verify escrow states match Stripe payment statuses
3. If mismatch found: use `adminAdjust()` to correct wallet balances
4. Log all corrections in `admin_audit_logs`

### 4. Ledger Reconciliation

After rollback:
1. Run `checkWalletConsistency()` from health check
2. Run `checkDealEscrowConsistency()` if available
3. Compare `sum(wallet_transactions)` vs wallet snapshot for affected users
4. Flag and investigate any delta > PKR 1

## Prevention Measures

- Always deploy to staging first
- Run full test suite before production deploy
- Monitor for 15 minutes post-deploy
- Keep deployment window small (< 30 minutes)
- Never deploy on Fridays or before holidays
