import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCapabilityGraph } from "@/hooks/useCapabilityGraph";
import { Brain, TrendingUp, Award, Shield } from "lucide-react";

interface CapabilityGraphCardProps {
  userId?: string;
  compact?: boolean;
}

export function CapabilityGraphCard({ userId, compact = false }: CapabilityGraphCardProps) {
  const { capabilities, summary } = useCapabilityGraph(userId);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical_skill": return <Brain className="h-3 w-3" />;
      case "leadership_readiness": return <Award className="h-3 w-3" />;
      case "execution_reliability": return <Shield className="h-3 w-3" />;
      default: return <TrendingUp className="h-3 w-3" />;
    }
  };

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case "mastery": return "bg-primary text-primary-foreground";
      case "established": return "bg-green-500/20 text-green-700";
      case "developing": return "bg-blue-500/20 text-blue-700";
      case "emerging": return "bg-yellow-500/20 text-yellow-700";
      case "declining": return "bg-red-500/20 text-red-700";
      default: return "bg-muted";
    }
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Capability Overview</span>
            <Badge variant="outline">{summary.provenCapabilities} proven</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-muted/50">
              <p className="font-semibold">{summary.totalCapabilities}</p>
              <p className="text-muted-foreground">Total</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="font-semibold">{summary.strongCapabilities}</p>
              <p className="text-muted-foreground">Strong</p>
            </div>
            <div className="p-2 rounded bg-muted/50">
              <p className="font-semibold">{summary.emergingCapabilities}</p>
              <p className="text-muted-foreground">Emerging</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Capability Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.totalCapabilities}</p>
            <p className="text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.provenCapabilities}</p>
            <p className="text-muted-foreground">Proven</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.strongCapabilities}</p>
            <p className="text-muted-foreground">Strong</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.emergingCapabilities}</p>
            <p className="text-muted-foreground">Emerging</p>
          </div>
        </div>

        <div className="space-y-3">
          {capabilities.slice(0, 5).map((cap) => (
            <div key={cap.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(cap.category)}
                  <span className="text-sm font-medium">{cap.name}</span>
                </div>
                <Badge className={getTrajectoryColor(cap.growthTrajectory)} variant="outline">
                  {cap.growthTrajectory}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={cap.overallStrength} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-8">{cap.overallStrength}%</span>
              </div>
              <div className="flex items-center gap-1">
                {cap.proofs.slice(0, 2).map((proof, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-0">
                    {proof.proofType.replace(/_/g, " ")}
                  </Badge>
                ))}
                {cap.proofCount > 2 && (
                  <span className="text-xs text-muted-foreground">+{cap.proofCount - 2} more</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {summary.topDomains.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Top Domains</p>
            <div className="flex flex-wrap gap-1">
              {summary.topDomains.map((domain) => (
                <Badge key={domain} variant="secondary" className="text-xs">
                  {domain}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
