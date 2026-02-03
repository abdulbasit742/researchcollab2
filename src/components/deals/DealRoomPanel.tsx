import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useDealExecution, STANDARD_CLAUSES, DealMilestone } from "@/hooks/useDealExecution";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users,
  DollarSign,
  Shield,
  MessageSquare,
  ChevronRight,
  Upload,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DealRoomPanelProps {
  dealId: string;
}

export function DealRoomPanel({ dealId }: DealRoomPanelProps) {
  const {
    deal,
    milestones,
    participants,
    decisions,
    health,
    loading,
    error,
    submitMilestone,
    approveMilestone,
    disputeMilestone,
  } = useDealExecution(dealId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p>{error || "Deal not found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deal Health */}
      {health && (
        <Card className={cn(
          "border-l-4",
          health.status === "healthy" ? "border-l-green-500" :
          health.status === "at_risk" ? "border-l-amber-500" :
          "border-l-red-500"
        )}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  health.status === "healthy" ? "bg-green-100 dark:bg-green-950" :
                  health.status === "at_risk" ? "bg-amber-100 dark:bg-amber-950" :
                  "bg-red-100 dark:bg-red-950"
                )}>
                  <Shield className={cn(
                    "h-5 w-5",
                    health.status === "healthy" ? "text-green-600" :
                    health.status === "at_risk" ? "text-amber-600" :
                    "text-red-600"
                  )} />
                </div>
                <div>
                  <div className="font-medium">Deal Health: {health.score}%</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    Status: {health.status}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Timeline</div>
                  <div className="font-medium">{health.timelineAdherence}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Communication</div>
                  <div className="font-medium">{health.communicationScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Scope Drift</div>
                  <div className={cn(
                    "font-medium",
                    health.scopeDriftScore > 30 ? "text-red-600" : "text-green-600"
                  )}>
                    {health.scopeDriftScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Alerts */}
            {health.risks.length > 0 && (
              <div className="mt-4 space-y-2">
                {health.risks.map((risk, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded text-sm",
                      risk.severity === "high" ? "bg-red-100 dark:bg-red-950/50 text-red-700" :
                      risk.severity === "medium" ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700" :
                      "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {risk.description}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Participants */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <Badge key={p.id} variant="secondary" className="py-1 px-3">
                <span className="capitalize">{p.role}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneCard 
                key={milestone.id} 
                milestone={milestone}
                index={index}
                onSubmit={() => submitMilestone(milestone.id, [])}
                onApprove={() => approveMilestone(milestone.id)}
                onDispute={() => disputeMilestone(milestone.id, "Reason")}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decisions */}
      {decisions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Pending Decisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {decisions.filter(d => d.status === "pending").map((decision) => (
                <div key={decision.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">
                      {decision.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(decision.createdAt, "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{decision.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Clauses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Active Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {STANDARD_CLAUSES.filter(c => c.isRequired).map((clause) => (
              <div key={clause.id} className="p-2 bg-muted/50 rounded text-sm">
                <div className="font-medium">{clause.title}</div>
                <div className="text-muted-foreground text-xs">{clause.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MilestoneCardProps {
  milestone: DealMilestone;
  index: number;
  onSubmit: () => void;
  onApprove: () => void;
  onDispute: () => void;
}

function MilestoneCard({ milestone, index, onSubmit, onApprove, onDispute }: MilestoneCardProps) {
  const statusConfig = {
    pending: { color: "bg-gray-500", icon: Clock, label: "Pending" },
    in_progress: { color: "bg-blue-500", icon: Clock, label: "In Progress" },
    submitted: { color: "bg-amber-500", icon: Upload, label: "Submitted" },
    approved: { color: "bg-green-500", icon: CheckCircle2, label: "Approved" },
    disputed: { color: "bg-red-500", icon: AlertTriangle, label: "Disputed" },
  };

  const config = statusConfig[milestone.status];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      "p-4 border rounded-lg",
      milestone.status === "approved" ? "bg-green-50/50 dark:bg-green-950/20" :
      milestone.status === "disputed" ? "bg-red-50/50 dark:bg-red-950/20" :
      ""
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
          config.color
        )}>
          {index + 1}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{milestone.title}</h4>
            <Badge variant="outline" className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {milestone.description}
          </p>

          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">${milestone.amount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {format(milestone.dueDate, "MMM d, yyyy")}</span>
            </div>
          </div>

          {/* Deliverables */}
          {milestone.deliverables.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Deliverables:</div>
              <div className="flex flex-wrap gap-1">
                {milestone.deliverables.map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions based on status */}
          {milestone.status === "pending" && (
            <Button size="sm" onClick={onSubmit}>
              <Upload className="h-4 w-4 mr-1" />
              Submit for Review
            </Button>
          )}

          {milestone.status === "submitted" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={onApprove}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={onDispute}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                Dispute
              </Button>
            </div>
          )}

          {milestone.status === "approved" && milestone.completedAt && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Completed on {format(milestone.completedAt, "MMM d, yyyy")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
