import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealDecision } from "@/hooks/useDealRoom";
import { formatDistanceToNow } from "date-fns";
import { formatPKR } from "@/lib/currency";
import {
  FileText,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Target,
  AlertTriangle,
  Flag,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DealDecisionLogProps {
  decisions: DealDecision[];
}

const decisionTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  proposal: { icon: FileText, color: "text-blue-600", label: "Proposal" },
  counter: { icon: ArrowRightLeft, color: "text-amber-600", label: "Counter-Proposal" },
  accept: { icon: CheckCircle, color: "text-emerald-600", label: "Accepted" },
  reject: { icon: XCircle, color: "text-destructive", label: "Rejected" },
  milestone: { icon: Target, color: "text-purple-600", label: "Milestone Update" },
  dispute: { icon: AlertTriangle, color: "text-destructive", label: "Dispute Raised" },
  complete: { icon: Flag, color: "text-emerald-600", label: "Completed" },
};

export function DealDecisionLog({ decisions }: DealDecisionLogProps) {
  if (decisions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No Activity Yet</h3>
          <p className="text-sm text-muted-foreground">
            Decisions and actions will appear here as the deal progresses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Decision Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {decisions.map((decision, index) => {
              const config = decisionTypeConfig[decision.decision_type] || decisionTypeConfig.proposal;
              const Icon = config.icon;

              return (
                <div key={decision.id} className="relative pl-10">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute left-2 h-5 w-5 rounded-full bg-background border-2 flex items-center justify-center",
                    decision.is_binding ? "border-primary" : "border-muted-foreground"
                  )}>
                    <Icon className={cn("h-3 w-3", config.color)} />
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {decision.is_binding && (
                          <Badge variant="outline" className="text-xs">
                            Binding
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(decision.timestamp), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm font-medium">
                      {decision.actor_name || "Unknown"}: {decision.description}
                    </p>

                    {decision.amount && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Amount: {formatPKR(decision.amount)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
