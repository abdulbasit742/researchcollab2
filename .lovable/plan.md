

# Expand Earn Page Pricing with Research Papers + AI Tools Bundles

Add the full Research Paper access tiers and AI Tools bundles below the existing individual plans on the Earn page pricing section, so users can see everything in one place.

## What You Get

- **Research Paper Tiers** section with 3 cards: Free Researcher (PKR 0), Pro Researcher (PKR 999/mo), Elite Researcher (PKR 2,499/mo) -- each with detailed feature lists
- **AI Tools Bundles** section with 4 bundle cards from `src/data/tools.ts`: Research Starter (PKR 10,800), Publication Ready (PKR 16,400), Data Science (PKR 18,000), Complete Research Suite (PKR 27,500) -- showing discount badges, included tools, and original prices with strikethrough
- **Combo Deals** section with 3 combo offers that pair research tiers + AI tool bundles at discounted rates
- All sections use the same animated card style (framer-motion scroll-in) as the existing plans
- Responsive grids: 1 column on mobile, 3 on desktop (4 columns for bundles on large screens)
- "Pro Researcher" highlighted as most popular in research tiers

## Changes

### 1. Edit `src/components/earn/EarnPricingSection.tsx`

Add three new subsections below the existing individual plans:

**Section A -- Research Paper Access Tiers:**
- Free Researcher: Open Access papers, 3 AI summaries/month, basic search, reading stats
- Pro Researcher (Popular): All papers unlocked, 50 AI summaries, paper comparison, Research Gap Finder, Lit Review Generator, export citations
- Elite Researcher: Everything in Pro + unlimited AI, Annotated Bibliography, Document Chat, Plain English toggle, priority processing, API access

**Section B -- AI Tools Bundles:**
- Import `toolBundles` and `tools` from `src/data/tools.ts`
- Display each bundle card with: name, description, bundle price (PKR), original price with strikethrough, discount badge (e.g., "34% OFF"), and list of included tool names
- 4-column grid on desktop, 2 on tablet, 1 on mobile

**Section C -- Combo Deals:**
- Research Pro + AI Essentials (PKR 7,999, save PKR 1,500)
- Research Elite + Research Pro AI (PKR 14,999, save PKR 3,500)
- Full Academic Suite (Custom pricing)

Each section gets its own heading badge and animated entrance.

## Files

| File | Action |
|------|--------|
| `src/components/earn/EarnPricingSection.tsx` | Edit (add research tiers, AI bundles, combo deals sections) |

