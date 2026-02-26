# RCollab — Deployment Strategy

## Zero-Downtime Deployment Flow

### Blue-Green Deployment

1. **Build** new version in CI (lint → type-check → test → build)
2. **Deploy** to staging environment first
3. **Run** deployment readiness checks (`runDeploymentChecks()`)
4. **Smoke test** staging (health endpoint, sample escrow flow)
5. **Switch** traffic to new version (blue → green)
6. **Monitor** for 15 minutes — watch platform_alerts for critical events
7. **Rollback** if any critical alert fires within monitoring window

### Pre-Deployment Checklist

- [ ] All tests passing (76+ tests, 80%+ coverage)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Health check returns "healthy"
- [ ] Backup completed within last 24 hours
- [ ] No unresolved critical user_flags
- [ ] No negative wallet balances
- [ ] Stripe webhook endpoint verified
- [ ] Environment variables validated

### Database Migration Steps

1. Run migration on staging DB first
2. Verify schema matches expected state
3. Apply to production (Lovable Cloud handles this on publish)
4. Verify RLS policies intact post-migration

### Cache Warm-Up

After deployment:
1. Hit health check endpoint to warm DB connection pool
2. Verify static assets cached (nginx 30-day cache headers)
3. Confirm PWA service worker updated (`registerType: "autoUpdate"`)

### Monitoring Window

Post-deploy monitoring (15 min):
- Watch `platform_alerts` for new critical entries
- Check wallet consistency (no negative balances)
- Verify escrow operations functional
- Confirm Stripe webhooks processing

## Environment Matrix

| Environment | DB         | Stripe Keys | Purpose          |
|-------------|------------|-------------|------------------|
| Development | Test       | `pk_test_`  | Local dev        |
| Staging     | Test       | `pk_test_`  | Pre-release QA   |
| Production  | Live       | `pk_live_`  | Real users       |
