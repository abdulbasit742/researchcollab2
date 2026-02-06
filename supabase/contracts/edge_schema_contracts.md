# Edge Function Schema Contracts

> "Every Edge Function now fails only when it should — never accidentally."

This document defines the EXACT requirements for each edge function to succeed.

---

## 1. `ai-platform-intelligence`

**Purpose:** AI-powered analysis for feasibility, bid scoring, matching, profile strength, and pricing

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | No JWT required |
| **Secrets** | Required | `LOVABLE_API_KEY` (auto-configured) |

### Input Schema

```typescript
type RequestType = "feasibility" | "bid-score" | "match-confidence" | "profile-strength" | "suggested-pricing";

interface Request {
  type: RequestType;
  // Type-specific fields...
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_API_KEY` | `LOVABLE_API_KEY` not set | Auto-configured in Lovable Cloud |
| `INVALID_REQUEST_TYPE` | Unknown type value | Use valid RequestType |
| `RATE_LIMITED` | 429 from AI gateway | Wait and retry |

---

## 2. `ambient-analyzer`

**Purpose:** Relationship entropy, deal health, and opportunity proximity analysis

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | No JWT required |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `profiles` | `id`, `is_active`, `skills`, `hourly_rate`, `full_name` | User targeting |
| `messages` | `sender_id`, `recipient_id`, `created_at`, `thread_id` | Interaction tracking |
| `relationship_entropy` | All columns | Entropy storage |
| `deal_rooms` | `id`, `title`, `buyer_id`, `seller_id`, `status`, `created_at` | Deal health |
| `deal_health_metrics` | All columns | Health storage |
| `ambient_insights` | All columns | Insight storage |
| `offers` | `id`, `title`, `description`, `required_skills`, `budget_min`, `budget_max`, `deadline`, `status` | Opportunity matching |
| `opportunity_alerts` | All columns | Alert storage |

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `NO_ACTIVE_USERS` | No profiles with `is_active=true` | Seed active profiles |
| `MISSING_TABLE` | Required table doesn't exist | Run migrations |

---

## 3. `career-copilot`

**Purpose:** AI-powered career advice, trust analysis, opportunity matching

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | `user_id` in request body |
| **Secrets** | Required | `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `profiles` | `id`, `full_name`, `university`, `department`, `education_level`, `interests` | User context |
| `user_trust_profiles` | `user_id`, `trust_score`, `is_verified_student`, `is_verified_researcher` | Trust context |
| `consequence_ledgers` | `user_id`, `projects_completed`, `projects_failed`, `completion_rate`, `on_time_rate`, `total_escrow_released`, `disputes_won`, `disputes_lost`, `trust_trajectory` | Work history |
| `accountability_records` | `executor_id`, `outcome_status`, `promised_deliverables`, `created_at` | Recent projects |
| `earning_projects` | `id`, `title`, `description`, `budget_min`, `budget_max`, `deadline_days`, `tags` | Opportunity details |

### Input Schema

```typescript
interface Request {
  type: "ask" | "trust-analysis" | "opportunity-advice" | "failure-recovery" | "weekly-insights";
  user_id: string; // REQUIRED
  question?: string;
  opportunity_id?: string;
  project_id?: string;
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_USER_ID` | No `user_id` in request | Include user_id |
| `USER_NOT_FOUND` | Profile doesn't exist | Create profile first |

---

## 4. `compute-trust`

**Purpose:** Trust score computation, events, decay, freeze/unfreeze

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | No JWT required (service-level) |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `user_trust_profiles` | `user_id`, `trust_score`, `trust_tier`, `is_frozen`, `frozen_reason`, `frozen_at`, `last_activity_at`, `updated_at` | Trust state |
| `trust_events` | `user_id`, `event_type`, `event_source`, `trust_delta`, `trust_before`, `trust_after`, `reference_type`, `reference_id`, `evidence_summary` | Event logging |
| `trust_score_components` | `user_id`, `projects_completed`, `projects_failed`, `partial_deliveries`, `on_time_rate`, `escrow_releases_successful`, `disputes_raised`, `disputes_lost`, `refunds_issued`, `escrow_cancellations`, `avg_peer_rating`, `repeat_collaborations`, `abandoned_collaborations`, `verifications_count`, `institutional_affiliations`, `grants_executed`, `institutional_disputes`, `active_months`, `longest_inactive_days`, `trust_volatility` | Component calc |
| `state_transition_logs` | All columns | Audit trail |
| `admin_audit_logs` | All columns | Admin actions |

### Input Schema

```typescript
interface Request {
  user_id: string; // REQUIRED
  action?: "compute" | "apply_event" | "decay" | "freeze" | "unfreeze";
  event?: {
    event_type: string;
    event_source: string;
    trust_delta: number;
    reference_type?: string;
    reference_id?: string;
    evidence_summary?: string;
  };
  reason?: string;
}
```

### Trust Formula (5-Dimension)

| Dimension | Weight | Calculation |
|-----------|--------|-------------|
| Delivery | 40% | `(completed * 10) + (partial * 5) - (failed * 20) + (on_time_rate * 0.5)` |
| Financial | 25% | `(releases * 8) - (disputes_raised * 5) - (disputes_lost * 25) - (refunds * 10) - (cancellations * 15)` |
| Collaboration | 15% | `(avg_rating * 20) + (repeats * 5) - (abandoned * 30)` |
| Institutional | 10% | `(verifications * 20) + (affiliations * 10) + (grants * 15) - (inst_disputes * 25)` |
| Consistency | 10% | `(active_months * 5, max 50) - (inactive_days / 10, max 30) - (volatility * 10)` |

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_USER_ID` | No `user_id` in request | Include user_id |
| `TRUST_FROZEN` | Profile is frozen | Unfreeze first or check frozen_reason |
| `INVALID_ACTION` | Unknown action type | Use valid action |

---

## 5. `deal-runtime`

**Purpose:** Full deal lifecycle management

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | `user_id` in request body |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `offers` | `id`, `status`, `amount`, `deal_terms`, `sender_id`, `recipient_id`, `completed_at`, `cancelled_at`, `cancellation_reason`, `updated_at` | Deal state |
| `milestones` | `id`, `offer_id`, `title`, `amount`, `due_date`, `status`, `order_index`, `started_at`, `submitted_at`, `submission_notes`, `auto_release_at`, `approved_at`, `approved_by`, `released_at`, `updated_at` | Milestone state |
| `disputes` | `offer_id`, `milestone_id`, `raised_by_id`, `reason`, `status`, `resolution`, `resolved_at` | Dispute tracking |
| `wallets` | `id`, `user_id`, `available_balance`, `total_earned`, `updated_at` | Payments |
| `wallet_transactions` | `wallet_id`, `user_id`, `type`, `amount`, `status`, `description`, `reference_type`, `reference_id` | Payment logs |
| `trust_events` | All columns | Trust updates |
| `state_transition_logs` | All columns | Audit trail |

### State Machines

**Deal States:**
```
draft → proposed → active → completed
                ↓       ↓
            cancelled  disputed → resolved → completed
```

**Milestone States:**
```
pending → in_progress → submitted → approved → released
              ↓            ↓
          cancelled    rejected → in_progress
                          ↓
                       disputed → approved/rejected
```

### Input Schema

```typescript
interface Request {
  action: "create_deal" | "advance_milestone" | "submit_milestone" | "approve_milestone" | 
          "reject_milestone" | "release_payment" | "dispute" | "resolve_dispute" | 
          "cancel_deal" | "complete_deal";
  deal_id?: string;
  milestone_id?: string;
  user_id: string; // REQUIRED
  data?: Record<string, unknown>;
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_USER_ID` | No `user_id` in request | Include user_id |
| `OFFER_NOT_FOUND` | Deal/offer doesn't exist | Use valid deal_id |
| `INVALID_STATE_TRANSITION` | Can't transition from current state | Check state machine |
| `UNAUTHORIZED` | User can't perform this action | Check permissions |
| `MILESTONE_NOT_APPROVED` | Payment release before approval | Approve milestone first |
| `WALLET_NOT_FOUND` | Provider has no wallet | Create wallet first |

---

## 6. `generate-audio-briefing`

**Purpose:** Generate audio briefings for users

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Required | JWT in Authorization header |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Secrets** | Optional | `ELEVENLABS_API_KEY` (falls back to text-only) |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `messages` | `id`, `sender_id`, `created_at` | Activity counts |
| `connection_requests` | `id`, `sender_id`, `receiver_id`, `status`, `updated_at` | Network stats |
| `offer_interest` | `id`, `user_id`, `status`, `created_at`, `offer_id` | Deal stats |
| `offers` | `title`, `status` | Deal details |

### Input Schema

```typescript
interface Request {
  type: "week_review" | "deal_status" | "network_pulse";
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `UNAUTHORIZED` | No/invalid Authorization header | Login and include JWT |
| `INVALID_BRIEFING_TYPE` | Unknown type value | Use valid type |

---

## 7. `market-balancer`

**Purpose:** Supply/demand analysis for marketplace health

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | No JWT required |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `offers` | `id`, `required_skills`, `status`, `created_at` | Supply metrics |
| `profiles` | `id`, `skills` | Demand metrics |

### Output Schema

```typescript
interface MarketMetrics {
  supply: {
    openOpportunities: number;
    avgTimeToFillDays: number;
    byCategory: Record<string, number>;
  };
  demand: {
    activeSeekers: number;
    bySkill: Record<string, number>;
  };
  balance: {
    fillRate: number;
    saturation: "oversaturated" | "balanced" | "undersaturated";
    healthScore: number;
  };
  adjustments: {
    matchingThreshold: number;
    visibilityMultiplier: number;
    notificationFrequency: number;
  };
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_COLUMN` | `required_skills` column missing | Run migration to add column |

---

## 8. `notify-new-bid`

**Purpose:** Email notification for new bids

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | No JWT required |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Secrets** | Optional | `RESEND_API_KEY` (gracefully skips if missing) |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `earning_projects` | `id`, `title`, `owner_id` | Project details |
| `auth.users` | (via admin API) | Owner email |

### Input Schema

```typescript
interface Request {
  projectId: string; // REQUIRED
  bidAmount: number; // REQUIRED
  bidderName: string;
  deliveryDays: number;
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_FIELDS` | No projectId or bidAmount | Include required fields |
| `PROJECT_NOT_FOUND` | Project doesn't exist | Use valid projectId |
| `EMAIL_FAILED` | Resend API error | Check RESEND_API_KEY |

---

## 9. `transcribe-voice-note`

**Purpose:** Audio transcription with sentiment analysis

### Requirements

| Requirement | Type | Details |
|-------------|------|---------|
| **Auth** | Optional | No JWT required |
| **Secrets** | Required | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY` |

### Database Dependencies

| Table | Columns Required | Purpose |
|-------|------------------|---------|
| `voice_notes` | `id`, `storage_path`, `transcript`, `sentiment_score` | Voice note data |

### Storage Dependencies

| Bucket | Purpose |
|--------|---------|
| `voice-notes` | Audio file storage |

### Input Schema

```typescript
interface Request {
  voiceNoteId: string; // REQUIRED
}
```

### Error Modes

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `MISSING_VOICE_NOTE_ID` | No voiceNoteId | Include voiceNoteId |
| `VOICE_NOTE_NOT_FOUND` | Record doesn't exist | Use valid voiceNoteId |
| `DOWNLOAD_FAILED` | Storage file missing | Check storage bucket |
| `TRANSCRIPTION_FAILED` | AI API error | Check logs, retry later |

---

## Summary: Auth & Secret Requirements

| Function | Auth Required | LOVABLE_API_KEY | RESEND_API_KEY | ELEVENLABS_API_KEY |
|----------|---------------|-----------------|----------------|---------------------|
| `ai-platform-intelligence` | No | ✅ Required | — | — |
| `ambient-analyzer` | No | — | — | — |
| `career-copilot` | No (user_id in body) | ✅ Required | — | — |
| `compute-trust` | No (user_id in body) | — | — | — |
| `deal-runtime` | No (user_id in body) | — | — | — |
| `generate-audio-briefing` | ✅ Yes (JWT) | — | — | Optional |
| `market-balancer` | No | — | — | — |
| `notify-new-bid` | No | — | Optional | — |
| `transcribe-voice-note` | No | ✅ Required | — | — |

---

**"Every Edge Function now fails only when it should — never accidentally."**
