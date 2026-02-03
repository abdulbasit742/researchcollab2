import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Area,
  AreaChart,
} from "recharts";

interface TrustTrajectoryChartProps {
  compact?: boolean;
}

export function TrustTrajectoryChart({ compact = false }: TrustTrajectoryChartProps) {
  const { trustProfile } = useMyTrustProfile();

  const trustScore = trustProfile?.trust_score ?? 0;
  const tier =
    trustScore >= 80
      ? "platinum"
      : trustScore >= 60
      ? "gold"
      : trustScore >= 40
      ? "silver"
      : "bronze";

  // Mock historical data - in production this would come from trust_score_history table
  const mockHistory = [
    { date: "Jan", score: 20, event: null },
    { date: "Feb", score: 25, event: "First project completed" },
    { date: "Mar", score: 32, event: null },
    { date: "Apr", score: 28, event: "Missed deadline (-4)" },
    { date: "May", score: 38, event: "Verified identity (+10)" },
    { date: "Jun", score: 45, event: null },
    { date: "Jul", score: trustScore, event: "Current" },
  ];

  // Calculate trajectory
  const recentScores = mockHistory.slice(-3).map((h) => h.score);
  const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const previousScores = mockHistory.slice(-6, -3).map((h) => h.score);
  const avgPrevious = previousScores.length > 0 
    ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length 
    : avgRecent;
  
  const trajectory = avgRecent > avgPrevious + 2 
    ? "improving" 
    : avgRecent < avgPrevious - 2 
    ? "declining" 
    : "stable";

  const tierColors = {
    platinum: "text-purple-500",
    gold: "text-amber-500",
    silver: "text-gray-400",
    bronze: "text-orange-500",
  };

  const tierTargets = {
    bronze: { next: "Silver", threshold: 40, progress: (trustScore / 40) * 100 },
    silver: { next: "Gold", threshold: 60, progress: ((trustScore - 40) / 20) * 100 },
    gold: { next: "Platinum", threshold: 80, progress: ((trustScore - 60) / 20) * 100 },
    platinum: { next: "Max", threshold: 100, progress: ((trustScore - 80) / 20) * 100 },
  };

  const currentTarget = tierTargets[tier];

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className={`h-5 w-5 ${tierColors[tier]}`} />
              <span className="font-semibold text-2xl">{trustScore}</span>
              <Badge variant="outline" className="capitalize text-xs">
                {tier}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {trajectory === "improving" && (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Improving</span>
                </>
              )}
              {trajectory === "declining" && (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Declining</span>
                </>
              )}
              {trajectory === "stable" && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Stable</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to {currentTarget.next}</span>
              <span>{Math.min(100, Math.round(currentTarget.progress))}%</span>
            </div>
            <Progress value={Math.min(100, currentTarget.progress)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className={`h-5 w-5 ${tierColors[tier]}`} />
            Trust Trajectory
          </span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                Trust score is calculated from verified outcomes, timely delivery, dispute-free history, and peer signals.
              </p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Score Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{trustScore}</span>
              <Badge variant="outline" className={`capitalize ${tierColors[tier]}`}>
                {tier}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm">
              {trajectory === "improving" && (
                <>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Trending up</span>
                </>
              )}
              {trajectory === "declining" && (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Needs attention</span>
                </>
              )}
              {trajectory === "stable" && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Holding steady</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next tier</p>
            <p className="font-semibold">{currentTarget.next}</p>
            <p className="text-xs text-muted-foreground">at {currentTarget.threshold} pts</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="space-y-1">
          <Progress value={Math.min(100, currentTarget.progress)} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.max(0, currentTarget.threshold - trustScore)} points to go
          </p>
        </div>

        {/* Chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockHistory}>
              <defs>
                <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border rounded-lg shadow-lg p-2 text-xs">
                        <p className="font-medium">{data.date}: {data.score}</p>
                        {data.event && <p className="text-muted-foreground">{data.event}</p>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#trustGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Events */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Recent Changes</p>
          <div className="space-y-1.5">
            {mockHistory.filter(h => h.event && h.event !== "Current").slice(-3).reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{h.date}</span>
                </span>
                <span className={h.event?.includes("-") ? "text-destructive" : "text-emerald-600"}>
                  {h.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
