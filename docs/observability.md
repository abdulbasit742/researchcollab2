# RCollab — Observability Guide

## What Is Tracked

| Layer | What | Where |
|-------|------|-------|
| Errors | Exceptions from escrow/wallet/stripe/trust | `platform_events` |
| Metrics | Operation durations, counts | `system_metrics` |
| Anomalies | Escrow mismatches, deal spikes, dispute spikes | `platform_events` |
| Wallet Drift | Balance snapshot vs transaction sum divergence | `platform_alerts` |
| Admin Alerts | Critical system events requiring attention | `platform_alerts` |
| Traces | Correlated operation chains (in-memory + logs) | Structured logs |

## Anomaly Detection

### Escrow Anomalies
- **Funding mismatch**: Deal marked `funded` but wallet escrow < deal escrow_amount
- **Deal creation spike**: >10 deals from one user in 1 hour
- **Dispute spike**: >3 disputes from same sponsor in 24 hours

### Wallet Drift
- Compares `available_balance + escrow_balance + pending_balance` against `SUM(completed transactions)`
- Tolerance: PKR 1
- Severity: `warning` if delta ≤ 1000, `critical` if > 1000

## How to Respond to Alerts

### Escrow Anomaly Playbook
1. Check `platform_events` for `anomaly:escrow_*` events
2. Compare deal's `escrow_amount` vs buyer's `wallets.escrow_balance`
3. Check `wallet_transactions` for the deal's escrow_deposit entry
4. If missing transaction → likely failed atomic write → use admin adjustment
5. If duplicate transaction → check `stripe_events` for replay

### Wallet Drift Playbook
1. Query `wallet_transactions` for the affected user
2. Sum all `completed` transactions
3. Compare against wallet snapshot
4. Identify the missing/extra transaction
5. Use `adminAdjust()` to correct with audit trail
6. Investigate root cause (failed compensating rollback?)

### Stripe Webhook Failure Playbook
1. Check `platform_alerts` for `stripe_webhook_failure`
2. Verify `stripe_events` table for the event_id
3. If event not processed → check edge function logs
4. If signature verification failed → verify webhook secret is correct
5. If idempotency prevented processing → this is expected behavior, resolve alert

## Nightly Integrity Checks
- Runs via pg_cron daily
- Checks all wallets for drift
- Checks all active escrows for consistency
- Results logged to `background_job_runs`
- Critical issues auto-create `platform_alerts`

## Metrics Collected
- `escrow_fund_duration_ms`
- `milestone_release_duration_ms`
- `wallet_mutation_duration_ms`
- `trust_recompute_duration_ms`
- `stripe_webhook_processing_ms`
- `rate_limit_trigger_count`
- `dispute_creation_count`
