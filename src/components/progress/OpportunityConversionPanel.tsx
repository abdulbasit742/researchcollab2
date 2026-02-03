import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

interface OpportunityStats {
  applied: number;
  won: number;
  lost: number;
  pending: number;
  winRate: number;
  avgResponseTime: number;
  totalEarned: number;
  avgDealValue: number;
}

interface OpportunityConversionPanelProps {
  stats?: OpportunityStats;
}

export function OpportunityConversionPanel({ stats }: OpportunityConversionPanelProps) {
  // Mock stats - in production would come from offers/bids data
  const defaultStats: OpportunityStats = {
    applied: 12,
    won: 5,
    lost: 4,
    pending: 3,
    winRate: 55.5,
    avgResponseTime: 4.2,
    totalEarned: 125000,
    avgDealValue: 25000,
  };

  const data = stats || defaultStats;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Opportunity Conversion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Win Rate Hero Metric */}
        <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
          <p className="text-4xl font-bold text-primary">{data.winRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.won} of {data.applied} opportunities won
          </p>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              Applied
            </span>
            <span className="font-medium">{data.applied}</span>
          </div>
          <Progress value={100} className="h-3" />

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Won
            </span>
            <span className="font-medium text-emerald-600">{data.won}</span>
          </div>
          <Progress value={(data.won / data.applied) * 100} className="h-3 [&>div]:bg-emerald-500" />

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              Lost
            </span>
            <span className="font-medium text-destructive">{data.lost}</span>
          </div>
          <Progress value={(data.lost / data.applied) * 100} className="h-3 [&>div]:bg-destructive" />

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-amber-500">
              <Clock className="h-4 w-4" />
              Pending
            </span>
            <span className="font-medium text-amber-500">{data.pending}</span>
          </div>
          <Progress value={(data.pending / data.applied) * 100} className="h-3 [&>div]:bg-amber-500" />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Response</p>
            <p className="text-lg font-semibold">{data.avgResponseTime}h</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Deal</p>
            <p className="text-lg font-semibold">{formatPKR(data.avgDealValue)}</p>
          </div>
        </div>

        {/* Total Earned */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Total Earned
            </span>
            <span className="font-bold text-emerald-600">{formatPKR(data.totalEarned)}</span>
          </div>
        </div>

        {/* Insight */}
        <div className="p-2 rounded bg-muted/50 border-dashed border">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span>
              Your win rate is above average. Focus on higher-value opportunities to maximize earnings.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
