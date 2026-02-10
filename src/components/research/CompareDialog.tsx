import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCompareArrows, FlaskConical, Target, BarChart3, Lightbulb, ThumbsUp } from "lucide-react";
import type { PaperComparison, ResearchPaper } from "@/hooks/useResearchPapers";
import ReactMarkdown from "react-markdown";

interface CompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  papers: ResearchPaper[];
  comparison: PaperComparison | null;
  loading: boolean;
}

export function CompareDialog({ open, onOpenChange, papers, comparison, loading }: CompareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="h-4 w-4 text-primary" />
            AI Paper Comparison
          </DialogTitle>
          <DialogDescription className="text-left">
            Comparing {papers.map((p) => `"${p.title}"`).join(" vs ")}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {comparison && !loading && (
          <div className="space-y-4">
            {[
              { icon: FlaskConical, label: "Methodology Comparison", content: comparison.methodology },
              { icon: Target, label: "Findings Contrast", content: comparison.findings },
              { icon: BarChart3, label: "Citation Impact", content: comparison.citationImpact },
              { icon: Lightbulb, label: "Complementary Insights", content: comparison.complementary },
              { icon: ThumbsUp, label: "Recommendation", content: comparison.recommendation },
            ].map((section) => (
              <div key={section.label} className="space-y-1.5">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <section.icon className="h-3.5 w-3.5 text-primary" />
                  {section.label}
                </h4>
                <div className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
