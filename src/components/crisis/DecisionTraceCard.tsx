import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Users, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { TracedDecision } from "@/types/crisis-coordination";

interface DecisionTraceCardProps {
  decision: TracedDecision;
  onRecordOutcome?: () => void;
}

const impactColors = {
  minor: "bg-muted text-muted-foreground",
  moderate: "bg-blue-500/10 text-blue-600",
  major: "bg-amber-500/10 text-amber-600",
  critical: "bg-red-500/10 text-red-600",
};

export function DecisionTraceCard({ decision, onRecordOutcome }: DecisionTraceCardProps) {
  const isFinalized = !!decision.madeAt;
  const selectedOption = decision.options.find(o => o.wasSelected);
  const approvers = decision.participants.filter(p => p.vote === "approve").length;
  const rejecters = decision.participants.filter(p => p.vote === "reject").length;

  return (
    <Card className={isFinalized ? "" : "border-dashed"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{decision.title}</CardTitle>
          </div>
          <Badge className={impactColors[decision.impactLevel]}>
            {decision.impactLevel}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{decision.context}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Participants & Votes */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{decision.participants.length} participants</span>
          </div>
          {decision.participants.some(p => p.vote) && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {approvers}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="h-3 w-3" />
                {rejecters}
              </span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Options Considered</h4>
          <div className="space-y-1">
            {decision.options.map((option) => (
              <div 
                key={option.id}
                className={`
                  p-2 rounded text-sm border
                  ${option.wasSelected 
                    ? "bg-primary/10 border-primary" 
                    : "bg-muted/50 border-transparent"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={option.wasSelected ? "font-medium" : ""}>
                    {option.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {option.riskLevel} risk
                    </Badge>
                    {option.wasSelected && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rationale (if finalized) */}
        {isFinalized && decision.rationale && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rationale
            </h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              {decision.rationale}
            </p>
          </div>
        )}

        {/* Timing */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          {isFinalized ? (
            <>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Decided {new Date(decision.madeAt).toLocaleDateString()}
              </span>
              <span>
                {decision.outcomes.length} outcome{decision.outcomes.length !== 1 ? "s" : ""} recorded
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <Clock className="h-3 w-3" />
              Pending decision
            </span>
          )}
        </div>

        {/* Tags */}
        {decision.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {decision.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
