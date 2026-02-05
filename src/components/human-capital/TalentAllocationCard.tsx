import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTalentAllocation, type AllocationCandidate } from "@/hooks/useTalentAllocation";
import { Users, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface TalentAllocationCardProps {
  requestId?: string;
}

export function TalentAllocationCard({ requestId }: TalentAllocationCardProps) {
  const { results, summary, getAllocationHistory } = useTalentAllocation();
  const result = requestId ? results.get(requestId) : null;
  const history = getAllocationHistory();

  const getRecommendationColor = (rec: AllocationCandidate["recommendation"]) => {
    switch (rec) {
      case "strong": return "bg-green-500/20 text-green-700";
      case "suitable": return "bg-blue-500/20 text-blue-700";
      case "stretch": return "bg-yellow-500/20 text-yellow-700";
      case "risk": return "bg-red-500/20 text-red-700";
      default: return "bg-muted";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low": return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "medium": return <Clock className="h-3 w-3 text-yellow-500" />;
      case "high": return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  if (result) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Allocation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.warnings.length > 0 && (
            <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Warnings
              </p>
              <ul className="text-xs text-muted-foreground mt-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {result.candidates.map((candidate, i) => (
              <div key={candidate.userId} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Candidate #{i + 1}</span>
                  <Badge className={getRecommendationColor(candidate.recommendation)}>
                    {candidate.recommendation}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={candidate.matchScore} className="h-2 flex-1" />
                  <span className="text-xs">{candidate.matchScore}% match</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {getRiskIcon(candidate.riskAssessment.overallRisk)}
                    <span>{candidate.riskAssessment.overallRisk} risk</span>
                  </div>
                  <Badge variant="outline">{candidate.availabilityStatus}</Badge>
                </div>
              </div>
            ))}
          </div>

          {result.alternativeSuggestions.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">Alternatives</p>
              <ul className="text-sm space-y-1">
                {result.alternativeSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default view: allocation history summary
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Talent Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{history.total}</p>
            <p className="text-xs text-muted-foreground">Allocations</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{(history.successRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{history.averageMatchScore}</p>
            <p className="text-xs text-muted-foreground">Avg Match</p>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Common Issues</p>
          <ul className="space-y-1">
            {history.commonIssues.map((issue, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-1 text-yellow-500 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-sm">
          <span className="text-muted-foreground">Active requests</span>
          <Badge variant="outline">{summary.activeRequests}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
