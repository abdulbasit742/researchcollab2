# RCollab — Institutional Operations Command Structure

## Operational Roles & Responsibilities

### 1. Financial Integrity Officer
- **Responsibility**: Escrow invariant validation, ledger reconciliation, wallet balance sanity
- **Authority**: Freeze escrow funding on invariant failure
- **Escalation**: → CEO / Board immediately on ledger integrity failure
- **Reporting**: Daily financial health snapshot; weekly reconciliation report

### 2. Escrow Operations Manager
- **Responsibility**: Escrow funding flow, milestone release operations, refund processing
- **Authority**: Approve/deny manual escrow overrides (cap increases only)
- **Escalation**: → Financial Integrity Officer on anomaly
- **Reporting**: Daily funding/release counts; weekly escrow exposure report

### 3. Institutional Success Lead
- **Responsibility**: University onboarding, faculty engagement, institutional retention
- **Authority**: Approve/reject new institution applications
- **Escalation**: → CEO on institutional churn signal
- **Reporting**: Quarterly institutional review; monthly engagement metrics

### 4. Sponsor Success Lead
- **Responsibility**: Sponsor onboarding, funding experience, sponsor retention
- **Authority**: Escalate sponsor complaints, flag churn risk
- **Escalation**: → Escrow Ops Manager on funding issues
- **Reporting**: Weekly sponsor satisfaction; monthly churn analysis

### 5. Security & Monitoring Lead
- **Responsibility**: Security event review, fraud signal triage, rate limit monitoring
- **Authority**: Trigger circuit breaker freeze, block suspicious accounts
- **Escalation**: → Incident Response Coordinator on Level 3+
- **Reporting**: Daily security digest; weekly threat assessment

### 6. Compliance Officer
- **Responsibility**: Maintain compliance binder, audit readiness, regulatory tracking
- **Authority**: Mandate policy changes for compliance gaps
- **Escalation**: → CEO / Legal on regulatory risk
- **Reporting**: Monthly compliance status; quarterly audit preparation

### 7. Incident Response Coordinator
- **Responsibility**: Incident triage, root cause analysis, postmortem documentation
- **Authority**: Full freeze authority during Level 3+ incidents
- **Escalation**: → All leadership on Level 4 (ledger integrity failure)
- **Reporting**: Per-incident postmortem; weekly incident summary

---

## Incident Response Playbook

| Level | Description | Actions |
|-------|-------------|---------|
| **L1** | Minor glitch (UI, non-financial) | Log → Fix → Deploy |
| **L2** | Financial anomaly (failed tx, timeout) | Log → Investigate → Notify Fin. Officer → Fix → Postmortem |
| **L3** | Escrow invariant failure | **FREEZE** funding → Notify all leadership → RCA → Fix → Validate → Resume |
| **L4** | Ledger integrity failure | **FULL FREEZE** → Emergency all-hands → Forensic analysis → Fix → Full reconciliation → Postmortem |

**Rule: No silent resolution. Every incident gets a postmortem document.**

---

## Daily Operations Routine

| Time | Activity | Owner |
|------|----------|-------|
| 09:00 | Escrow invariant validation | Financial Integrity Officer |
| 09:15 | Ledger reconciliation check | Financial Integrity Officer |
| 09:30 | Security event review | Security Lead |
| 10:00 | Support escalation review | Incident Response Coordinator |
| 17:00 | Daily ops metrics capture | Escrow Ops Manager |
| 17:30 | End-of-day anomaly scan | Security Lead |

## Weekly Audit Checklist
- [ ] Full reconciliation script execution
- [ ] SLA breach review
- [ ] Dispute root cause analysis
- [ ] Sponsor churn signal review
- [ ] Error log pattern analysis
- [ ] Financial mutation count review
- [ ] Internal stability report production

## Monthly Stress Simulation
- [ ] High escrow funding volume test
- [ ] Concurrent milestone approval test
- [ ] Sudden user spike simulation
- [ ] Database load spike test
- [ ] API burst traffic test
- [ ] Rate abuse simulation
- [ ] Storage spike test
- [ ] Document outcomes with metrics

---

## Privilege Minimization Matrix

| Role | Prod Financial Data | Ledger History | Wallet Details | Escrow Logic | Audit Access |
|------|-------------------|----------------|----------------|--------------|--------------|
| Engineer | ❌ | ❌ | ❌ | Read only | ❌ |
| Admin | Read only | ❌ Cannot modify | ❌ Restricted | ❌ | ✅ Read only |
| Support | ❌ | ❌ | ❌ | ❌ | ❌ |
| Financial Core | ✅ | Read only | ✅ | ✅ | ✅ |
| Security Lead | Read only | Read only | ❌ | ❌ | ✅ |

---

## Compliance Readiness Binder
1. Escrow flow documentation → `deployment/LAUNCH_PROTOCOL.md`
2. Ledger design documentation → `deployment/INFRASTRUCTURE_DISCIPLINE.md`
3. Invariant design documentation → DB functions source
4. Audit logs export → `export-audit-logs` edge function
5. Backup documentation → `deployment/INFRASTRUCTURE_DISCIPLINE.md`
6. Security hardening documentation → CSP headers + RLS policies
7. Role matrix documentation → This document
8. Incident response documentation → This document

---

## Operational Culture Mantra

> "We protect the ledger."
> "We protect escrow."
> "We protect trust."
> "We expand only after stability."
> "We move slow on money."
> "We never hide incidents."

---

## Operational Scale Readiness Gate

Before onboarding any new institution:
- [ ] 60 days zero critical incidents
- [ ] Escrow invariant 100% stable
- [ ] SLA compliance > 90%
- [ ] Support load manageable
- [ ] No backlog in disputes
- [ ] `check_ops_readiness_gate()` returns `ready: true`
