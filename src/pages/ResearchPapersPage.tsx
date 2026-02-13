import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaperCard } from "@/components/research/PaperCard";
import { ResearchLevelCard } from "@/components/research/ResearchLevelCard";
import { PaperSummaryDialog } from "@/components/research/PaperSummaryDialog";
import { CompareDialog } from "@/components/research/CompareDialog";
import { ReadingStatsCard } from "@/components/research/ReadingStatsCard";
import { ResearchGapCard } from "@/components/research/ResearchGapCard";
import { LitReviewDialog } from "@/components/research/LitReviewDialog";
import { AnnotatedBibDialog } from "@/components/research/AnnotatedBibDialog";
import { useResearchPapers, type ResearchPaper, type PaperComparison } from "@/hooks/useResearchPapers";
import { Search, BookOpen, FileText, GitCompareArrows, X, FileEdit, BookMarked } from "lucide-react";

export default function ResearchPapersPage() {
  const {
    papers, allPapers, search, setSearch, typeFilter, setTypeFilter, fieldFilter, setFieldFilter,
    sortBy, setSortBy, showBookmarked, setShowBookmarked,
    fields, paperTypes, toggleBookmark, summarizePaper, summaries, aiLoading,
    metrics, score, level, nextLevel, progress, readingHistory, readingStats,
    getImprovementPlan, comparePapers, getRelatedPapers, exportCitations,
    selectedForCompare, toggleCompareSelect, clearCompareSelection,
    chatWithPaper, simplifySummary, findResearchGaps, generateLitReview, generateAnnotatedBib,
    userTier, canAccessPaper,
  } = useResearchPapers();

  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [comparing, setComparing] = useState(false);
  const [litReviewOpen, setLitReviewOpen] = useState(false);
  const [annotatedBibOpen, setAnnotatedBibOpen] = useState(false);

  const handleSummarize = async (paper: ResearchPaper) => {
    if (summaries[paper.id]) {
      setSelectedPaper(paper);
      setDialogOpen(true);
      return;
    }
    setSelectedPaper(paper);
    setDialogOpen(true);
    setSummarizing(true);
    await summarizePaper(paper);
    setSummarizing(false);
  };

  const handleCompare = async () => {
    if (selectedForCompare.length < 2) return;
    setCompareDialogOpen(true);
    setComparing(true);
    const result = await comparePapers(selectedForCompare);
    setComparison(result);
    setComparing(false);
  };

  const comparePaperObjects = allPapers.filter((p) => selectedForCompare.includes(p.id));
  const bookmarkedOrAnalyzedCount = allPapers.filter((p) => p.bookmarked || p.summarized).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6 px-4 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Research Papers Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse, analyze, and track research papers with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setLitReviewOpen(true)}>
              <FileEdit className="h-4 w-4" />
              Lit Review Outline
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setAnnotatedBibOpen(true)}>
              <BookMarked className="h-4 w-4" />
              Annotated Bibliography
            </Button>
            <Button
              variant={compareMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => { setCompareMode(!compareMode); if (compareMode) clearCompareSelection(); }}
            >
              <GitCompareArrows className="h-4 w-4" />
              {compareMode ? "Exit Compare" : "Compare Papers"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Tabs */}
            <Tabs value={showBookmarked ? "bookmarked" : "all"} onValueChange={(v) => setShowBookmarked(v === "bookmarked")}>
              <TabsList>
                <TabsTrigger value="all">All Papers</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search papers by title or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Paper Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {paperTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Fields</SelectItem>
                  {fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citations-desc">Most Cited</SelectItem>
                  <SelectItem value="year-desc">Newest First</SelectItem>
                  <SelectItem value="year-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Alphabetical</SelectItem>
                  <SelectItem value="analyzed">Recently Analyzed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {papers.length} papers
              </span>
              <span>•</span>
              <span>{readingHistory.length} analyzed this session</span>
            </div>

            {/* Papers grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onSummarize={handleSummarize}
                  onToggleBookmark={toggleBookmark}
                  isLoading={aiLoading && selectedPaper?.id === paper.id}
                  selectable={compareMode}
                  selected={selectedForCompare.includes(paper.id)}
                  onSelect={toggleCompareSelect}
                  userTier={userTier}
                  isLocked={!canAccessPaper(paper)}
                />
              ))}
            </div>

            {papers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>{showBookmarked ? "No bookmarked papers yet." : "No papers match your filters."}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <ResearchLevelCard
              level={level}
              nextLevel={nextLevel}
              progress={progress}
              score={score}
              metrics={metrics}
              onGetImprovementPlan={getImprovementPlan}
              aiLoading={aiLoading}
            />
            <ReadingStatsCard stats={readingStats} onExport={exportCitations} />
            <ResearchGapCard
              onAnalyze={findResearchGaps}
              totalPapers={allPapers.length}
              analyzedCount={readingHistory.length}
            />
          </div>
        </div>
      </main>

      {/* Compare floating bar */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-lg rounded-full px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedForCompare.length} paper(s) selected</span>
          <Button size="sm" onClick={handleCompare} disabled={selectedForCompare.length < 2 || aiLoading} className="gap-2">
            <GitCompareArrows className="h-3.5 w-3.5" />
            Compare
          </Button>
          <Button size="sm" variant="ghost" onClick={clearCompareSelection}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Summary Dialog */}
      <PaperSummaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paper={selectedPaper}
        summary={selectedPaper ? summaries[selectedPaper.id] || null : null}
        loading={summarizing}
        onGetRelated={getRelatedPapers}
        allPapers={allPapers}
        onSummarize={handleSummarize}
        onChatWithPaper={chatWithPaper}
        onSimplify={simplifySummary}
        chatLoading={aiLoading}
      />

      {/* Compare Dialog */}
      <CompareDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        papers={comparePaperObjects}
        comparison={comparison}
        loading={comparing}
      />

      {/* Lit Review Dialog */}
      <LitReviewDialog
        open={litReviewOpen}
        onOpenChange={setLitReviewOpen}
        onGenerate={generateLitReview}
        loading={aiLoading}
        analyzedCount={readingHistory.length}
      />

      {/* Annotated Bibliography Dialog */}
      <AnnotatedBibDialog
        open={annotatedBibOpen}
        onOpenChange={setAnnotatedBibOpen}
        onGenerate={generateAnnotatedBib}
        loading={aiLoading}
        paperCount={bookmarkedOrAnalyzedCount}
      />
    </div>
  );
}
