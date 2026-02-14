
# Add Paper Study, Download & AI Summarizer Feature

## What You'll Get

A dedicated **Paper Reader Page** for the uploaded research paper ("A look at advanced learners' use of mobile devices for English language study") with:

1. **Full Paper Reader** -- A clean reading view showing the paper's full content (extracted from the PDF), with proper sections, headings, and formatting
2. **AI Summarizer** -- A one-click AI summary button that generates key findings, methodology, and a plain-English breakdown using the existing AI system
3. **Download Button** -- Download the original PDF file directly
4. **DOI Link** -- Clickable DOI badge linking to the official publication (10.14746/ssllt.2017.7.2.3)
5. **Paper Metadata Header** -- Author, year, journal, field, citation count displayed prominently

## How It Works

- The landing page paper cards in `ResearchDiscoverySection` will link to the new reader page `/research-papers/:slug`
- The reader page shows the full extracted paper content in a readable layout
- Users can click "AI Summarize" to get an AI-generated summary (uses existing `useUniversalAI` hook)
- A download button serves the PDF from the project's public folder
- DOI links out to the official publication

## Technical Details

### New files:
- `src/pages/PaperReaderPage.tsx` -- Full paper study page with reader, AI summarizer, download, and DOI
- `src/data/papers/mobile-devices-english-study.ts` -- Extracted paper content data (title, abstract, sections, metadata, DOI)
- `public/papers/EJ1172284.pdf` -- The uploaded PDF file copied to public folder for download

### Files to modify:
- `src/App.tsx` -- Add route `/research-papers/:slug` pointing to PaperReaderPage
- `src/components/home/ResearchDiscoverySection.tsx` -- Make the Kruk paper card clickable, linking to the reader page; add DOI to paper data
- `src/hooks/useResearchPapers.ts` -- Add the Kruk paper to `SAMPLE_PAPERS` with its real DOI so it also appears in the Research Hub

### Page layout:
- Top: Paper metadata bar (title, authors, year, journal, DOI badge, download button)
- Left/Main: Scrollable paper content with section headings
- Right sidebar: AI Summarizer panel with "Summarize" button, key findings, and "Ask AI" chat
- Sticky bottom bar on mobile with Download and Summarize buttons

### AI Summarizer uses:
- Existing `useUniversalAI` hook with domain "research" and action "summarize-paper"
- No new edge functions needed -- reuses existing `ai-universal` function
- Shows key findings, methodology, limitations, and relevance score
- Includes "Plain English" toggle for simplified summary

### DOI:
- The paper's DOI is `10.14746/ssllt.2017.7.2.3`
- Rendered as a clickable badge linking to `https://doi.org/10.14746/ssllt.2017.7.2.3`
