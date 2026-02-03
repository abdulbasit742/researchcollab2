import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  XCircle,
  Clock,
  DollarSign,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

interface FailureRecord {
  id: string;
  type: "missed_deadline" | "dispute" | "canceled" | "low_quality";
  title: string;
  date: string;
  trustImpact: number;
  reason: string;
  learningSignal: string;
  recoveryPath: string;
  isRecovered: boolean;
}

export function FailureRecoveryPanel() {
  // Mock failure data - in production would come from accountability_records
  const failures: FailureRecord[] = [
    {
      id: "1",
      type: "missed_deadline",
      title: "Data Analysis Project",
      date: "2024-01-15",
      trustImpact: -4,
      reason: "Scope expanded mid-project without timeline adjustment",
      learningSignal: "Always renegotiate timeline when scope changes",
      recoveryPath: "Complete 2 projects on-time to recover trust",
      isRecovered: true,
    },
    {
      id: "2",
      type: "dispute",
      title: "Research Paper Collaboration",
      date: "2024-02-20",
      trustImpact: -8,
      reason: "Misalignment on authorship expectations",
      learningSignal: "Document contribution agreements upfront",
      recoveryPath: "Resolve dispute through mediation, 1 project remaining",
      isRecovered: false,
    },
  ];

  const unresolvedCount = failures.filter(f => !f.isRecovered).length;

  const getTypeIcon = (type: FailureRecord["type"]) => {
    switch (type) {
      case "missed_deadline":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "dispute":
        return <MessageSquare className="h-4 w-4 text-destructive" />;
      case "canceled":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case "low_quality":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getTypeLabel = (type: FailureRecord["type"]) => {
    switch (type) {
      case "missed_deadline":
        return "Deadline Missed";
      case "dispute":
        return "Dispute";
      case "canceled":
        return "Canceled";
      case "low_quality":
        return "Quality Issue";
    }
  };

  if (failures.length === 0) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
          <h3 className="font-semibold mb-1">No Setbacks Yet</h3>
          <p className="text-sm text-muted-foreground">
            Your track record is clean. Keep delivering quality work.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Setbacks & Recovery
          </span>
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unresolvedCount} unresolved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Philosophy Note */}
        <div className="p-3 rounded-lg bg-muted/50 border-dashed border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">We don't hide failures.</span>{" "}
            Every professional faces setbacks. What matters is how you recover.
          </p>
        </div>

        {/* Failure Records */}
        <div className="space-y-3">
          {failures.map((failure) => (
            <div
              key={failure.id}
              className={`p-4 rounded-lg border ${
                failure.isRecovered
                  ? "bg-muted/30 border-muted"
                  : "bg-destructive/5 border-destructive/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTypeIcon(failure.type)}</div>
                  <div>
                    <h4 className="font-medium text-sm">{failure.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">
                        {getTypeLabel(failure.type)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(failure.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={failure.isRecovered ? "secondary" : "destructive"}
                  className="shrink-0 text-xs"
                >
                  {failure.trustImpact > 0 ? "+" : ""}{failure.trustImpact}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{failure.reason}</p>

              {/* Learning Signal */}
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 mb-2">
                <p className="text-xs flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{failure.learningSignal}</span>
                </p>
              </div>

              {/* Recovery Path */}
              <div className={`p-2 rounded ${failure.isRecovered ? "bg-emerald-500/10" : "bg-primary/10"}`}>
                <p className="text-xs flex items-start gap-2">
                  <TrendingUp className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${failure.isRecovered ? "text-emerald-500" : "text-primary"}`} />
                  <span>
                    {failure.isRecovered ? (
                      <span className="text-emerald-600">✓ Recovered</span>
                    ) : (
                      failure.recoveryPath
                    )}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View Full History */}
        <Button asChild variant="outline" size="sm" className="w-full gap-1">
          <Link to="/reality">
            View Full Accountability Ledger
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
