import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PaperCard } from "@/components/research/PaperCard";
import { ResearchLevelCard } from "@/components/research/ResearchLevelCard";
import { PaperSummaryDialog } from "@/components/research/PaperSummaryDialog";
import { useResearchPapers, type ResearchPaper } from "@/hooks/useResearchPapers";
import { Search, BookOpen, FileText } from "lucide-react";

export default function ResearchPapersPage() {
  const {
    papers, search, setSearch, typeFilter, setTypeFilter, fieldFilter, setFieldFilter,
    fields, paperTypes, toggleBookmark, summarizePaper, summaries, aiLoading,
    metrics, score, level, nextLevel, progress, readingHistory, getImprovementPlan,
  } = useResearchPapers();

  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Research Papers Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse, analyze, and track research papers with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
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
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Paper Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {paperTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Fields</SelectItem>
                  {fields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
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
                />
              ))}
            </div>

            {papers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No papers match your filters.</p>
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
          </div>
        </div>
      </main>

      {/* Summary Dialog */}
      <PaperSummaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paper={selectedPaper}
        summary={selectedPaper ? summaries[selectedPaper.id] || null : null}
        loading={summarizing}
      />
    </div>
  );
}
