# RCollab — Controlled Institutional Launch Protocol

## Launch Mode: SOFT LAUNCH (Invite-Only)

### Current Constraints
- Open signups: **DISABLED**
- Registration: **Invite-only + whitelisted university domains**
- Admin approval required for new institutions
- No anonymous onboarding

### Pilot University Program
- 1–3 engineering universities only
- Max 50 projects per university
- Max 5 sponsors per university
- First 10 deals require manual review
- Total platform escrow cap: PKR 5,000,000
- Per-deal escrow cap: PKR 50,000

## Scale Gate System

### Gate 1: 30-Day Stability (Required before any expansion)
- [ ] 30 days continuous operation
- [ ] 0 escrow invariant failures
- [ ] Dispute rate < 5%
- [ ] Transaction error rate < 1%

### Gate 2: 90-Day Retention (Required before adding institutions)
- [ ] 90 days stable operation
- [ ] Institutional retention confirmed
- [ ] Sponsor repeat rate ≥ 30%
- [ ] Financial reconciliation flawless

### Gate 3: 180-Day Scale (Required before regional expansion)
- [ ] 180 days stable operation
- [ ] Support load manageable
- [ ] 0 critical security alerts in last 30 days

## Incident Response Protocol

### Auto-Freeze Triggers
- Escrow invariant failure → Freeze new funding
- Ledger mismatch detected → Freeze + investigate
- Dispute rate > 15% → Freeze + review
- API error rate > 5% → Read-only mode

### Response Steps
1. Freeze new escrow funding (pilot circuit breaker)
2. Maintain read-only access for all users
3. Investigate root cause
4. Issue controlled communication to pilot participants
5. Resume only after validation passes

## 30-Day Stability Audit Checklist
- [ ] Escrow reconciliation (run_nightly_reconciliation)
- [ ] Ledger integrity verification (validate_all_escrow_invariants)
- [ ] Wallet balance verification (no negative balances)
- [ ] Role enforcement test
- [ ] RLS penetration test
- [ ] Load spike test
- [ ] Backup restore simulation
- [ ] Security event log review

## Daily Launch Health Dashboard Metrics
| Metric | Source |
|--------|--------|
| Active escrow volume | escrows table |
| Active deals | deal_rooms |
| Milestones pending | milestones |
| Avg approval time | milestone timestamps |
| Security alerts (24h) | security_events |
| Transaction latency | audit log timestamps |
| Daily active users | auth sessions |
| Dispute count | deal_rooms |
| Funding events | financial_audit_logs |
| Milestone releases | financial_audit_logs |

## Communication Discipline
- Position: "Pilot institutional execution platform"
- Do NOT claim: global scale, massive growth, industry disruption
- Underpromise. Overdeliver.

## Internal Rules (First 6 Months)
- No AI expansion
- No global expansion
- No speculative features
- No redesign
- No unnecessary pivots
- Focus: Stability → Trust → Feedback → Correction
