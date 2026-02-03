
# Academic Forge Flow - Phase 2: Scale, Intelligence, Monetization & Enterprise Hardening

## Executive Summary

This plan evolves the existing production-ready Academic Forge Flow platform into a globally scalable, enterprise-grade, revenue-optimized academic marketplace. The implementation is structured across 9 major workstreams, extending (not replacing) the current 29-table PostgreSQL schema with RLS.

---

## Implementation Phases Overview

| Phase | Focus Area | Estimated Scope | Priority |
|-------|-----------|-----------------|----------|
| 1 | Advanced Trust & Reputation Engine | 3 new tables, 2 functions, UI updates | Critical |
| 2 | Rating & Review System | 2 new tables, review logic, UI components | Critical |
| 3 | Escrow & Payment Hardening | Table extensions, edge functions, workflows | High |
| 4 | AI Intelligence Layer | 1 edge function (multi-capability), UI integration | High |
| 5 | Enterprise/University Mode | 3 new tables, department hierarchy, admin tools | Medium |
| 6 | Advanced Admin Safety Controls | 3 new tables, risk dashboard, moderation queue | High |
| 7 | UX/Conversion Optimization | Onboarding improvements, draft saving, tooltips | Medium |
| 8 | Monetization Expansion | Subscription tiers, featured listings, credit packs | Medium |
| 9 | Performance & Scalability | Indexes, pagination, query optimization | Ongoing |

---

## Phase 1: Advanced Trust & Reputation Engine

### Database Changes

**New Table: `trust_score_history`**
```text
┌─────────────────────────────────────────────┐
│ trust_score_history                         │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ user_id (uuid, FK profiles)                 │
│ previous_score (integer)                    │
│ new_score (integer)                         │
│ change_reason (text)                        │
│ change_source (text) - system/admin/project │
│ metadata (jsonb) - details                  │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**Extend `user_trust_profiles` table:**
- Add `trust_tier` column (enum: bronze, silver, gold, platinum)
- Add `last_activity_at` (timestamptz)
- Add `decay_applied_at` (timestamptz)
- Add `financial_reliability_score` (integer, 0-100)
- Add `dispute_rate` (numeric)
- Add `avg_milestone_approval_hours` (numeric)
- Add `is_frozen` (boolean, default false)
- Add `frozen_reason` (text)
- Add `frozen_at` (timestamptz)
- Add `frozen_by` (uuid)

**New Table: `trust_tier_requirements`**
```text
┌─────────────────────────────────────────────┐
│ trust_tier_requirements                     │
├─────────────────────────────────────────────┤
│ tier (text, PK) - bronze/silver/gold/plat   │
│ min_trust_score (integer)                   │
│ min_projects_completed (integer)            │
│ requires_verification (boolean)             │
│ max_budget_access (numeric) - PKR limit     │
│ org_access_allowed (boolean)                │
│ priority_support (boolean)                  │
│ description (text)                          │
└─────────────────────────────────────────────┘
```

### Backend Logic

**Database Function: `calculate_dynamic_trust_score(user_id uuid)`**
- Calculates weighted score from:
  - On-time delivery rate (15 points)
  - Milestone approval speed (10 points)
  - Dispute frequency (15 points negative)
  - Ratings average (15 points)
  - Verification depth (30 points)
  - Financial reliability (15 points)
- Returns updated score and tier

**Database Trigger: `on_milestone_complete`**
- Recalculates trust score when milestones are approved
- Updates `avg_milestone_approval_hours`
- Records change in `trust_score_history`

**Scheduled Function: `apply_trust_decay`**
- Runs weekly via pg_cron
- Reduces score by 2% for users inactive > 90 days
- Records decay in history

### Admin Controls

- Trust score override form (set score, add reason)
- Freeze/unfreeze trust profile button
- Audit trust score history table
- Manual tier assignment override

### Frontend Components

- `TrustTierBadge` - displays tier with icon
- `TrustScoreHistoryTimeline` - shows score changes
- Enhanced `TrustScoreCard` with tier display
- Admin `TrustManagementPanel` component

---

## Phase 2: Rating & Review System

### Database Changes

**New Table: `project_reviews`**
```text
┌─────────────────────────────────────────────┐
│ project_reviews                             │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ offer_id (uuid, FK offers)                  │
│ reviewer_id (uuid, FK profiles)             │
│ reviewee_id (uuid, FK profiles)             │
│ overall_rating (integer, 1-5)               │
│ communication_rating (integer, 1-5)         │
│ quality_rating (integer, 1-5)               │
│ timeliness_rating (integer, 1-5)            │
│ comment (text)                              │
│ is_visible (boolean, default false)         │
│ visibility_unlocked_at (timestamptz)        │
│ moderation_status (text) - pending/approved │
│ moderation_notes (text)                     │
│ moderated_by (uuid)                         │
│ moderated_at (timestamptz)                  │
│ created_at (timestamptz)                    │
│ updated_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**New Table: `review_unlock_queue`**
```text
┌─────────────────────────────────────────────┐
│ review_unlock_queue                         │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ offer_id (uuid, FK offers)                  │
│ reviewer_a_id (uuid)                        │
│ reviewer_b_id (uuid)                        │
│ review_a_submitted (boolean)                │
│ review_b_submitted (boolean)                │
│ unlock_deadline (timestamptz)               │
│ unlocked_at (timestamptz)                   │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

### Backend Logic

**Double-Blind Review Flow:**
1. On offer completion, create `review_unlock_queue` entry
2. Both parties submit reviews (not visible)
3. When both submit OR 7-day timeout expires:
   - Set `is_visible = true` on both reviews
   - Trigger trust score recalculation
4. Reviews with profanity/abuse flagged for moderation

**Database Function: `unlock_reviews(offer_id uuid)`**
- Makes both reviews visible
- Updates reviewer trust scores
- Sends notification to both parties

### Frontend Components

- `ReviewSubmitModal` - structured feedback form
- `ReviewCard` - displays individual review
- `ProfileReviewsSection` - aggregated reviews on public profile
- `ReviewModerationQueue` - admin review moderation

---

## Phase 3: Escrow & Payment Hardening

### Database Changes

**Extend `milestones` table:**
- Add `auto_release_at` (timestamptz)
- Add `partial_release_amount` (numeric)
- Add `approval_reminder_sent` (boolean)

**Extend `disputes` table:**
- Add `escalation_level` (integer, 1-3)
- Add `auto_mediation_result` (text)
- Add `arbitration_deadline` (timestamptz)
- Add `evidence_files` (jsonb)

**Extend `wallets` table:**
- Add `is_frozen` (boolean)
- Add `frozen_reason` (text)
- Add `fraud_flags` (jsonb)
- Add `risk_score` (integer)

**New Table: `platform_fee_rules`**
```text
┌─────────────────────────────────────────────┐
│ platform_fee_rules                          │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ role (text) - student/researcher/org        │
│ fee_percentage (numeric)                    │
│ min_fee (numeric)                           │
│ max_fee (numeric)                           │
│ is_active (boolean)                         │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

### Backend Logic (Edge Functions)

**`escrow-auto-release` (scheduled)**
- Checks milestones where `auto_release_at < now()`
- Auto-releases if no dispute within 7 days of submission
- Logs action in audit trail

**`dispute-escalation` function**
- Level 1: Auto-mediation (24h)
- Level 2: Admin queue (48h)
- Level 3: Senior arbitration
- Partial release capability

**`fraud-detection` function**
- Flags suspicious patterns:
  - Multiple rapid withdrawals
  - Large escrow movements
  - Account age vs transaction volume
- Updates `wallets.fraud_flags`

### Admin Controls

- Freeze/unfreeze wallet button
- View fraud flags and risk score
- Configure fee rules per role
- Partial milestone release action
- Dispute resolution with evidence viewer

---

## Phase 4: AI Intelligence Layer

### Edge Function: `ai-platform-intelligence`

**Capabilities (single function, multiple endpoints):**

1. **Project Feasibility Check** (`/feasibility`)
   - Input: project description, budget, timeline
   - Output: feasibility score, risk factors, suggestions
   - Used before project posting

2. **Bid Quality Scoring** (`/bid-score`)
   - Input: bid details, bidder profile, project requirements
   - Output: quality score (private), ranking factors
   - Powers bid sorting (not shown to users)

3. **Research Match Confidence** (`/match-confidence`)
   - Input: project requirements, candidate profile
   - Output: match percentage, skill gaps, recommendations

4. **Profile Strength Analysis** (`/profile-strength`)
   - Input: user profile data
   - Output: strength score, improvement suggestions
   - Displayed on profile page

5. **Suggested Pricing** (`/suggested-pricing`)
   - Input: project scope, category, market data
   - Output: price range, market benchmarks

### Implementation Notes

- Uses Lovable AI models (no API key required)
- All outputs are advisory, not authoritative
- Results stored in `ai_analysis_cache` table for 24h
- Explainability text included with every score

### Frontend Integration

- `AIFeasibilityCard` on project creation
- `ProfileStrengthWidget` on profile page
- `AISuggestedPricing` in project form
- Bid list sorted by AI quality score (hidden metric)

---

## Phase 5: Enterprise/University Mode

### Database Changes

**Extend `organizations` table:**
- Add `parent_org_id` (uuid, self-reference for sub-orgs)
- Add `org_trust_score` (integer)
- Add `sla_tier` (text)
- Add `custom_pricing_enabled` (boolean)
- Add `invoice_prefix` (text)
- Add `data_retention_days` (integer)

**New Table: `org_departments`**
```text
┌─────────────────────────────────────────────┐
│ org_departments                             │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ org_id (uuid, FK organizations)             │
│ name (text)                                 │
│ head_user_id (uuid, FK profiles)            │
│ budget_limit (numeric)                      │
│ member_limit (integer)                      │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**Extend `organization_members` table:**
- Add `department_id` (uuid, FK org_departments)
- Add `is_faculty_admin` (boolean)

**New Table: `student_cohorts`**
```text
┌─────────────────────────────────────────────┐
│ student_cohorts                             │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ org_id (uuid, FK organizations)             │
│ name (text) - e.g., "Fall 2024 MS Students" │
│ start_date (date)                           │
│ end_date (date)                             │
│ supervisor_id (uuid)                        │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**New Table: `cohort_members`**
```text
┌─────────────────────────────────────────────┐
│ cohort_members                              │
├─────────────────────────────────────────────┤
│ cohort_id (uuid, FK student_cohorts)        │
│ user_id (uuid, FK profiles)                 │
│ enrollment_status (text)                    │
│ joined_at (timestamptz)                     │
└─────────────────────────────────────────────┘
```

**New Table: `org_internal_projects`**
```text
┌─────────────────────────────────────────────┐
│ org_internal_projects                       │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ org_id (uuid, FK organizations)             │
│ department_id (uuid, FK org_departments)    │
│ earning_project_id (uuid, FK earning_proj)  │
│ visibility (text) - org_only/public         │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

### Frontend Pages

- `OrganizationHierarchyPage` - department tree view
- `CohortManagementPage` - manage student groups
- `OrgAnalyticsDashboard` - usage metrics per department
- `OrgDataExportPage` - compliance data exports

---

## Phase 6: Advanced Admin Safety Controls

### Database Changes

**New Table: `user_restrictions`**
```text
┌─────────────────────────────────────────────┐
│ user_restrictions                           │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ user_id (uuid, FK profiles)                 │
│ restriction_type (text) - shadow_ban/limit  │
│ reason (text)                               │
│ applied_by (uuid)                           │
│ expires_at (timestamptz)                    │
│ is_active (boolean)                         │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**New Table: `admin_notes`**
```text
┌─────────────────────────────────────────────┐
│ admin_notes                                 │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ entity_type (text) - user/project/org       │
│ entity_id (uuid)                            │
│ note (text)                                 │
│ created_by (uuid)                           │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**New Table: `rate_limits`**
```text
┌─────────────────────────────────────────────┐
│ rate_limits                                 │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ action_type (text) - bid/message/project    │
│ role (text) - student/researcher/all        │
│ max_per_hour (integer)                      │
│ max_per_day (integer)                       │
│ is_active (boolean)                         │
└─────────────────────────────────────────────┘
```

**New Table: `flagged_behaviors`**
```text
┌─────────────────────────────────────────────┐
│ flagged_behaviors                           │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ user_id (uuid, FK profiles)                 │
│ behavior_type (text)                        │
│ severity (text) - low/medium/high/critical  │
│ auto_flagged (boolean)                      │
│ ai_confidence (numeric)                     │
│ reviewed (boolean)                          │
│ reviewed_by (uuid)                          │
│ action_taken (text)                         │
│ created_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

### Admin Pages

- `AdminRiskDashboard` - risk metrics overview
- `AdminModerationQueue` - flagged behaviors queue
- `AdminBulkActionsPage` - mass enforcement tools
- Enhanced user detail with admin notes panel

---

## Phase 7: UX/Conversion Optimization

### Features

**Progressive Onboarding:**
- Role-specific onboarding flows
- Contextual step indicators
- Skip with "remind later" option

**Feature Gating with Education:**
- Locked features show tooltip explaining unlock criteria
- Trust tier requirements displayed clearly
- "How to unlock" guidance

**Draft Saving:**
- Auto-save projects, bids, offers every 30s
- "Drafts" section in relevant pages
- Resume editing from drafts

**Smart CTAs:**
- Behavior-based CTA suggestions
- "Complete your profile" prompts
- "Post your first project" nudges

**First Success Checklists:**
- Student checklist: Profile → Verify → First bid → First project
- Researcher checklist: Profile → Post project → Accept bid → Complete milestone

### Frontend Components

- `OnboardingChecklist` - sidebar widget
- `FeatureLockedTooltip` - explains unlock criteria
- `DraftsBanner` - shows pending drafts
- `SmartCTABanner` - contextual suggestions

---

## Phase 8: Monetization Expansion

### Database Changes

**New Table: `subscription_tiers`**
```text
┌─────────────────────────────────────────────┐
│ subscription_tiers                          │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ name (text) - Free/Pro/Elite                │
│ price_monthly (numeric)                     │
│ price_yearly (numeric)                      │
│ features (jsonb)                            │
│ max_projects_month (integer)                │
│ max_bids_month (integer)                    │
│ priority_support (boolean)                  │
│ featured_profile (boolean)                  │
│ ai_credits_included (integer)               │
│ is_active (boolean)                         │
└─────────────────────────────────────────────┘
```

**New Table: `user_subscriptions`**
```text
┌─────────────────────────────────────────────┐
│ user_subscriptions                          │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ user_id (uuid, FK profiles)                 │
│ tier_id (uuid, FK subscription_tiers)       │
│ status (text)                               │
│ started_at (timestamptz)                    │
│ expires_at (timestamptz)                    │
│ auto_renew (boolean)                        │
│ payment_method_id (text)                    │
└─────────────────────────────────────────────┘
```

**New Table: `featured_listings`**
```text
┌─────────────────────────────────────────────┐
│ featured_listings                           │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ listing_type (text) - project/profile       │
│ listing_id (uuid)                           │
│ user_id (uuid)                              │
│ boost_level (integer, 1-3)                  │
│ amount_paid (numeric)                       │
│ starts_at (timestamptz)                     │
│ expires_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

**New Table: `ai_credit_packs`**
```text
┌─────────────────────────────────────────────┐
│ ai_credit_packs                             │
├─────────────────────────────────────────────┤
│ id (uuid, PK)                               │
│ name (text)                                 │
│ credits (integer)                           │
│ price (numeric)                             │
│ is_active (boolean)                         │
└─────────────────────────────────────────────┘
```

**New Table: `user_ai_credits`**
```text
┌─────────────────────────────────────────────┐
│ user_ai_credits                             │
├─────────────────────────────────────────────┤
│ user_id (uuid, PK, FK profiles)             │
│ balance (integer)                           │
│ updated_at (timestamptz)                    │
└─────────────────────────────────────────────┘
```

### Admin Platform Settings Extensions

Add new keys to `platform_settings`:
- `subscription_enabled`
- `featured_listing_prices`
- `priority_dispute_fee`
- `affiliate_tier_multipliers`

---

## Phase 9: Performance & Scalability

### Database Optimizations

**New Indexes:**
```sql
-- Trust profile lookups
CREATE INDEX idx_user_trust_profiles_tier 
ON user_trust_profiles(trust_tier);

-- Project queries
CREATE INDEX idx_earning_projects_status_created 
ON earning_projects(status, created_at DESC);

-- Bid queries
CREATE INDEX idx_earning_bids_project_created 
ON earning_bids(project_id, created_at DESC);

-- Review visibility
CREATE INDEX idx_project_reviews_visible_reviewee 
ON project_reviews(reviewee_id) WHERE is_visible = true;

-- Transaction history
CREATE INDEX idx_wallet_transactions_wallet_created 
ON wallet_transactions(wallet_id, created_at DESC);
```

### Query Optimizations

- Replace N+1 queries with JOINs in hooks
- Add `.limit()` to all list queries
- Implement cursor-based pagination for large datasets
- Add query result caching where appropriate

### Real-time Optimization

- Reduce subscription scope to necessary tables only
- Implement channel cleanup on component unmount
- Batch real-time updates where possible

---

## Security Considerations

1. **RLS Policies**: All new tables will have appropriate RLS policies following existing patterns
2. **Admin Functions**: Use SECURITY DEFINER pattern for admin operations
3. **Input Validation**: Server-side validation on all edge functions
4. **Audit Trail**: All admin actions logged to `admin_audit_logs`
5. **Rate Limiting**: Configurable limits on sensitive operations

---

## Implementation Order Recommendation

1. **Week 1-2**: Trust Engine + Review System (foundational)
2. **Week 3**: Escrow Hardening (financial safety)
3. **Week 4**: AI Intelligence Layer (differentiator)
4. **Week 5-6**: Enterprise Mode (revenue driver)
5. **Week 7**: Admin Safety Controls (operational)
6. **Week 8**: UX Optimization + Monetization (growth)
7. **Ongoing**: Performance optimization

---

## Technical Notes

- All database changes via Supabase migrations
- Edge functions deployed automatically
- Uses existing design system and component patterns
- Mobile-first responsive design maintained
- PKR currency standard preserved throughout
