import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Building,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import type { AccountabilityRecord } from "@/hooks/useAccountability";

interface WorkHistoryTimelineProps {
  records: AccountabilityRecord[];
  userId: string;
  isLoading?: boolean;
  className?: string;
}

export function WorkHistoryTimeline({ 
  records, 
  userId,
  isLoading = false,
  className 
}: WorkHistoryTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const displayRecords = showAll ? records : records.slice(0, 5);

  if (isLoading) {
    return <WorkHistoryTimelineSkeleton />;
  }

  if (records.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Work History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No work history yet</p>
            <p className="text-sm mt-1">Completed projects will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          Work History ({records.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-6">
            {displayRecords.map((record, index) => (
              <WorkHistoryItem 
                key={record.id} 
                record={record} 
                userId={userId}
                isLast={index === displayRecords.length - 1} 
              />
            ))}
          </div>
        </div>

        {records.length > 5 && (
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show All ({records.length - 5} more)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface WorkHistoryItemProps {
  record: AccountabilityRecord;
  userId: string;
  isLast?: boolean;
}

function WorkHistoryItem({ record, userId, isLast }: WorkHistoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  const isExecutor = record.executor_id === userId;
  const role = isExecutor ? "Executor" : "Initiator";
  const otherPartyName = isExecutor ? record.initiator_name : record.executor_name;

  const getStatusConfig = () => {
    switch (record.outcome_status) {
      case "completed":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "bg-emerald-500",
          textColor: "text-emerald-600",
          bgColor: "bg-emerald-500/10",
          label: "Completed",
        };
      case "failed":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-500",
          textColor: "text-red-600",
          bgColor: "bg-red-500/10",
          label: "Failed",
        };
      case "disputed":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "bg-amber-500",
          textColor: "text-amber-600",
          bgColor: "bg-amber-500/10",
          label: "Disputed",
        };
      case "abandoned":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-slate-400",
          textColor: "text-slate-600",
          bgColor: "bg-slate-500/10",
          label: "Abandoned",
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-blue-500",
          textColor: "text-blue-600",
          bgColor: "bg-blue-500/10",
          label: "In Progress",
        };
    }
  };

  const status = getStatusConfig();
  
  const trustImpact = isExecutor ? record.trust_impact_executor : record.trust_impact_initiator;

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-2 w-4 h-4 rounded-full border-2 border-background",
        status.color
      )} />

      <div 
        className={cn(
          "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
          status.bgColor
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("gap-1", status.textColor)}>
                {status.icon}
                {status.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {role}
              </Badge>
              <span className="text-xs text-muted-foreground capitalize">
                {record.collaboration_type.replace(/_/g, " ")}
              </span>
            </div>
            
            <p className="font-medium mt-2">
              {record.promised_deliverables.join(", ") || "Work Agreement"}
            </p>
            
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              with {otherPartyName || "Unknown"}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              {format(new Date(record.created_at), "MMM yyyy")}
            </p>
            {trustImpact !== 0 && record.trust_impact_applied && (
              <Badge 
                variant="outline" 
                className={cn(
                  "mt-1 text-xs",
                  trustImpact > 0 ? "text-emerald-600 border-emerald-300" : "text-red-600 border-red-300"
                )}
              >
                {trustImpact > 0 ? "+" : ""}{trustImpact} trust
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Financial Info */}
            {record.escrow_amount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Escrow: ${record.escrow_amount.toLocaleString()}</span>
                {record.total_paid > 0 && (
                  <span className="text-muted-foreground">
                    (${record.total_paid.toLocaleString()} paid)
                  </span>
                )}
              </div>
            )}

            {/* Deadline */}
            {record.deadline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Deadline: {format(new Date(record.deadline), "PPP")}</span>
              </div>
            )}

            {/* Failure Reason (visible for transparency) */}
            {record.outcome_status === "failed" && record.failure_reason && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Failure Context
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {record.failure_reason}
                </p>
                {record.failure_attributed_to && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Attributed to: {record.failure_attributed_to === userId ? "This user" : "Other party"}
                  </p>
                )}
              </div>
            )}

            {/* Outcome Verdict */}
            {record.outcome_verdict && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{record.outcome_verdict}</span>
              </div>
            )}

            {/* Verification */}
            {record.verified_at && record.verification_method && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified via {record.verification_method}</span>
              </div>
            )}
          </div>
        )}

        {/* Expand indicator */}
        <div className="flex justify-center mt-2">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

function WorkHistoryTimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
