import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Target, FlaskConical, AlertTriangle, CheckCircle } from "lucide-react";
import type { ResearchPaper, PaperSummary } from "@/hooks/useResearchPapers";
import ReactMarkdown from "react-markdown";

interface PaperSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: ResearchPaper | null;
  summary: PaperSummary | null;
  loading: boolean;
}

export function PaperSummaryDialog({ open, onOpenChange, paper, summary, loading }: PaperSummaryDialogProps) {
  if (!paper) return null;

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
            {/* Relevance Score */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Relevance Score:</span>
              <Badge variant={summary.relevanceScore >= 8 ? "success" : summary.relevanceScore >= 5 ? "warning" : "secondary"}>
                {summary.relevanceScore}/10
              </Badge>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                Summary
              </h4>
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{summary.summary}</ReactMarkdown>
              </div>
            </div>

            {/* Key Findings */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                Key Findings
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4 list-disc">
                {summary.keyFindings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Methodology */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5 text-primary" />
                Methodology
              </h4>
              <p className="text-sm text-muted-foreground">{summary.methodology}</p>
            </div>

            {/* Limitations */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Limitations
              </h4>
              <p className="text-sm text-muted-foreground">{summary.limitations}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
