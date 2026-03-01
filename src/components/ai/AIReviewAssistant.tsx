/**
 * AIReviewAssistant — Helps reviewers analyze submissions.
 * Advisory only. Reviewer must manually decide.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Loader2, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { useAIWorkflow } from "@/hooks/useAIWorkflow";

interface ReviewAnalysis {
  completeness_score: number;
  missing_components: string[];
  clarity_issues: string[];
  suggested_questions: string[];
  overall_assessment: string;
}

interface AIReviewAssistantProps {
  submissionContent: string;
  milestoneTitle?: string;
}

export function AIReviewAssistant({ submissionContent, milestoneTitle }: AIReviewAssistantProps) {
  const [open, setOpen] = useState(false);
  const { generate, isLoading, result, reset } = useAIWorkflow<ReviewAnalysis>();

  const handleAnalyze = async () => {
    setOpen(true);
    await generate("review-analysis", submissionContent, {
      milestone_title: milestoneTitle,
    });
  };

  const analysis = result?.result;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAnalyze}
        disabled={!submissionContent?.trim() || isLoading}
        className="gap-1.5 text-xs"
      >
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
        AI Analysis
      </Button>

      <Dialog open={open} onOpenChange={() => { setOpen(false); reset(); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Submission Analysis
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="h-3 w-3" />
              AI-generated — reviewer must decide independently.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Completeness Score */}
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`text-2xl font-bold ${
                  analysis.completeness_score >= 80 ? "text-success" :
                  analysis.completeness_score >= 50 ? "text-warning" : "text-destructive"
                }`}>
                  {analysis.completeness_score}%
                </div>
                <div>
                  <p className="text-sm font-medium">Completeness</p>
                  <p className="text-xs text-muted-foreground">{analysis.overall_assessment}</p>
                </div>
              </div>

              {/* Missing Components */}
              {analysis.missing_components?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Missing Components</p>
                  <ul className="text-xs space-y-1">
                    {analysis.missing_components.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-destructive">
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clarity Issues */}
              {analysis.clarity_issues?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Clarity Issues</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {analysis.clarity_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" /> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Questions */}
              {analysis.suggested_questions?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Suggested Questions</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {analysis.suggested_questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <HelpCircle className="h-3 w-3 mt-0.5 shrink-0" /> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }} size="sm">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
