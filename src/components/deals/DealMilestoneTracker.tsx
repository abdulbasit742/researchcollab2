import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DealMilestone } from "@/hooks/useDealRoom";
import { useSubmitMilestone, useApproveMilestone, useRejectMilestone } from "@/hooks/useMilestoneActions";
import { formatPKR } from "@/lib/currency";
import {
  Target,
  CheckCircle,
  Clock,
  Upload,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DealMilestoneTrackerProps {
  dealId: string;
  milestones: DealMilestone[];
  isInProgress: boolean;
  userRole: "initiator" | "executor";
}

const statusConfig = {
  pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-500/10" },
  submitted: { label: "Submitted", color: "text-amber-600", bg: "bg-amber-500/10" },
  approved: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  rejected: { label: "Rejected", color: "text-destructive", bg: "bg-destructive/10" },
};

export function DealMilestoneTracker({
  dealId,
  milestones,
  isInProgress,
  userRole,
}: DealMilestoneTrackerProps) {
  const [submitMilestoneId, setSubmitMilestoneId] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [rejectMilestoneId, setRejectMilestoneId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const submitMilestone = useSubmitMilestone();
  const approveMilestone = useApproveMilestone();
  const rejectMilestone = useRejectMilestone();

  const completedMilestones = milestones.filter(m => m.status === "approved").length;
  const progressPercent = milestones.length > 0 
    ? (completedMilestones / milestones.length) * 100 
    : 0;
  const totalValue = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedValue = milestones
    .filter(m => m.status === "approved")
    .reduce((sum, m) => sum + m.amount, 0);

  const handleSubmitMilestone = async () => {
    if (!submitMilestoneId) return;
    await submitMilestone.mutateAsync({
      dealId,
      milestoneId: submitMilestoneId,
      notes: submissionNotes || undefined,
    });
    setSubmitMilestoneId(null);
    setSubmissionNotes("");
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    await approveMilestone.mutateAsync({ dealId, milestoneId });
  };

  const handleRejectMilestone = async () => {
    if (!rejectMilestoneId) return;
    await rejectMilestone.mutateAsync({
      dealId,
      milestoneId: rejectMilestoneId,
      reason: rejectionReason || undefined,
    });
    setRejectMilestoneId(null);
    setRejectionReason("");
  };

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No Milestones Defined</h3>
          <p className="text-sm text-muted-foreground">
            This deal doesn't have milestone-based payments yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestones
          </CardTitle>
          <Badge variant="outline">
            {completedMilestones} / {milestones.length} complete
          </Badge>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Released: {formatPKR(completedValue)}</span>
            <span>Total: {formatPKR(totalValue)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {milestones
          .sort((a, b) => a.order_index - b.order_index)
          .map((milestone, index) => {
            const status = statusConfig[milestone.status];
            const canSubmit = userRole === "executor" && (milestone.status === "in_progress" || milestone.status === "rejected");
            const canApprove = userRole === "initiator" && milestone.status === "submitted";

            return (
              <div
                key={milestone.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  milestone.status === "approved" && "bg-emerald-500/5 border-emerald-500/20",
                  milestone.status === "in_progress" && "bg-blue-500/5 border-blue-500/20",
                  milestone.status === "submitted" && "bg-amber-500/5 border-amber-500/20",
                  milestone.status === "rejected" && "bg-destructive/5 border-destructive/20",
                  milestone.status === "pending" && "bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      status.bg
                    )}>
                      {milestone.status === "approved" ? (
                        <CheckCircle className={cn("h-4 w-4", status.color)} />
                      ) : milestone.status === "submitted" ? (
                        <Upload className={cn("h-4 w-4", status.color)} />
                      ) : milestone.status === "rejected" ? (
                        <XCircle className={cn("h-4 w-4", status.color)} />
                      ) : (
                        <span className={cn("text-sm font-medium", status.color)}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <Badge variant="secondary" className={cn("text-xs", status.bg, status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatPKR(milestone.amount)}
                        </span>
                        {milestone.due_date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(milestone.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canSubmit && (
                      <Dialog open={submitMilestoneId === milestone.id} onOpenChange={(open) => {
                        if (open) setSubmitMilestoneId(milestone.id);
                        else { setSubmitMilestoneId(null); setSubmissionNotes(""); }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-1">
                            <Upload className="h-3 w-3" />
                            Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Milestone</DialogTitle>
                            <DialogDescription>
                              Confirm completion of "{milestone.title}". The sponsor will review and release {formatPKR(milestone.amount)}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Completion Notes (optional)</Label>
                              <Textarea
                                value={submissionNotes}
                                onChange={(e) => setSubmissionNotes(e.target.value)}
                                placeholder="Add notes about the deliverable..."
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSubmitMilestoneId(null)}>Cancel</Button>
                              <Button 
                                onClick={handleSubmitMilestone}
                                disabled={submitMilestone.isPending}
                              >
                                {submitMilestone.isPending ? "Submitting..." : "Submit for Review"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {canApprove && (
                      <div className="flex gap-2">
                        <Dialog open={rejectMilestoneId === milestone.id} onOpenChange={(open) => {
                          if (open) setRejectMilestoneId(milestone.id);
                          else { setRejectMilestoneId(null); setRejectionReason(""); }
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Request Changes
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Changes</DialogTitle>
                              <DialogDescription>
                                Explain what needs to be revised for "{milestone.title}".
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label>Reason</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="What needs to change?"
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setRejectMilestoneId(null)}>Cancel</Button>
                                <Button 
                                  variant="destructive"
                                  onClick={handleRejectMilestone}
                                  disabled={rejectMilestone.isPending}
                                >
                                  {rejectMilestone.isPending ? "Rejecting..." : "Request Changes"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleApproveMilestone(milestone.id)}
                          disabled={approveMilestone.isPending}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {approveMilestone.isPending ? "Approving..." : "Approve & Release"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
