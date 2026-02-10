
# Phase 4: Embedded AI Widgets on Key Pages

Now that the Universal AI backend, hook, and global chat are in place, the next best step is Phase 4 -- adding embedded AI widgets to the 5 most impactful pages. These are small, context-aware AI-powered cards that provide proactive intelligence without requiring the user to open the chat.

## What Gets Built

### 1. AI Insight Card Component (Reusable)
A shared `AISuggestionCard` component that any page can drop in. It takes a domain, action, and context, calls the Universal AI, and renders the response as a compact card with a sparkle icon.

### 2. Home Dashboard -- "AI Daily Brief"
- Add a card in the sidebar that generates a short AI summary of the user's day: trust changes, pending actions, top opportunity.
- Uses domain `"general"`, action `"daily-brief"` with trust score, active deals, and pending actions as context.

### 3. Deals Page -- "AI Deal Advisor"  
- Add a collapsible card above the deal list with AI-generated advice: negotiation tips, pricing suggestions, risk flags for active deals.
- Uses domain `"deals"`, action `"advisor"`.

### 4. Profile Page -- "AI Profile Score"
- Add a card in the sidebar that analyzes the user's profile completeness, suggests improvements, and estimates visibility impact.
- Uses domain `"profile"`, action `"optimize"`.

### 5. Messages Page -- "AI Conversation Summary"
- Add a small banner above the thread list summarizing unread conversations and suggesting priority responses.
- Uses domain `"messages"`, action `"summary"`.

### 6. Progress Page -- "AI Career Forecast"
- Enhance the existing NextBestActionPanel by adding an AI-powered insight at the top that provides a narrative career forecast.
- Uses domain `"career"`, action `"forecast"`.

## Technical Details

### New Files
- `src/components/ai/AISuggestionCard.tsx` -- Reusable widget that calls `useUniversalAI().ask()` on mount with provided domain/action/context, shows loading skeleton, then renders the AI response with markdown.

### Modified Files
- `src/pages/HomeDashboard.tsx` -- Import and add `AISuggestionCard` to the sidebar with daily-brief config.
- `src/pages/DealsPage.tsx` -- Add AI Deal Advisor card above `DealRoomList`.
- `src/pages/ProfilePage.tsx` -- Add AI Profile Score card in the sidebar.
- `src/pages/MessagesPage.tsx` -- Add AI summary banner above the thread list.
- `src/pages/ProgressPage.tsx` -- Add AI Career Forecast card in the overview tab.

### How AISuggestionCard Works

```text
<AISuggestionCard
  title="AI Daily Brief"
  domain="general"
  action="daily-brief"
  context={{ trustScore: 45, activeDeals: 2, pendingActions: 3 }}
/>
```

- On mount, calls `ask(domain, action, context)` via `useUniversalAI`
- Shows a skeleton while loading
- Renders the AI response text with markdown support
- Has a refresh button to re-generate
- Compact card design with a sparkle/bot icon
- Gracefully handles errors with a retry option

### No Database Changes
All widgets use the existing `ai-universal` edge function. No new tables or migrations needed.

### Build Order
1. Create `AISuggestionCard` reusable component
2. Add to Home Dashboard sidebar
3. Add to Deals Page
4. Add to Profile Page sidebar
5. Add to Messages Page
6. Add to Progress Page
