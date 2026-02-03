import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMarketDemand } from "@/hooks/useMarketDemand";
import { Radar, TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";

export function MarketDemandRadar() {
  const { skillDemands, emergingAreas, pricingTrends } = useMarketDemand();

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radar className="h-5 w-5 text-primary" />
            Market Demand Radar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emergingAreas.slice(0, 3).map(skill => (
            <div key={skill.skill} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center justify-between">
                <span className="font-medium">{skill.skill}</span>
                <Badge className="bg-green-500">+{skill.rateChange30Days.toFixed(1)}%</Badge>
              </div>
              <Progress value={skill.demandScore} className="h-2 mt-2" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">All Skills</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {skillDemands.map(skill => (
            <div key={skill.skill} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm">{skill.skill}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">${skill.averageRate}/hr</Badge>
                {skill.demandTrend === "rising" ? <TrendingUp className="h-4 w-4 text-green-500" /> :
                 skill.demandTrend === "declining" ? <TrendingDown className="h-4 w-4 text-red-500" /> :
                 <Minus className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
