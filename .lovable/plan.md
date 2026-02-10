

# Enhance Research Papers Hub -- New Features

## Current State
The Research Papers page has paper browsing with search/filters, AI summarization, bookmarking, and a research level tracker. Here are 6 high-impact features to add.

## Features to Build

### 1. Bookmarked Papers Tab / Filter
Currently bookmarking works but there's no way to view only bookmarked papers. Add a tab bar ("All Papers" / "Bookmarked") or a toggle filter so researchers can quickly access their saved library.

### 2. Sort Options
Papers currently have no sorting. Add a sort dropdown with options: Most Cited, Newest First, Oldest First, Recently Analyzed, Alphabetical. This is essential for navigating a growing paper collection.

### 3. AI Compare Papers
Add a "Compare" mode where researchers select 2-3 papers and get an AI-generated comparison: how methodologies differ, which has stronger findings, complementary insights, and citation impact analysis. A floating action bar appears when papers are selected.

### 4. AI Reading Streak and Stats Panel
Add a reading activity section to the sidebar showing:
- Reading streak (days with at least one paper analyzed)
- Papers analyzed by field (mini bar chart via Recharts)
- Most-read field badge
- "Analyze one paper to keep your streak" nudge

### 5. Related Papers Suggestions
After summarizing a paper, show an "AI Suggested Related Papers" section inside the summary dialog. The AI recommends 2-3 papers from the existing collection that are thematically connected, helping researchers discover relevant work.

### 6. Export Reading List
A button to export the user's bookmarked/analyzed papers as a formatted citation list (copy to clipboard) in a common academic format, useful for literature reviews.

---

## Technical Details

### Modified Files

**`src/hooks/useResearchPapers.ts`**
- Add `sortBy` state (enum: `citations-desc`, `year-desc`, `year-asc`, `title-asc`, `analyzed`)
- Add `showBookmarked` boolean toggle
- Add `comparePapers` function calling `ask("research", "compare-papers", { papers })`
- Add `getRelatedPapers` function calling `ask("research", "related-papers", { paper, availablePapers })`
- Add `exportCitations` function that formats bookmarked/analyzed papers as APA citations
- Add `readingStats` computed value (papers by field, streak info)
- Update `filtered` memo to respect `showBookmarked` and `sortBy`

**`src/pages/ResearchPapersPage.tsx`**
- Add tab bar for All / Bookmarked view
- Add sort dropdown next to existing filters
- Add compare mode: checkbox on each card, floating compare bar at bottom
- Wire new dialog for comparison results

**`src/components/research/PaperCard.tsx`**
- Add optional `selectable` prop with checkbox for compare mode
- Add `selected` and `onSelect` props

**`src/components/research/ResearchLevelCard.tsx`**
- Add reading stats section below metrics (field distribution, streak)

**`src/components/research/PaperSummaryDialog.tsx`**
- Add "Related Papers" section at bottom of dialog after AI summary loads

### New Files

**`src/components/research/CompareDialog.tsx`**
- Dialog showing AI-generated side-by-side comparison of selected papers
- Sections: Methodology comparison, Findings contrast, Citation impact, Complementary insights

**`src/components/research/ReadingStatsCard.tsx`**
- Small card with reading streak counter, field distribution mini-chart (Recharts BarChart), and export button

### AI Integration
Uses existing `useUniversalAI` with domain `"research"`:
- `compare-papers` -- new action for paper comparison
- `related-papers` -- new action for recommendations

### No Database Changes
All state remains client-side. The AI calls go through the existing `ai-universal` edge function.

### Build Order
1. Update hook with sort, bookmark filter, compare, related, export, and stats logic
2. Update PaperCard with selectable mode
3. Create ReadingStatsCard component
4. Create CompareDialog component
5. Update PaperSummaryDialog with related papers section
6. Update ResearchPapersPage with tabs, sort, compare mode, and new sidebar cards
