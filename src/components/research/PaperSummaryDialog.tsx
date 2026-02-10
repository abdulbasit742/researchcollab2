import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Target, FlaskConical, AlertTriangle, CheckCircle, Link2, Languages, Loader2 } from "lucide-react";
import type { ResearchPaper, PaperSummary } from "@/hooks/useResearchPapers";
import { PaperChatSection } from "./PaperChatSection";
import ReactMarkdown from "react-markdown";

interface PaperSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: ResearchPaper | null;
  summary: PaperSummary | null;
  loading: boolean;
  onGetRelated?: (paper: ResearchPaper) => Promise<string[] | null>;
  allPapers?: ResearchPaper[];
  onSummarize?: (paper: ResearchPaper) => void;
  onChatWithPaper?: (paper: ResearchPaper, question: string) => Promise<string | null>;
  onSimplify?: (paper: ResearchPaper) => Promise<string | null>;
  chatLoading?: boolean;
}

export function PaperSummaryDialog({ open, onOpenChange, paper, summary, loading, onGetRelated, allPapers, onSummarize, onChatWithPaper, onSimplify, chatLoading }: PaperSummaryDialogProps) {
  const [relatedIds, setRelatedIds] = useState<string[] | null>(null);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [simplified, setSimplified] = useState<string | null>(null);
  const [simplifying, setSimplifying] = useState(false);
  const [showSimplified, setShowSimplified] = useState(false);

  useEffect(() => {
    if (open && summary && paper && onGetRelated && !relatedIds) {
      setLoadingRelated(true);
      onGetRelated(paper).then((ids) => { setRelatedIds(ids); setLoadingRelated(false); });
    }
    if (!open) { setRelatedIds(null); setSimplified(null); setShowSimplified(false); }
  }, [open, summary, paper, onGetRelated, relatedIds]);

  if (!paper) return null;

  const handleSimplify = async () => {
    if (simplified) { setShowSimplified(!showSimplified); return; }
    if (!onSimplify) return;
    setSimplifying(true);
    const result = await onSimplify(paper);
    if (result) { setSimplified(result); setShowSimplified(true); }
    setSimplifying(false);
  };

  const relatedPapers = relatedIds && allPapers ? allPapers.filter((p) => relatedIds.includes(p.id)) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Paper Analysis
          </DialogTitle>
          <DialogDescription className="text-left font-medium">{paper.title}</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Relevance Score:</span>
                <Badge variant={summary.relevanceScore >= 8 ? "success" : summary.relevanceScore >= 5 ? "warning" : "secondary"}>
                  {summary.relevanceScore}/10
                </Badge>
              </div>
              {onSimplify && (
                <Button
                  variant={showSimplified ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleSimplify}
                  disabled={simplifying}
                >
                  {simplifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                  {showSimplified ? "Show Original" : "Plain English"}
                </Button>
              )}
            </div>

            {/* Simplified summary */}
            {showSimplified && simplified && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-1.5">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-primary" /> Plain English Summary
                </h4>
                <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{simplified}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Original summary */}
            {!showSimplified && (
              <>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" /> Summary
                  </h4>
                  <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{summary.summary}</ReactMarkdown>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-primary" /> Key Findings
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4 list-disc">
                    {summary.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-primary" /> Methodology
                  </h4>
                  <p className="text-sm text-muted-foreground">{summary.methodology}</p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Limitations
                  </h4>
                  <p className="text-sm text-muted-foreground">{summary.limitations}</p>
                </div>
              </>
            )}

            {/* Related Papers */}
            {(loadingRelated || relatedPapers.length > 0) && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-primary" /> Related Papers
                </h4>
                {loadingRelated && <Skeleton className="h-12 w-full" />}
                {relatedPapers.map((rp) => (
                  <button
                    key={rp.id}
                    className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    onClick={() => { onSummarize?.(rp); }}
                  >
                    <p className="text-sm font-medium">{rp.title}</p>
                    <p className="text-xs text-muted-foreground">{rp.authors[0]} · {rp.year} · {rp.field}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Chat with Paper */}
            {onChatWithPaper && (
              <PaperChatSection
                paper={paper}
                onAsk={onChatWithPaper}
                loading={chatLoading || false}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
