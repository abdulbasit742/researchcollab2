

# Add AI Functionality Across All Features

## Current State

Your platform already has **2 working AI edge functions** (`career-copilot` and `ai-platform-intelligence`) that use Lovable AI, plus **160+ hooks** with local/mock logic for things like knowledge management, skill gap analysis, career modeling, etc. Most of these hooks compute results locally with placeholder logic rather than calling actual AI.

## Strategy: Universal AI Edge Function + Progressive Integration

Rather than creating 50+ individual edge functions, we'll build **one powerful multi-purpose AI edge function** that handles all feature domains, then wire it into existing hooks.

## Phase 1: Universal AI Backend (Edge Function)

Create a single `ai-universal` edge function that accepts a `domain` and `action` parameter to handle any AI request across the platform:

- **Knowledge Management**: Knowledge gap analysis, learning path generation, insight extraction, decay prevention
- **Career Intelligence**: Trajectory modeling, opportunity forecasting, skill gap prediction, salary benchmarking
- **Deal Intelligence**: Proposal writing, scope analysis, risk assessment, negotiation advice
- **Messages**: Smart replies, conversation summaries, sentiment analysis
- **Trust Analysis**: Trust trajectory advice, recovery planning, peer comparison
- **Research**: Literature review assistance, methodology suggestions, abstract generation
- **Profile**: Bio optimization, skill recommendations, portfolio analysis
- **Matching**: Enhanced match explanations, compatibility deep-dives

## Phase 2: Wire Hooks to Real AI

Update the most impactful hooks to call the new edge function instead of using local mock logic:

1. `useKnowledgeManagement` - Real AI for knowledge gaps, learning paths, decay analysis
2. `useAIIntelligence` / `useAIIntelligenceSimple` - Real AI for career modeling, forecasting
3. `useCareerCopilot` - Already working, extend with more capabilities
4. `useAIPlatformIntelligence` - Already working, extend domains
5. `useSemanticSearch` - AI-powered search across all content
6. `useRecommendations` - AI-driven personalized recommendations

## Phase 3: Global AI Chat Assistant

Add a floating AI chat button accessible from every page that:

- Understands the user's current page context
- Can answer questions about any feature
- Provides streaming responses
- Remembers conversation history within a session

## Phase 4: Embedded AI Widgets

Add small AI-powered components to key pages:

- **Deals page**: "AI suggests" badge on matching opportunities
- **Profile page**: "AI Profile Score" card with improvement tips
- **Messages**: "Smart Reply" suggestions above the input
- **Knowledge page**: "AI Learning Plan" generator
- **Career page**: "AI Career Forecast" visualization

---

## Technical Details

### New Edge Function: `ai-universal`

A single edge function at `supabase/functions/ai-universal/index.ts` that:

- Accepts `{ domain, action, context, user_id }` 
- Builds domain-specific system prompts based on `domain` + `action`
- Fetches relevant user data from the database for context
- Calls Lovable AI gateway (`google/gemini-3-flash-preview`)
- Returns structured JSON responses
- Handles rate limits (429) and payment errors (402)

### New React Hook: `useUniversalAI`

A shared hook that any component can use:

```text
const { ask, loading, error } = useUniversalAI();
const result = await ask("knowledge", "analyze-gaps", { skills, targetRole });
```

### Global Chat Component: `GlobalAIChatButton`

- Floating button in bottom-right corner
- Opens a slide-up chat panel with streaming responses  
- Uses the existing Lovable AI streaming pattern
- Page-context-aware (knows which page the user is on)

### Updated Hooks (Phase 2)

Each hook gets a new `aiEnabled` flag. When true, it calls `ai-universal` instead of local logic. This is backward-compatible -- existing local logic remains as a fallback.

### Database

One new table `ai_chat_history` to persist global chat conversations per user.

### Config Updates

Add `ai-universal` to `supabase/config.toml` with `verify_jwt = false`.

---

## Build Order

1. Create `ai-universal` edge function (the brain)
2. Create `useUniversalAI` hook (the bridge)
3. Update 6 priority hooks to use real AI
4. Build global floating AI chat with streaming
5. Add embedded AI widgets to 5 key pages

This approach gives you real AI across the platform in a manageable, incremental way -- each phase delivers visible value immediately.

