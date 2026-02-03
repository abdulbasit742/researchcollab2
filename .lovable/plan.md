

# Academic Forge Flow (RCollab) - 100% World-Class Platform Completion Plan

## Executive Summary

After thorough analysis of your platform, I've identified **9 major work streams** across **45+ specific tasks** needed to transform this into a production-ready, world-class academic collaboration platform. The platform already has an impressive foundation with 300+ database tables, 80+ hooks, and comprehensive admin infrastructure.

---

## Current State Assessment

### What's Already Built (Strengths)
- 300+ database tables with comprehensive schema
- Admin system with real-time dashboards
- Feature flags & kill-switch infrastructure
- Schema versioning system
- 80+ React hooks for data management
- Messaging system with realtime updates
- Wallet & escrow system (frontend only)
- Global search with `search_index` table
- Presence tracking system
- Trust engine & verification workflow

### Critical Gaps Identified
1. **No payment gateway** - Stripe not integrated
2. **Missing UI pages** - 8+ feature hooks have no pages
3. **Only 2 Edge Functions** - Need 5+ more for automation
4. **No data integrity jobs** - Background cleanup missing
5. **Performance not optimized** - No indexes audit, no caching
6. **Observability incomplete** - No metrics/alerting system
7. **Permission matrix informal** - No formal RBAC tables

---

## Work Streams & Priority Order

```text
+----------------------------------------------+
|  PHASE 1: CORE INFRASTRUCTURE (Week 1-2)     |
|  - Stripe Integration                        |
|  - Edge Functions                            |
|  - Permission Matrix                         |
+----------------------------------------------+
            |
            v
+----------------------------------------------+
|  PHASE 2: UI COMPLETION (Week 2-3)           |
|  - Missing Feature Pages                     |
|  - Advanced Messaging                        |
|  - Collaborative Workspaces                  |
+----------------------------------------------+
            |
            v
+----------------------------------------------+
|  PHASE 3: OPTIMIZATION (Week 3-4)            |
|  - Database Indexes                          |
|  - Query Hardening                           |
|  - Caching Layer                             |
+----------------------------------------------+
            |
            v
+----------------------------------------------+
|  PHASE 4: RELIABILITY (Week 4-5)             |
|  - Observability                             |
|  - Data Integrity Jobs                       |
|  - Go-Live Checklist                         |
+----------------------------------------------+
```

---

## Phase 1: Core Infrastructure

### 1.1 Stripe Payment Integration
**Priority: CRITICAL**

| Task | Description |
|------|-------------|
| Create Stripe tables | `stripe_customers`, `stripe_payment_intents`, `stripe_webhook_events` |
| Stripe webhook Edge Function | Handle `payment_intent.succeeded`, `invoice.paid`, subscription events |
| Wallet top-up flow | PaymentIntent creation, frontend checkout, webhook confirmation |
| Escrow funding | Lock funds via Stripe, release on milestone approval |
| Subscription management | Create/cancel/renew subscriptions for premium features |
| Invoice history page | User can view all payment history |

### 1.2 Edge Functions Build-out
**Priority: CRITICAL**

| Function | Purpose |
|----------|---------|
| `stripe-webhook` | Process all Stripe events securely |
| `process-grant-application` | Validate eligibility, notify reviewers, update status |
| `release-milestone-payment` | Idempotent escrow release with audit logging |
| `run-scheduled-analytics` | Daily/weekly trend aggregation, foresight snapshots |
| `send-platform-email` | Template-based notifications respecting preferences |
| `handle-dataset-access-request` | Ethics/consent validation, owner notification |

### 1.3 Permission Matrix & RBAC
**Priority: HIGH**

| Task | Description |
|------|-------------|
| Create `permission_definitions` table | Action + entity type definitions |
| Create `role_permissions` table | Role-to-action mappings |
| Create `contextual_permissions` table | User-specific overrides with expiry |
| `check_permission()` function | Postgres function for RLS |
| Admin permissions UI | `/admin/permissions` - view/audit matrix |
| Enforcement at all layers | RLS + Edge + Frontend guards |

---

## Phase 2: UI Completion

### 2.1 Missing Feature Pages
**Priority: HIGH**

| Route | Hook | Description |
|-------|------|-------------|
| `/ip` & `/ip/licenses` | `useIPManagement` | IP declarations, ownership breakdown, licensing |
| `/workspace/:id` | `useCollaborativeWorkspace` | Real-time editor, presence, version history |
| `/archive` & `/legacy` | `useArchival` | Immutable records, scholar legacy view |
| `/impact` | `useImpactTranslation` | Policy translations, adoption records |
| `/analytics/foresight` | `useForesight` | Trend signals, confidence bands, scenarios |
| `/economics` | `useEconomicSustainability` | Revenue transparency, subsidies, pricing logic |
| `/national` | `useNationalSovereignty` | Sovereign data, public accountability |
| `/stewardship` | `usePlatformStewardship` | Mission charter, governance evolution |

### 2.2 Advanced Messaging Engine
**Priority: HIGH**

| Feature | Implementation |
|---------|----------------|
| `user_presence` table | Status, last_seen, with timeout cleanup |
| `typing_events` table | Thread-scoped, auto-expiry (5s) |
| `message_reads` table | Per-message read receipts |
| Realtime channels | `thread:{id}`, `presence:global`, `user:{id}` |
| UI enhancements | Typing indicators, read receipts, reconnect handling |

### 2.3 Collaborative Workspaces
**Priority: MEDIUM**

| Feature | Description |
|---------|-------------|
| Real-time document editor | Collaborative text editing |
| Presence indicators | Show who's viewing/editing |
| Version history | Track all changes with rollback |
| Comment sidebar | Thread-based discussions |
| File attachments | Document sharing within workspace |

---

## Phase 3: Performance Optimization

### 3.1 Database Index Audit
**Priority: HIGH**

| Table Category | Index Columns |
|----------------|---------------|
| Core entities | `user_id`, `owner_id`, `created_at`, `status` |
| Messaging | `thread_id`, `sender_id`, `read_at` |
| Financial | `wallet_id`, `offer_id`, `milestone_id` |
| Search | GIN indexes on `searchable_text`, `tags` |
| Admin | `admin_id`, `entity_type`, `action` |

### 3.2 Query Hardening
**Priority: HIGH**

| Task | Description |
|------|-------------|
| Remove `SELECT *` | Explicit column selection everywhere |
| Create materialized views | `admin_platform_stats`, `admin_growth_metrics` |
| Enforce pagination | All list queries capped at 50-100 |
| Batch heavy operations | Analytics aggregation, notifications |

### 3.3 Caching Strategy
**Priority: MEDIUM**

| Cache Type | Where Applied |
|------------|---------------|
| React Query `staleTime` | 5min for profiles, 1min for search |
| Server-side cache | Edge function responses |
| Memoization | Heavy dashboard components |
| Virtual lists | Messages, search results (100+ items) |

---

## Phase 4: Reliability & Go-Live

### 4.1 Observability System
**Priority: HIGH**

| Component | Implementation |
|-----------|----------------|
| `platform_metrics` table | API latency, error rates, realtime health |
| `platform_events` table | Auth failures, payment events, permission denials |
| `platform_traces` table | Request-to-result tracing |
| Alert thresholds | Error rate >2%, payment failures, DB locks |
| Admin dashboards | `/admin/health`, `/admin/metrics`, `/admin/incidents` |

### 4.2 Data Integrity Jobs
**Priority: HIGH**

| Job | Purpose |
|-----|---------|
| `cleanup-orphaned-records` | Remove dangling references |
| `enforce-state-consistency` | Fix mismatched statuses |
| `reconcile-wallet-balances` | Verify transaction math |
| `expire-stale-data` | Clear old typing events, presence |
| `verify-analytics-integrity` | Ensure snapshots match reality |

### 4.3 Go-Live Checklist Page
**Priority: CRITICAL**

| Check Category | Items |
|----------------|-------|
| Auth & Access | Email verification, OAuth, role assignment, blocked users |
| Database & RLS | All tables have RLS, no `USING (true)`, indexes present |
| Stripe | Webhooks verified, no credits before confirmation, refunds work |
| Edge Functions | Auth validated, idempotent, timeouts handled |
| Realtime | Messaging stable, presence correct, reconnect works |
| Performance | No N+1 queries, pagination everywhere |

---

## Technical Specifications

### Database Additions Required

```text
New Tables:
- stripe_customers (user_id, stripe_customer_id, created_at)
- stripe_payment_intents (user_id, intent_id, amount, status, purpose)
- stripe_webhook_events (event_id, event_type, processed, received_at)
- permission_definitions (action, entity_type, description)
- role_permissions (role, action, entity_type, allowed)
- contextual_permissions (user_id, context_type, context_id, action, expires_at)
- user_presence (user_id, status, last_seen_at, updated_at)
- typing_events (thread_id, user_id, started_at, expires_at)
- message_reads (message_id, user_id, read_at)
- platform_metrics (metric_name, value, labels, recorded_at)
- platform_events (event_type, severity, context, user_id)
- platform_traces (trace_id, span_name, duration_ms, status)
- platform_integrity_logs (job_name, action_type, affected_table, severity)
```

### Edge Functions Required

```text
1. stripe-webhook
2. process-grant-application
3. release-milestone-payment
4. run-scheduled-analytics
5. send-platform-email
6. handle-dataset-access-request
7. cleanup-orphaned-records (scheduled)
8. enforce-state-consistency (scheduled)
```

### New Pages Required

```text
/ip                    - IP Management
/ip/licenses           - License Management
/workspace/:id         - Collaborative Workspace
/archive               - Archival Records
/legacy                - Scholar Legacy
/impact                - Impact Translation
/analytics/foresight   - Foresight Dashboard
/economics             - Economic Sustainability
/national              - National Sovereignty
/stewardship           - Platform Stewardship
/admin/health          - System Health
/admin/metrics         - Metrics Dashboard
/admin/incidents       - Incident Tracker
/admin/permissions     - Permission Matrix
/admin/integrity       - Data Integrity Logs
/admin/launch-checklist - Go-Live Status
```

---

## Implementation Order (Recommended)

1. **Stripe Integration** - Enables real money flow
2. **Edge Functions** - Enables automation
3. **Permission Matrix** - Formalizes access control
4. **Missing UI Pages** - Completes user experience
5. **Advanced Messaging** - Polishes core communication
6. **Database Optimization** - Prepares for scale
7. **Observability** - Enables production monitoring
8. **Data Integrity Jobs** - Ensures long-term health
9. **Go-Live Checklist** - Final verification

---

## Estimated Effort

| Phase | Duration | Complexity |
|-------|----------|------------|
| Phase 1: Infrastructure | 1-2 weeks | High |
| Phase 2: UI Completion | 1-2 weeks | Medium |
| Phase 3: Optimization | 1 week | Medium |
| Phase 4: Reliability | 1 week | High |
| **Total** | **4-6 weeks** | **High** |

---

## Success Criteria

The platform is "100% World-Class" when:

1. Real money flows securely through Stripe
2. All 80+ hooks have corresponding UI pages
3. 8+ Edge Functions automate critical workflows
4. Database has comprehensive indexes and views
5. Observability catches issues before users report them
6. Data integrity jobs run daily without intervention
7. Go-Live checklist shows all green
8. Admin can understand platform state in 30 seconds
9. No user action results in a broken or empty state
10. Platform feels as reliable as LinkedIn or Upwork

---

## Next Steps

When you approve this plan, I will begin implementation in the following order:

1. **First**: Stripe payment integration (tables + webhook + frontend flows)
2. **Second**: Critical Edge Functions for automation
3. **Third**: Missing UI pages for feature hooks
4. **Fourth**: Performance and reliability hardening

Each step will be production-ready before moving to the next.

