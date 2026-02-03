import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Network, Users, Clock, AlertTriangle, TrendingUp } from "lucide-react";

export function NetworkStrengthAnalyzer() {
  const networkStats = {
    totalConnections: 127,
    activeConnections: 89,
    dormantConnections: 38,
    diversityScore: 72,
    averageStrength: 68,
    coverageGaps: ["Healthcare", "Government", "Legal"],
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="h-5 w-5 text-primary" />
          Network Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{networkStats.totalConnections}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-2xl font-bold text-green-600">{networkStats.diversityScore}%</p>
            <p className="text-xs text-muted-foreground">Diversity</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Active Connections</span>
            <span>{networkStats.activeConnections}</span>
          </div>
          <Progress value={(networkStats.activeConnections / networkStats.totalConnections) * 100} className="h-2" />
        </div>

        {networkStats.dormantConnections > 20 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {networkStats.dormantConnections} dormant connections need attention
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">Coverage Gaps</p>
          <div className="flex flex-wrap gap-1">
            {networkStats.coverageGaps.map(gap => (
              <Badge key={gap} variant="outline">{gap}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
