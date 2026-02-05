# RCollab Power, Complexity & Failure Budgets

> If a system exceeds its budget, it must be simplified or disabled.

---

## 🎚️ Complexity Budget

### Per-Layer Limits

| Layer | Max Systems | Max Hooks | Max UI Components |
|-------|-------------|-----------|-------------------|
| 1. Identity & Trust | 7 | 10 | 15 |
| 2. Capability & Outcomes | 6 | 8 | 12 |
| 3. Opportunities & Execution | 5 | 7 | 10 |
| 4. Economics & Incentives | 8 | 10 | 12 |
| 5. Knowledge & Memory | 10 | 12 | 15 |
| 6. Institutions & Governance | 12 | 15 | 20 |
| 7. Intelligence & Automation | 4 | 6 | 8 |

### Current Status
- Total hooks: ~45 (within budget)
- Total components: ~120 (within budget)
- **Action**: Consolidate similar hooks where possible

---

## 👑 Admin Power Budget

### Permission Levels

| Level | Actions | Audit Requirement |
|-------|---------|-------------------|
| 0 - User | Own data only | None |
| 1 - Moderator | Flag content, soft actions | Logged |
| 2 - Admin | User management, feature flags | Logged + reviewed |
| 3 - Super Admin | Schema changes, kill switches | Multi-approval |
| 4 - Platform | Constitutional changes | Governance vote |

### Power Caps
- No single admin can affect > 1000 users without review
- Kill switches auto-expire after 24 hours
- Schema changes require 2+ approvals
- Trust score modifications require audit trail

---

## 🤖 Automation Budget

### AI Authority Limits

| Capability | AI Can | AI Cannot |
|------------|--------|-----------|
| Matching | Suggest matches | Auto-accept deals |
| Trust | Explain factors | Modify scores |
| Knowledge | Synthesize | Create without attribution |
| Notifications | Prioritize | Send without consent |
| Decisions | Advise | Execute without human |

### Automation Thresholds
- Auto-actions limited to < 100/hour per user
- AI suggestions require human confirmation for:
  - Financial transactions > $100
  - Trust-affecting actions
  - Public content publication
  - Institutional decisions

---

## 💥 Failure Budget

### Acceptable Failure Rates

| System | Max Failure Rate | Recovery Time |
|--------|------------------|---------------|
| Authentication | 0.01% | < 1 min |
| Trust Computation | 0.1% | < 5 min |
| Matching | 1% | < 15 min |
| Notifications | 2% | < 1 hour |
| AI Features | 5% | < 4 hours |
| Knowledge Sync | 5% | < 24 hours |

### Graceful Degradation Order
1. AI features → fallback to manual
2. Knowledge sync → cache mode
3. Matching → show recent only
4. Notifications → queue for later
5. Trust computation → use cached score
6. Authentication → NEVER degrade

---

## 📉 Simplification Triggers

A system MUST be simplified when:

1. **Cognitive Load**: > 3 concepts to explain to new user
2. **Dependencies**: > 5 cross-layer dependencies
3. **Failure Rate**: Exceeds budget for 7 days
4. **Adoption**: < 10% of eligible users in 90 days
5. **Maintenance**: > 20 hours/month of bug fixes

### Simplification Actions
1. Hide from UI (keep logic)
2. Merge with parent system
3. Convert to opt-in
4. Move to experimental
5. Archive (preserve data, remove code)

---

## 🔄 Evolution Constraints

### 1-Year Horizon
- Core systems frozen (no API changes)
- Extended systems may evolve
- New systems require layer assignment

### 5-Year Horizon
- Layer boundaries may shift
- Systems may merge or split
- New layers require governance approval

### 20-Year Horizon
- Platform constitution may amend
- Stewardship may transfer
- Knowledge must remain accessible

### Non-Negotiables (Forever)
1. Trust data never deleted
2. Outcome records immutable
3. User can always export
4. No surveillance systems
5. Human override always possible

---

## 🎯 Budget Enforcement

### Weekly Review
- [ ] Hook count per layer
- [ ] Failure rate check
- [ ] Adoption metrics
- [ ] Complexity complaints

### Monthly Review
- [ ] Power usage audit
- [ ] Automation threshold check
- [ ] Simplification candidates
- [ ] Layer boundary health

### Quarterly Review
- [ ] Evolution path alignment
- [ ] Budget adjustments
- [ ] System retirement decisions
- [ ] New system proposals
