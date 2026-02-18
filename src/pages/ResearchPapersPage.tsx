import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
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
import {
  Search, BookOpen, FileText, GitCompareArrows, X, FileEdit, BookMarked,
  Sparkles, Lightbulb, MessageSquare, Microscope, Brain, TrendingUp,
} from "lucide-react";

const AI_QUICK_TOOLS = [
  { icon: Sparkles, label: "AI Summarize", description: "Analyze any paper instantly" },
  { icon: MessageSquare, label: "Chat with Papers", description: "Ask questions in natural language" },
  { icon: Lightbulb, label: "Gap Finder", description: "Discover research whitespace" },
  { icon: GitCompareArrows, label: "Compare Papers", description: "Side-by-side analysis" },
  { icon: FileEdit, label: "Lit Review", description: "Auto-generate reviews" },
  { icon: BookMarked, label: "Bibliography", description: "Export-ready citations" },
];

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
    <MainLayout>
      {/* Research Hub Hero Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />

        <div className="container relative py-8 md:py-12 px-4">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary mb-4">
                <Microscope className="h-3.5 w-3.5" />
                Research Intelligence Hub
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Research Papers{" "}
                <span className="text-primary">+ AI Analysis</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl">
                Discover, summarize, compare, and execute on research — powered by AI tools
                that Google Scholar doesn't have.
              </p>
            </motion.div>

            {/* AI Tool Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-5 flex flex-wrap gap-2"
            >
              {AI_QUICK_TOOLS.map((tool) => (
                <div
                  key={tool.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-default"
                >
                  <tool.icon className="h-3 w-3" />
                  {tool.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container py-6 px-4">
        {/* Action bar */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <Tabs value={showBookmarked ? "bookmarked" : "all"} onValueChange={(v) => setShowBookmarked(v === "bookmarked")}>
            <TabsList>
              <TabsTrigger value="all">All Papers</TabsTrigger>
              <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap" onClick={() => setLitReviewOpen(true)}>
                <FileEdit className="h-3.5 w-3.5" />
                Lit Review
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap" onClick={() => setAnnotatedBibOpen(true)}>
                <BookMarked className="h-3.5 w-3.5" />
                Bibliography
              </Button>
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                className="gap-1.5 whitespace-nowrap"
                onClick={() => { setCompareMode(!compareMode); if (compareMode) clearCompareSelection(); }}
              >
                <GitCompareArrows className="h-3.5 w-3.5" />
                {compareMode ? "Exit Compare" : "Compare"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search papers by title, author, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
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
                  <SelectTrigger className="w-full sm:w-44 col-span-2 sm:col-span-1">
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
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {papers.length} papers
              </span>
              <span>•</span>
              <span>{readingHistory.length} analyzed this session</span>
              {compareMode && (
                <>
                  <span>•</span>
                  <span className="text-primary font-medium">{selectedForCompare.length} selected for compare</span>
                </>
              )}
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
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">{showBookmarked ? "No bookmarked papers yet." : "No papers match your filters."}</p>
                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
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
      </div>

      {/* Compare floating bar */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border shadow-2xl rounded-full px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
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

      {/* Dialogs */}
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
      <CompareDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        papers={comparePaperObjects}
        comparison={comparison}
        loading={comparing}
      />
      <LitReviewDialog
        open={litReviewOpen}
        onOpenChange={setLitReviewOpen}
        onGenerate={generateLitReview}
        loading={aiLoading}
        analyzedCount={readingHistory.length}
      />
      <AnnotatedBibDialog
        open={annotatedBibOpen}
        onOpenChange={setAnnotatedBibOpen}
        onGenerate={generateAnnotatedBib}
        loading={aiLoading}
        paperCount={bookmarkedOrAnalyzedCount}
      />
    </MainLayout>
  );
}
