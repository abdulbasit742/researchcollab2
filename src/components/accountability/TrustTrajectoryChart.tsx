import { useTrustTrajectory } from "@/hooks/useAccountability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface TrustTrajectoryChartProps {
  userId?: string;
  isCompact?: boolean;
}

export function TrustTrajectoryChart({ userId, isCompact = false }: TrustTrajectoryChartProps) {
  const { data: trajectory = [], isLoading } = useTrustTrajectory(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (trajectory.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className={isCompact ? "p-4" : "py-8"}>
          <div className="text-center">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No trust history yet. Complete projects to see your trajectory.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const firstScore = trajectory[0]?.score || 0;
  const lastScore = trajectory[trajectory.length - 1]?.score || 0;
  const trend = lastScore > firstScore ? "rising" : lastScore < firstScore ? "declining" : "stable";

  const trendConfig = {
    rising: { icon: TrendingUp, color: "text-emerald-600", label: "Rising" },
    stable: { icon: Minus, color: "text-amber-600", label: "Stable" },
    declining: { icon: TrendingDown, color: "text-red-600", label: "Declining" },
  };
  const TrendIcon = trendConfig[trend].icon;

  // Calculate tier thresholds
  const tiers = [
    { value: 80, label: "Platinum", color: "#a855f7" },
    { value: 60, label: "Gold", color: "#f59e0b" },
    { value: 40, label: "Silver", color: "#6b7280" },
  ];

  if (isCompact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Trust History
            </span>
            <Badge variant="outline" className={`text-xs ${trendConfig[trend].color}`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {trendConfig[trend].label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectory}>
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trust Trajectory
          </span>
          <Badge variant="outline" className={trendConfig[trend].color}>
            <TrendIcon className="h-4 w-4 mr-1" />
            {trendConfig[trend].label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current vs Start */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Start</p>
            <p className="text-lg font-bold">{firstScore}</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <TrendIcon className={`h-6 w-6 ${trendConfig[trend].color}`} />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-bold">{lastScore}</p>
          </div>
          <div className="text-center border-l pl-4">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className={`text-lg font-bold ${
              lastScore > firstScore ? "text-emerald-600" : 
              lastScore < firstScore ? "text-red-600" : ""
            }`}>
              {lastScore >= firstScore ? "+" : ""}{lastScore - firstScore}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">{data.date}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: <span className="font-medium">{data.score}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Event: <span className="font-medium">{data.type?.replace(/_/g, " ")}</span>
                        </p>
                        <p className={`text-xs font-medium ${
                          data.delta > 0 ? "text-emerald-600" : 
                          data.delta < 0 ? "text-red-600" : ""
                        }`}>
                          Change: {data.delta > 0 ? "+" : ""}{data.delta}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Tier reference lines */}
              {tiers.map((tier) => (
                <ReferenceLine
                  key={tier.label}
                  y={tier.value}
                  stroke={tier.color}
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              ))}
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          {tiers.map((tier) => (
            <div key={tier.label} className="flex items-center gap-1">
              <div
                className="w-3 h-0.5"
                style={{ backgroundColor: tier.color }}
              />
              <span>{tier.label} ({tier.value}+)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
