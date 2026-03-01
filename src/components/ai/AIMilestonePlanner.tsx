/**
 * AIMilestonePlanner — AI-powered milestone plan generator.
 * Advisory only. User must manually confirm and apply.
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
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, AlertTriangle, Clock, Flag, CheckCircle } from "lucide-react";
import { useAIWorkflow } from "@/hooks/useAIWorkflow";

interface MilestonePlan {
  task_breakdown: Array<{ task: string; estimated_hours: number; priority: string }>;
  estimated_timeline: string;
  risk_factors: string[];
  review_points: string[];
  summary: string;
}

interface AIMilestonePlannerProps {
  onApply?: (plan: MilestonePlan) => void;
}

export function AIMilestonePlanner({ onApply }: AIMilestonePlannerProps) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const { generate, isLoading, result, reset } = useAIWorkflow<MilestonePlan>();

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    await generate("milestone-plan", goal);
  };

  const handleApply = () => {
    if (result?.result && onApply) {
      onApply(result.result);
      setOpen(false);
      setGoal("");
      reset();
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const plan = result?.result;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Brain className="h-3.5 w-3.5" />
        AI Milestone Plan
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Milestone Planning Assistant
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="h-3 w-3" />
              AI-generated — verify before applying.
            </DialogDescription>
          </DialogHeader>

          {!plan ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Describe your milestone goal
                </label>
                <Textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="E.g., Build and deploy a user authentication system with email verification, password reset, and role-based access control..."
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {goal.length}/2000 characters
                </p>
              </div>
              <Button onClick={handleGenerate} disabled={!goal.trim() || isLoading} className="w-full gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Generate Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm">{plan.summary}</p>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Estimated Timeline:</span>
                <span className="text-muted-foreground">{plan.estimated_timeline}</span>
              </div>

              {/* Tasks */}
              {plan.task_breakdown?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Task Breakdown</p>
                  <div className="space-y-1.5">
                    {plan.task_breakdown.map((task, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 p-2 rounded border text-xs">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CheckCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{task.task}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground">{task.estimated_hours}h</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            task.priority === "high" ? "bg-destructive/10 text-destructive" :
                            task.priority === "medium" ? "bg-warning/10 text-warning" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {plan.risk_factors?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-warning" />
                    Risk Factors
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {plan.risk_factors.map((risk, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-warning">•</span> {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Points */}
              {plan.review_points?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Review Checkpoints</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {plan.review_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="h-3 w-3 text-success mt-0.5 shrink-0" /> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} size="sm">
              {plan ? "Discard" : "Cancel"}
            </Button>
            {plan && onApply && (
              <Button onClick={handleApply} size="sm">
                Apply Plan
              </Button>
            )}
            {plan && !onApply && (
              <Button onClick={handleClose} size="sm">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
