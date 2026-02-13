

# Complete Pricing Section with All Missing Features

The pricing currently lives in **two places**:
1. **Earn Page** (`/earn`) -- has plans, research tiers, AI bundles, and combo deals at the bottom
2. **Pricing Page** (`/pricing`) -- dedicated page with 4 tabs: Individual, AI Tools, Research, Enterprise

Several features you mentioned are **missing from both**. Here is what needs to be added:

## What Is Missing

| Feature | Status |
|---------|--------|
| All research papers unlocked | Exists (Pro/Elite tiers) |
| AI tools bundles | Exists (4 bundles + combo deals) |
| **Bid tokens** (monthly bid allocation per tier) | Missing |
| **Free word/document usage** (e.g., free AI word processing quota) | Missing |
| **1 free peer review** per month | Missing |
| **Verified universities** perks/badge | Missing |
| Feature comparison table across all tiers | Missing |

## Changes

### 1. Update Individual Plans features (both Earn + Pricing pages)

Add the missing perks to each tier:

**Free Plan:**
- 3 bids/month (existing)
- Add: 1,000 free AI words/month
- Add: No peer review included

**Student Plan (PKR 499):**
- Unlimited bids (existing)
- Add: 10,000 free AI words/month
- Add: 1 free peer review/month
- Add: Verified university badge (if .edu email)

**Researcher Plan (PKR 1,999):**
- Unlimited bids + projects (existing)
- Add: 50,000 free AI words/month
- Add: 3 free peer reviews/month
- Add: Verified university badge + institution spotlight

### 2. Update Research Tiers features

**Pro Researcher (PKR 999):**
- Add: 5 bid tokens/month for research collaborations
- Add: 1 free peer review request

**Elite Researcher (PKR 2,499):**
- Add: 15 bid tokens/month
- Add: 3 free peer reviews/month
- Add: Verified institution badge

### 3. Add "All-in-One Comparison Table" to Pricing Page

Add a new tab or section showing a side-by-side feature matrix:

| Feature | Free | Student | Researcher | Pro Research | Elite Research |
|---------|------|---------|------------|-------------|----------------|
| Bids/month | 3 | Unlimited | Unlimited | 5 tokens | 15 tokens |
| AI words/month | 1,000 | 10,000 | 50,000 | 50 summaries | Unlimited |
| Peer reviews | -- | 1 free | 3 free | 1 free | 3 free |
| Research papers | Open Access | Open Access | Open Access | All unlocked | All unlocked |
| Verified university | -- | Badge | Badge + Spotlight | -- | Badge |
| AI tools | Basic | Discounted | Full access | Research tools | All tools |

### 4. Add "Verified Universities" section to Pricing Page

A small trust banner below the plans showing:
- "Trusted by 50+ verified Pakistani universities"
- University logos/badges
- "Students with .edu email get automatic verification"

## Files to Change

| File | Action |
|------|--------|
| `src/components/earn/EarnPricingSection.tsx` | Update plan features with bid tokens, free words, peer reviews, university badge |
| `src/pages/PricingPage.tsx` | Update all plan features + add comparison table section + verified universities banner |

