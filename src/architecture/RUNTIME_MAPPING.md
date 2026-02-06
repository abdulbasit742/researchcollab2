# RCollab Runtime Mapping

> "Architecture is enforced by code, not intention."

## System → Table → Edge Function Mapping

This document maps every CORE system to its database tables and edge functions.

---

## Layer 1: Identity & Trust

### System 2: Trust Computation Engine
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `user_trust_profiles`, `trust_events`, `trust_score_components`, `trust_hard_penalties`, `trust_score_history` |
| **Edge Function** | `compute-trust` |
| **DB Functions** | `calculate_trust_score()`, `calculate_dynamic_trust_score()`, `admin_freeze_trust_profile()`, `admin_override_trust_score()` |
| **State Machine** | frozen → active → computed |

**Actions:**
- `compute` - Full 5-dimension recalculation
- `apply_event` - Apply a trust-changing event
- `decay` - Apply inactivity decay
- `freeze` / `unfreeze` - Admin lock

---

### System 1: Universal Professional Object Model (UPOM)
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `profiles`, `profile_headers`, `scholar_passports`, `career_profiles`, `profile_proof_metrics` |
| **Edge Function** | N/A (CRUD via Supabase) |
| **DB Functions** | `compute_profile_proof_metrics()`, `update_profile_search_index()` |
| **State Machine** | onboarding → active → verified → archived |

---

## Layer 2: Capability & Outcomes

### System 3: Outcome Graph
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `outcomes`, `outcome_links`, `outcome_evidence`, `accountability_records` |
| **Edge Function** | N/A (uses DB functions) |
| **DB Functions** | `register_outcome()`, `update_trust_on_accountability()` |
| **State Machine** | pending → validated → legacy |

---

## Layer 3: Opportunities & Execution

### System 4: Continuous Matching Engine
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `earning_projects`, `project_applications`, `ai_match_results`, `saved_searches` |
| **Edge Function** | `market-balancer` |
| **Hooks** | `useOpportunityEngine`, `useContinuousMatchingEngine` |
| **State Machine** | draft → active → matched → closed |

---

### System 5: Deal Execution Runtime
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `offers`, `milestones`, `disputes`, `escrow_transactions`, `wallet_transactions` |
| **Edge Function** | `deal-runtime` |
| **DB Functions** | `partial_release_milestone()`, `set_milestone_auto_release()`, `check_and_unlock_reviews()` |
| **State Machine** | proposed → active → disputed → completed / cancelled |

**Actions:**
- `create_deal` - Create from offer with milestones
- `advance_milestone` / `submit_milestone` / `approve_milestone`
- `release_payment` - Transfer funds + apply trust
- `dispute` / `resolve_dispute`
- `complete_deal` / `cancel_deal`

---

## Layer 4: Economics & Incentives

### System 29: Value Unit System
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `wallets`, `wallet_transactions`, `value_units`, `pricing_snapshots` |
| **Edge Function** | `deal-runtime` (payment release) |
| **DB Functions** | `check_fraud_patterns()`, `admin_freeze_wallet()`, `get_platform_fee()` |

---

## Layer 5: Knowledge & Memory

### System 6: Long-Term Memory
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `knowledge_objects`, `knowledge_validations`, `knowledge_usage_events`, `ai_context_snapshots` |
| **Edge Function** | N/A (CRUD via Supabase) |
| **State Machine** | draft → reviewed → validated → superseded |

---

## Layer 6: Institutions & Governance

### System 61: Ethical & Power Safeguards
**Status:** ✅ Fully Runtime-Backed

| Component | Implementation |
|-----------|----------------|
| **Tables** | `admin_audit_logs`, `admin_scopes`, `user_restrictions`, `state_transition_logs` |
| **Edge Function** | All functions log to `state_transition_logs` |
| **DB Functions** | `apply_user_restriction()`, `is_user_restricted()`, `check_permission()` |

---

## State Machine Definitions

### User Lifecycle
```
onboarding → active → restricted → archived
                ↓
            verified
```

### Opportunity Lifecycle
```
draft → active → matched → closed
          ↓
       cancelled
```

### Deal Lifecycle
```
proposed → active → completed
    ↓        ↓
cancelled  disputed → resolved → completed
              ↓
           cancelled
```

### Milestone Lifecycle
```
pending → in_progress → submitted → approved → released
              ↓             ↓
          cancelled      rejected → in_progress
                            ↓
                        disputed → approved/rejected
```

### Outcome Lifecycle
```
pending → validated → legacy
    ↓
 rejected
```

### Knowledge Lifecycle
```
draft → reviewed → validated → superseded
   ↓        ↓
archived  rejected
```

---

## Hook → Runtime Mapping

| Hook | Tables Used | Edge Function | DB Functions |
|------|-------------|---------------|--------------|
| `useMyTrustProfile` | `user_trust_profiles`, `user_badges` | `compute-trust` | `calculate_trust_score` |
| `useOpportunityEngine` | `earning_projects`, `profiles` | `market-balancer` | — |
| `useDealExecutionRuntime` | `offers`, `milestones`, `disputes` | `deal-runtime` | — |
| `useAdminUsers` | `profiles`, `user_roles`, `user_blocks` | — | `is_admin()` |
| `useAdminSettings` | `platform_settings` | — | — |
| `useDailyLoop` | Multiple tables | — | — |

---

## Security Enforcement

### RLS Coverage
- ✅ All core tables have RLS enabled
- ✅ Role-based access via `user_roles` table
- ✅ Admin bypass via `is_admin()` SECURITY DEFINER function
- ✅ Blocked user checks via `is_blocked()` function

### Audit Trail
- All state transitions logged to `state_transition_logs`
- Admin actions logged to `admin_audit_logs`
- Trust changes logged to `trust_events` and `trust_score_history`

### Rate Limiting
- Defined in `rate_limits` table
- Checked via `check_rate_limit()` function

---

## Edge Functions Summary

| Function | Purpose | Auth Required | Status |
|----------|---------|---------------|--------|
| `compute-trust` | Trust score computation, events, decay, freeze | No (service key) | ✅ Verified |
| `deal-runtime` | Deal lifecycle management | No (service key) | ✅ Verified |
| `market-balancer` | Supply/demand metrics | No | ✅ Verified |
| `ambient-analyzer` | Context analysis | No | ✅ Verified |
| `transcribe-voice-note` | Audio transcription | No | ✅ Verified |
| `notify-new-bid` | Notification dispatch | No | ✅ Verified |
| `career-copilot` | Career guidance | No | ✅ Verified |
| `ai-platform-intelligence` | AI recommendations | No | ✅ Verified |
| `generate-audio-briefing` | Audio content generation | Yes (JWT) | ✅ Verified |

---

## Runtime Data Contracts

All edge functions now have:

1. **Precondition Guards** - Validate inputs and dependencies
2. **Structured Errors** - Return error_code, missing, action fields
3. **Schema Contracts** - Documented in `/supabase/contracts/edge_schema_contracts.md`
4. **Seed Data** - Available in `/supabase/seed/runtime_seed.sql`
5. **Smoke Tests** - Available in `/supabase/tests/edge_smoke_test.ts`

### Required Schema Columns (Verified)

| Table | Column | Used By |
|-------|--------|---------|
| `offers` | `required_skills` | `market-balancer`, `ambient-analyzer` |
| `profiles` | `skills` | `market-balancer`, `ambient-analyzer` |

---

## What's NOT Runtime-Backed (Deferred)

These Extended/Institutional systems are frontend-only for now:

- Crisis Mode (System 56)
- National Human Capital Views (System 54)
- Global Coordination (System 62)
- AI Historian (System 42)

They will be implemented when needed for institutional clients.

---

**"Every Edge Function now fails only when it should — never accidentally."**
