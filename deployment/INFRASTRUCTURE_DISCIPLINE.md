# RCollab — Infrastructure Discipline Rules

## Non-Negotiable Rules

1. **No hotfix directly in production** — All changes go through CI pipeline.
2. **No financial mutation without invariant test** — Every escrow/wallet/ledger operation must have passing tests.
3. **No schema change without migration plan** — Use versioned migration scripts only.
4. **No rollback without reconciliation** — Run `run_nightly_reconciliation()` before and after any rollback.
5. **No deployment without monitoring active** — Health checks and security events must be functional.

## Deployment Checklist

Before every production deploy:

- [ ] All CI tests pass (including financial tests)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Health check returns "healthy"
- [ ] Backup completed within last 24h
- [ ] Nightly reconciliation shows "balanced"
- [ ] Escrow invariant audit passes (`validate_all_escrow_invariants()`)
- [ ] No unresolved critical security events
- [ ] No negative wallet balances
- [ ] No mock data in production code
- [ ] No console.log in financial code
- [ ] Feature flags reviewed for staging-only features
- [ ] No debug endpoints exposed

## Environment Isolation

| Rule | Enforcement |
|------|-------------|
| Separate DB credentials | `.env` per environment |
| Separate JWT secrets | Lovable Cloud per project |
| Separate storage buckets | RLS + bucket isolation |
| No production mutation from staging | Separate Supabase projects |
| Rate limiting per environment | Config-driven thresholds |

## Alert Severity Levels

| Level | Trigger | Response |
|-------|---------|----------|
| INFO | Rate limit hit, stale escrow detected | Log only |
| WARNING | Escrow consistency drift, backup stale | Review within 4h |
| CRITICAL | Negative balance, ledger mismatch, invariant violation | Immediate investigation |

## Rollback Protocol

1. Identify the issue (security event logs, health check, reconciliation)
2. Run `validate_all_escrow_invariants()` to assess damage
3. Run `run_nightly_reconciliation()` to capture pre-rollback state
4. Execute rollback via deployment manager
5. Run reconciliation again post-rollback
6. Verify health check returns "healthy"
7. Document incident in platform_alerts

## Server-Side Automated Checks

| Check | Frequency | Function |
|-------|-----------|----------|
| Nightly reconciliation | Daily 2 AM | `run_nightly_reconciliation()` |
| Escrow invariant audit | Daily 3 AM | `validate_all_escrow_invariants()` |
| Health check | On-demand | `checkSystemHealth()` |
| Backup freshness | Daily | `checkBackupStatus()` |
| Deployment readiness | Pre-deploy | `runDeploymentChecks()` |

## Feature Flag Discipline

- Financial features MUST be behind feature flags in staging
- No flag activation in production without admin approval
- Emergency disable all: `emergencyDisableAll()` function available
- Flags stored server-side in `feature_flags` table (never client-only)
