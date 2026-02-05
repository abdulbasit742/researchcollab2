# RCollab Buildability Classification

> Ruthless prioritization. Ship what matters.

---

## 🟢 BUILD NOW (Phase 1 - Foundation)

These systems are essential and must be fully operational.

| System | Layer | Current State | Blockers |
|--------|-------|---------------|----------|
| 1. UPOM | Identity | ✅ Hook exists | None |
| 2. Trust Engine | Identity | ✅ Hook exists | Needs DB tables |
| 3. Outcome Graph | Capability | ✅ Hook exists | Needs DB tables |
| 4. Matching Engine | Opportunities | ✅ Hook exists | Needs algorithm tuning |
| 5. Deal Execution | Opportunities | ✅ Hook exists | Needs escrow integration |
| 22. Notifications | Institutions | ✅ Hook exists | Needs push infrastructure |
| 28. Change Explainer | Institutions | ✅ Hook exists | None |
| 29-35. Economics | Economics | ⚠️ Types exist | Needs full implementation |
| 37. Knowledge Objects | Knowledge | ✅ Hook exists | Needs DB tables |
| 46. Capability Graph | Capability | ✅ Hook exists | Needs DB tables |

**Phase 1 Deliverable**: Working professional loop (sign up → verify → match → execute → get paid → build trust)

---

## 🟡 BUILD NEXT (Phase 2 - Growth)

These systems enhance the platform but aren't blocking launch.

| System | Layer | Dependencies | Effort |
|--------|-------|--------------|--------|
| 6. Long-Term Memory | Knowledge | Phase 1 complete | Medium |
| 21. Value Loops | Identity | Trust Engine | Low |
| 23. Silent QC | Identity | Outcome Graph | Medium |
| 24. Market Balancer | Opportunities | Matching Engine | Medium |
| 25. Personal Memory | Identity | Long-Term Memory | Low |
| 38. Knowledge Graph | Knowledge | Knowledge Objects | High |
| 39. Failure Preservation | Knowledge | Knowledge Objects | Low |
| 41. Knowledge Validation | Knowledge | Knowledge Objects | Medium |
| 47. Readiness Engine | Capability | Capability Graph | Medium |
| 49. Skill Gap Engine | Capability | Capability Graph | Medium |
| 50. Performance Outcomes | Capability | Outcome Graph | Low |

**Phase 2 Deliverable**: Knowledge loop + capability evolution

---

## 🟠 BUILD LATER (Phase 3 - Scale)

Institutional and advanced features.

| System | Layer | Prerequisites | Notes |
|--------|-------|---------------|-------|
| 9. Extensibility | Intelligence | Stable API | Plugins, webhooks |
| 26. Institutional Feedback | Institutions | 100+ orgs | Aggregate analytics |
| 27. Power Dampening | Identity | Power users | Anti-monopoly |
| 40. Institutional Vaults | Knowledge | Org verification | Access control |
| 42. AI Historian | Knowledge | Knowledge Graph | AI synthesis |
| 43. Legacy & Succession | Knowledge | Long-Term Memory | Estate planning |
| 48. Talent Allocation | Opportunities | Capability Graph | Org-level matching |
| 51. Talent Strategy | Institutions | Multiple orgs | Dashboards |
| 52. Career Evolution | Capability | Long-Term Memory | Transition paths |

**Phase 3 Deliverable**: Institutional OS

---

## 🔴 PARK (Do Not Build Yet)

These systems are speculative or require ecosystem maturity.

| System | Reason | Revisit When |
|--------|--------|--------------|
| 54. National Human Capital | No government partnerships | 2+ year |
| 55-62. Crisis Coordination | Requires institutional adoption | 1+ year |
| Global Interoperability | No cross-border demand | 2+ year |
| AI Constitutional Rules | Premature governance | 1+ year |

**Parked systems remain in codebase as hooks but are not surfaced in UI.**

---

## 📊 Execution Stack Alignment

### Frontend Areas
```
/src/pages/
├── Home.tsx              → Layer 1-2 (Identity, Capability)
├── Opportunities.tsx     → Layer 3 (Opportunities)
├── Deals.tsx             → Layer 3-4 (Execution, Economics)
├── Progress.tsx          → Layer 2 (Capability)
├── Career.tsx            → Layer 2, 7 (Capability, AI)
├── Profile.tsx           → Layer 1 (Identity)
├── Institution.tsx       → Layer 6 (Governance)
└── Admin.tsx             → Layer 6-7 (Governance, Automation)
```

### Backend Services (Edge Functions)
```
/supabase/functions/
├── trust-compute/        → Layer 1
├── matching-engine/      → Layer 3
├── deal-execute/         → Layer 3
├── payment-process/      → Layer 4
├── notification-send/    → Layer 6
└── ai-assist/            → Layer 7
```

### Database Tables (Priority)
```
Priority 1 (Now):
- profiles, trust_scores, outcomes, deals, opportunities

Priority 2 (Next):
- knowledge_objects, capabilities, skill_gaps

Priority 3 (Later):
- institutional_vaults, crisis_events, coordination_graphs
```

---

## ⚠️ Orphan Detection

### Hooks Without UI
- `usePowerSafeguards` → Park (no crisis mode UI)
- `useGlobalCoordination` → Park (no partner UI)
- `useNationalHumanCapital` → Park (no sovereign UI)

### UI Without Logic
- Crisis components → Disable until Phase 3
- Institutional dashboards → Gate behind org verification

### Recommendation
Create a `FeatureGate` component that hides parked systems based on:
1. User tier
2. Feature flag
3. Org verification status

---

## 🎯 Build Order Summary

| Quarter | Focus | Systems |
|---------|-------|---------|
| Q1 | Core Loop | 1-5, 22, 28, 29-35, 37, 46 |
| Q2 | Knowledge | 6, 21, 23-25, 38-39, 41, 47, 49-50 |
| Q3 | Institutions | 9, 26-27, 40, 42-43, 48, 51-52 |
| Q4+ | Scale | 53-62 (as demand emerges) |
