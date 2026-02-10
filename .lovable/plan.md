
# Research Papers Hub with AI Analysis and Research Level Tracker

## Overview

Create a dedicated **Research Papers** page (`/research-papers`) where researchers can browse, search, and discover all types of research papers. The page integrates AI-powered summarization and analysis that automatically feeds into the researcher's profile and research impact. A **Research Level** section shows the user's current research standing and provides AI-driven improvement recommendations.

## What Gets Built

### 1. Research Papers Page (`/research-papers`)

A full-featured page with:

- **Paper Discovery**: Browse papers by type -- Journal Articles, Conference Papers, Preprints, Theses, Technical Reports, Reviews, Case Studies, Working Papers, Book Chapters
- **Search and Filters**: Search by title/keyword, filter by type, field, year, access level (open/restricted)
- **Paper Cards**: Each paper shows title, authors, abstract preview, journal/venue, year, citation count, DOI link, type badge
- **AI Summarize Button**: One-click AI summarization of any paper -- generates a concise summary, key findings, methodology notes, and relevance score
- **Auto-Add to Research**: When a paper is summarized/analyzed, it gets logged to the user's reading history and contributes to their research metrics
- **Save/Bookmark**: Save papers to personal library for later reading

### 2. AI Paper Analysis (via existing `ai-universal` edge function)

Uses the existing Universal AI infrastructure with a new `research` domain action:

- `summarize-paper`: AI generates structured summary (abstract, key findings, methodology, limitations, relevance)
- `analyze-reading`: AI analyzes the user's reading patterns and suggests gaps
- `improve-level`: AI provides personalized recommendations to improve research level

### 3. Research Level Section

A prominent section on the page (and optionally on the profile) showing:

- **Current Research Level**: Beginner, Emerging, Intermediate, Advanced, Expert, Distinguished (based on publications, citations, h-index, reading activity)
- **Level Progress Bar**: Visual progress toward next level
- **Breakdown**: What contributes to the level (publications, citations, peer reviews, datasets, reading breadth)
- **AI Improvement Plan**: Personalized AI recommendations to level up (e.g., "Publish 2 more papers in Q1", "Expand reading into adjacent fields", "Increase citation impact by collaborating with high-impact authors")

### 4. Reading History and Analytics

- Papers the user has read/summarized are tracked
- Reading stats: papers read this month, fields covered, AI summaries generated
- This data feeds into the Research Level calculation

## Technical Details

### New Files

- **`src/pages/ResearchPapersPage.tsx`** -- Main page with paper browser, search/filters, AI actions, and research level section
- **`src/components/research/PaperCard.tsx`** -- Reusable paper card with AI summarize action
- **`src/components/research/ResearchLevelCard.tsx`** -- Research level display with progress and AI improvement tips
- **`src/components/research/PaperSummaryDialog.tsx`** -- Dialog showing AI-generated paper summary
- **`src/hooks/useResearchPapers.ts`** -- Hook managing paper data, reading history, and research level state

### Modified Files

- **`src/App.tsx`** -- Add route `/research-papers` pointing to `ResearchPapersPage`
- **`src/components/layout/Navbar.tsx`** -- Optionally add a link in the "More" menu or leave discoverable via search
- **`src/components/research/index.ts`** -- Export new components

### AI Integration

Uses the existing `useUniversalAI` hook with domain `"research"`:

```text
// Summarize a paper
const summary = await ask("research", "summarize-paper", { 
  title, abstract, authors, journal 
});

// Get improvement recommendations
const plan = await ask("research", "improve-level", { 
  currentLevel, publications, citations, hIndex, readingHistory 
});

// Analyze reading patterns
const analysis = await ask("research", "analyze-reading", { 
  papersRead, fieldsExplored, recentTopics 
});
```

### Paper Types Supported

Journal Article, Conference Paper, Preprint, Thesis/Dissertation, Technical Report, Systematic Review, Meta-Analysis, Case Study, Working Paper, Book Chapter, White Paper, Patent

### Research Level Calculation

Levels are computed client-side based on weighted metrics:
- Publications count (30%)
- Total citations (25%)
- h-index (20%)
- Reading activity / papers analyzed (15%)
- Peer review contributions (10%)

### Sample Data

The page ships with sample papers across multiple types so it's immediately useful. Real paper data can be persisted to the database in a future iteration.

### No Database Changes

Phase 1 uses local state with sample data. The AI calls go through the existing `ai-universal` edge function. A future iteration can add a `research_papers` and `reading_history` table for persistence.

### Build Order

1. Create `useResearchPapers` hook with paper types, sample data, and level calculation
2. Create `PaperCard` component with AI summarize button
3. Create `ResearchLevelCard` component with progress and AI tips
4. Create `PaperSummaryDialog` for AI summary display
5. Create `ResearchPapersPage` assembling everything
6. Add route in `App.tsx`
7. Export from `research/index.ts`
