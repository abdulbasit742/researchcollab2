import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Shield,
  DollarSign,
  Upload,
  RotateCcw,
  Flag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Flexible milestone type that works with both database and mock data
export interface MilestoneData {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  status: "pending" | "submitted" | "approved" | "revision_requested" | "released" | "disputed";
  expected_delivery?: string | null;
  expectedDelivery?: string;
  submitted_at?: string | null;
  submittedAt?: string;
  approved_at?: string | null;
  approvedAt?: string;
  released_at?: string | null;
  releasedAt?: string;
}

// Helper function to calculate milestone progress
function calculateMilestoneProgress(milestones: MilestoneData[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter(m => 
    m.status === "approved" || m.status === "released"
  ).length;
  return Math.round((completed / milestones.length) * 100);
}

interface MilestoneTrackerProps {
  milestones: MilestoneData[];
  totalBudget: number;
  userRole: "client" | "provider";
  onMilestoneUpdate?: (milestoneId: string, status: MilestoneData["status"]) => void;
}

const statusConfig: Record<MilestoneData["status"], { 
  label: string; 
  color: string; 
  icon: React.ElementType;
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
}> = {
  pending: { label: "Pending", color: "text-muted-foreground", icon: Clock, variant: "secondary" },
  submitted: { label: "Submitted", color: "text-blue-500", icon: Upload, variant: "default" },
  approved: { label: "Approved", color: "text-emerald-500", icon: CheckCircle2, variant: "success" },
  revision_requested: { label: "Revision Needed", color: "text-amber-500", icon: RotateCcw, variant: "warning" },
  released: { label: "Released", color: "text-emerald-500", icon: DollarSign, variant: "success" },
  disputed: { label: "Disputed", color: "text-destructive", icon: AlertCircle, variant: "destructive" },
};

export function MilestoneTracker({ 
  milestones, 
  totalBudget, 
  userRole,
  onMilestoneUpdate 
}: MilestoneTrackerProps) {
  const { toast } = useToast();
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  
  const progress = calculateMilestoneProgress(milestones);
  const escrowAmount = milestones
    .filter(m => m.status !== "released")
    .reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones
    .filter(m => m.status === "released")
    .reduce((sum, m) => sum + m.amount, 0);

  const handleSubmit = (milestone: MilestoneData) => {
    onMilestoneUpdate?.(milestone.id, "submitted");
    toast({
      title: "Milestone Submitted",
      description: "Your work has been submitted for review.",
    });
  };

  const handleApprove = (milestone: MilestoneData) => {
    const commission = milestone.amount * (10 / 100);
    const netAmount = milestone.amount - commission;
    
    onMilestoneUpdate?.(milestone.id, "approved");
    toast({
      title: "Milestone Approved",
      description: `$${netAmount.toFixed(0)} released to provider (after $${commission.toFixed(0)} platform fee)`,
    });
  };

  const handleRequestRevision = (milestone: MilestoneData) => {
    onMilestoneUpdate?.(milestone.id, "revision_requested");
    toast({
      title: "Revision Requested",
      description: "The provider has been notified to make revisions.",
    });
  };

  const handleDispute = () => {
    if (!selectedMilestone || !disputeReason.trim()) return;
    
    onMilestoneUpdate?.(selectedMilestone.id, "disputed");
    toast({
      title: "Dispute Raised",
      description: "Your dispute has been submitted for admin review.",
      variant: "destructive",
    });
    setShowDisputeModal(false);
    setDisputeReason("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Escrow-Protected Milestones
              </CardTitle>
              <CardDescription className="mt-1">
                Funds are released upon milestone approval
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              ${escrowAmount.toLocaleString()} Protected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${releasedAmount.toLocaleString()} released</span>
              <span>${escrowAmount.toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Milestone List */}
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const config = statusConfig[milestone.status];
              const StatusIcon = config.icon;
              const commission = milestone.amount * (10 / 100);
              const netAmount = milestone.amount - commission;

              return (
                <div 
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${
                    milestone.status === "disputed" 
                      ? "border-destructive/50 bg-destructive/5" 
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      milestone.status === "released" || milestone.status === "approved"
                        ? "bg-emerald-500/20"
                        : milestone.status === "disputed"
                          ? "bg-destructive/20"
                          : milestone.status === "submitted"
                            ? "bg-blue-500/20"
                            : "bg-muted"
                    }`}>
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            Milestone {index + 1}: {milestone.title}
                            <Badge variant={config.variant} className="text-xs">
                              {config.label}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg">${milestone.amount}</p>
                          {milestone.status === "approved" && (
                            <p className="text-xs text-muted-foreground">
                              Net: ${netAmount.toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Timeline info */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {(milestone.expectedDelivery || milestone.expected_delivery) && (
                          <span>Due: {new Date(milestone.expectedDelivery || milestone.expected_delivery!).toLocaleDateString()}</span>
                        )}
                        {(milestone.submittedAt || milestone.submitted_at) && (
                          <span>Submitted: {new Date(milestone.submittedAt || milestone.submitted_at!).toLocaleDateString()}</span>
                        )}
                        {(milestone.releasedAt || milestone.released_at) && (
                          <span className="text-emerald-500">Released: {new Date(milestone.releasedAt || milestone.released_at!).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {/* Provider actions */}
                        {userRole === "provider" && milestone.status === "pending" && (
                          <Button size="sm" onClick={() => handleSubmit(milestone)}>
                            <Upload className="h-3 w-3 mr-1" />
                            Submit for Review
                          </Button>
                        )}
                        {userRole === "provider" && milestone.status === "revision_requested" && (
                          <Button size="sm" onClick={() => handleSubmit(milestone)}>
                            <Upload className="h-3 w-3 mr-1" />
                            Resubmit
                          </Button>
                        )}

                        {/* Client actions */}
                        {userRole === "client" && milestone.status === "submitted" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(milestone)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve & Release
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleRequestRevision(milestone)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Request Revision
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedMilestone(milestone);
                                setShowDisputeModal(true);
                              }}
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              Raise Dispute
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Payment breakdown on approval */}
                      {(milestone.status === "approved" || milestone.status === "released") && (
                        <div className="mt-3 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center justify-between text-xs">
                            <span>Milestone Amount</span>
                            <span>${milestone.amount}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Platform Fee (10%)</span>
                            <span>-${commission.toFixed(0)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1 border-t border-emerald-500/20 mt-1">
                            <span>Net Amount</span>
                            <span>${netAmount.toFixed(0)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Modal */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Flag className="h-5 w-5" />
              Raise Dispute
            </DialogTitle>
            <DialogDescription>
              Explain why you're disputing this milestone. Our team will review and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Dispute</Label>
              <Textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Funds will be held in escrow until the dispute is resolved by our admin team.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDisputeModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDispute}
              disabled={!disputeReason.trim()}
            >
              Submit Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
