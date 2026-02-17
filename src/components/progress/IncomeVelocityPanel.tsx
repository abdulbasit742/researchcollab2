import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncomeVelocity } from "@/hooks/useIncomeVelocity";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export function IncomeVelocityPanel() {
  const { data, isLoading } = useIncomeVelocity();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const formatCurrency = (val: number) =>
    val >= 1000000
      ? `${(val / 1000000).toFixed(1)}M`
      : val >= 1000
      ? `${(val / 1000).toFixed(0)}K`
      : val.toLocaleString();

  // Calculate velocity trend
  const earnings = data.monthlyEarnings;
  const lastMonth = earnings[earnings.length - 1]?.amount || 0;
  const prevMonth = earnings[earnings.length - 2]?.amount || 0;
  const velocityChange = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Income Velocity
        </CardTitle>
        <CardDescription>
          Your financial operating system — earnings, pipeline, and trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            icon={DollarSign}
            label="Total Earned"
            value={`PKR ${formatCurrency(data.totalEarned)}`}
            iconColor="text-emerald-500"
          />
          <MetricCard
            icon={ArrowUpRight}
            label="Pipeline"
            value={`PKR ${formatCurrency(data.pipelineValue)}`}
            iconColor="text-blue-500"
          />
          <MetricCard
            icon={Briefcase}
            label="Active Deals"
            value={data.activeDealCount.toString()}
            iconColor="text-amber-500"
          />
          <MetricCard
            icon={Clock}
            label="Avg Cycle"
            value={`${data.avgDealCycleDays}d`}
            iconColor="text-purple-500"
          />
        </div>

        {/* Earnings chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Monthly Earnings (6 months)</p>
            {velocityChange !== 0 && (
              <span
                className={`text-xs font-medium ${
                  velocityChange > 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {velocityChange > 0 ? "+" : ""}
                {velocityChange.toFixed(0)}% vs last month
              </span>
            )}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyEarnings}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Earned"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: any;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <Icon className={`h-4 w-4 ${iconColor} mb-1`} />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
