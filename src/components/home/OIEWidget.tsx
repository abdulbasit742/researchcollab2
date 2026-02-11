import { Link } from "react-router-dom";
import { useOpportunityIntelligence } from "@/hooks/useOpportunityIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, ArrowRight } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export function OIEWidget() {
  const { data, isLoading, scoreIncreased } = useOpportunityIntelligence();

  if (isLoading) {
    return <Skeleton className="h-44 w-full rounded-xl" />;
  }

  if (!data) return null;

  const radialData = [{ name: "Score", value: data.opportunity_score, fill: "hsl(var(--primary))" }];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Opportunity Intelligence
          {scoreIncreased && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-0.5 text-[10px]">
              <TrendingUp className="h-2.5 w-2.5" /> ↑
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <ResponsiveContainer width={64} height={64}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(var(--muted))" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div>
            <p className="text-2xl font-bold">{data.opportunity_score}</p>
            <p className="text-[10px] text-muted-foreground">Match Score</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-emerald-600">PKR {data.projected_income.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">90-day projection</p>
          </div>
        </div>

        {data.recommended_actions.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            💡 {data.recommended_actions[0].action}
          </p>
        )}

        <Button variant="ghost" size="sm" asChild className="w-full gap-1 text-xs">
          <Link to="/opportunity-intelligence">
            View Full Report <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
