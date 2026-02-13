

# Research Papers Access + Monetization Pricing System

## What Gets Built

### 1. Enhanced Research Papers Hub with Access Control

Currently the Research Papers page (`/research-papers`) shows all 12 sample papers with "Open Access" / "Restricted" badges but no actual gating. We will add real access control:

**Changes to `useResearchPapers.ts`:**
- Import `useUserSubscription` to check current plan
- Add `userTier` state ("free" | "pro" | "elite")
- Gate "Restricted" papers: free users see title + abstract only, cannot AI Summarize or access full content
- Pro users unlock all restricted papers
- Elite users get unlimited AI tool usage (summarize, compare, gap finder, lit review, bibliography)
- Free users get 3 AI actions/session, Pro gets 20/month

**Changes to `PaperCard.tsx`:**
- Add lock icon overlay on restricted papers for free users
- Show "Upgrade to Access" button instead of "AI Summarize" for locked papers
- Show tier badge indicating what plan unlocks this paper

### 2. Research Papers Discovery Section on Landing Page

**New component: `src/components/home/ResearchDiscoverySection.tsx`**
- Added between `FeaturesSection` and `WhyChooseSection` on the landing page
- Shows 4 featured papers (open access) with clean cards
- Search bar preview (typing redirects to `/research-papers`)
- Stats: "12,000+ Papers | 50+ Fields | AI-Powered Analysis"
- CTA: "Explore Research Hub" linking to `/research-papers`

**Update `src/pages/Index.tsx`:**
- Import and add `ResearchDiscoverySection`

### 3. Research + AI Tools Pricing Section

**Update `src/pages/PricingPage.tsx`:**
- Add a 4th tab: "Research" alongside Individual, AI Tools, Enterprise
- Research tab shows 3 tiers:

```text
Free Researcher (PKR 0/mo)
- Access to Open Access papers only
- 3 AI summaries/month
- Basic search & filters
- Reading stats tracking

Pro Researcher (PKR 999/mo)
- All papers unlocked (Open + Restricted)
- 50 AI summaries/month
- Paper comparison (up to 5/month)
- Research Gap Finder
- Lit Review Generator
- Export citations

Elite Researcher (PKR 2,499/mo)
- Everything in Pro
- Unlimited AI actions
- Annotated Bibliography generator
- Document Chat (ask questions to papers)
- Plain English toggle
- Priority AI processing
- API access to research tools
```

- Below tiers: "Paper + AI Tools Combo" pricing table showing value ratios:
  - Research Pro + AI Essentials bundle = PKR 7,999 (Save PKR 1,500)
  - Research Elite + Research Pro AI bundle = PKR 14,999 (Save PKR 3,500)
  - Full Academic Suite (Elite + Ultimate AI + Enterprise) = Custom

### 4. Add Research Papers to Navbar

**Update `src/components/layout/Navbar.tsx`:**
- Add "Research" nav item with BookOpen icon linking to `/research-papers`
- Positioned after "Opportunities" in the nav items array

## Technical Details

### New Files (1)
1. `src/components/home/ResearchDiscoverySection.tsx` -- landing page section

### Modified Files (4)
1. `src/hooks/useResearchPapers.ts` -- add subscription-aware gating logic
2. `src/components/research/PaperCard.tsx` -- add lock overlay for restricted papers
3. `src/pages/PricingPage.tsx` -- add Research pricing tab with tier cards and combo bundles
4. `src/pages/Index.tsx` -- add ResearchDiscoverySection
5. `src/components/layout/Navbar.tsx` -- add Research nav link

### No Database Changes
- Uses existing `subscription_tiers` and `user_subscriptions` tables
- Research access level derived from subscription tier (Free/Pro/Elite mapping)
- AI usage limits tracked client-side per session (can be upgraded to DB tracking later)

### Access Control Logic
- `access === "Open Access"` -- available to all users
- `access === "Restricted"` -- requires Pro or Elite subscription
- AI features (summarize, compare, gap finder, lit review, bibliography, chat) -- metered by tier
- Free: 3 AI actions/session
- Pro: 50/month
- Elite: unlimited
