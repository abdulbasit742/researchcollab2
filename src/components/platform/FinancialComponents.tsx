import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  useFinancialIntelligence,
  EarningsForecast,
  RevenueStream,
  ClientValue,
  FinancialGoal
} from "@/hooks/useFinancialIntelligence";
import { useWallet } from "@/hooks/useWallet";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Target,
  Users,
  FileText,
  Download,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  CreditCard,
  Receipt,
  Calculator
} from "lucide-react";
import { format } from "date-fns";

// =====================================================
// FINANCIAL STAT CARD
// =====================================================
export function FinancialStatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend
}: {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          {change !== undefined && (
            <Badge 
              variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
              className="gap-1"
            >
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : 
               trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
              {change > 0 ? "+" : ""}{change}%
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {changeLabel && (
            <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// EARNINGS FORECAST CHART
// =====================================================
export function EarningsForecastCard({ forecast }: { forecast: EarningsForecast | null }) {
  if (!forecast) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const trendColors = {
    growing: "text-green-500",
    stable: "text-yellow-500",
    declining: "text-red-500"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Earnings Forecast
        </CardTitle>
        <CardDescription>6-month projection based on your performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-6">
          <Badge variant="outline" className={trendColors[forecast.trend]}>
            {forecast.trend === "growing" && <TrendingUp className="h-3 w-3 mr-1" />}
            {forecast.trend === "declining" && <TrendingDown className="h-3 w-3 mr-1" />}
            {forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)} Trend
          </Badge>
        </div>

        <div className="space-y-4">
          {forecast.projections.map((projection) => (
            <div key={projection.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{projection.month}</span>
                <span className="font-medium">
                  ${projection.projected_earnings.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={(projection.projected_earnings / Math.max(...forecast.projections.map(p => p.projected_earnings))) * 100} 
                  className="h-2"
                />
                <div 
                  className="absolute top-0 h-2 bg-primary/30 rounded-full"
                  style={{
                    left: `${(projection.confidence_interval.low / Math.max(...forecast.projections.map(p => p.confidence_interval.high))) * 100}%`,
                    right: `${100 - (projection.confidence_interval.high / Math.max(...forecast.projections.map(p => p.confidence_interval.high))) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Key Drivers</p>
          <div className="flex flex-wrap gap-2">
            {forecast.key_drivers.map((driver) => (
              <Badge key={driver} variant="secondary">{driver}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// REVENUE STREAMS BREAKDOWN
// =====================================================
export function RevenueStreamsCard({ streams }: { streams: RevenueStream[] }) {
  if (streams.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No revenue streams tracked</p>
          <Button variant="outline" size="sm" className="mt-3">
            Add Revenue Stream
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = streams.reduce((sum, s) => sum + s.monthly_average, 0);

  const sourceIcons: Record<string, React.ReactNode> = {
    projects: <FileText className="h-4 w-4" />,
    consulting: <Users className="h-4 w-4" />,
    licensing: <CreditCard className="h-4 w-4" />,
    grants: <DollarSign className="h-4 w-4" />,
    royalties: <Receipt className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Revenue Streams
        </CardTitle>
        <CardDescription>Breakdown of your income sources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {streams.map((stream) => {
            const percentage = (stream.monthly_average / totalRevenue) * 100;
            return (
              <div key={stream.stream_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sourceIcons[stream.source] || <DollarSign className="h-4 w-4" />}
                    <span className="font-medium capitalize">{stream.source}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">${stream.monthly_average.toLocaleString()}/mo</span>
                    <span className="text-sm text-muted-foreground ml-2">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Growth: {stream.growth_rate > 0 ? "+" : ""}{stream.growth_rate}%</span>
                  <Badge 
                    variant={stream.dependency_risk === "low" ? "secondary" : 
                            stream.dependency_risk === "medium" ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {stream.dependency_risk} risk
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CLIENT VALUE TABLE
// =====================================================
export function ClientValueTable({ clients }: { clients: ClientValue[] }) {
  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No client data available</p>
        </CardContent>
      </Card>
    );
  }

  const healthColors: Record<string, string> = {
    excellent: "bg-green-500",
    good: "bg-yellow-500",
    at_risk: "bg-orange-500",
    churned: "bg-red-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Client Value Analysis
        </CardTitle>
        <CardDescription>Lifetime value and relationship health</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">LTV</TableHead>
              <TableHead className="text-right">Projects</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              <TableHead>Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.client_id}>
                <TableCell className="font-medium">Client #{client.client_id.slice(0, 8)}</TableCell>
                <TableCell className="text-right">${client.lifetime_value.toLocaleString()}</TableCell>
                <TableCell className="text-right">{client.project_count}</TableCell>
                <TableCell className="text-right">{client.payment_reliability.toFixed(0)}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${healthColors[client.relationship_health]}`} />
                    <span className="capitalize text-sm">{client.relationship_health.replace("_", " ")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// =====================================================
// FINANCIAL GOALS TRACKER
// =====================================================
export function FinancialGoalsTracker({ goals }: { goals: FinancialGoal[] }) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No financial goals set</p>
          <Button variant="outline" size="sm" className="mt-3 gap-2">
            <Plus className="h-4 w-4" />
            Set a Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  const typeIcons: Record<string, React.ReactNode> = {
    income: <DollarSign className="h-4 w-4" />,
    savings: <Wallet className="h-4 w-4" />,
    investment: <TrendingUp className="h-4 w-4" />,
    debt_reduction: <TrendingDown className="h-4 w-4" />,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Financial Goals
          </CardTitle>
          <CardDescription>Track your progress towards financial milestones</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const progressPercent = (goal.current_progress / goal.target_amount) * 100;
            return (
              <div key={goal.goal_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      {typeIcons[goal.goal_type] || <Target className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{goal.goal_type.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(goal.deadline), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={goal.on_track ? "default" : "destructive"} className="gap-1">
                    {goal.on_track ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        On Track
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Behind
                      </>
                    )}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>${goal.current_progress.toLocaleString()}</span>
                    <span>${goal.target_amount.toLocaleString()}</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Need ${goal.required_monthly_rate.toLocaleString()}/month</span>
                  <span>
                    Est. completion: {format(new Date(goal.projected_achievement_date), "MMM yyyy")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// WALLET BALANCE CARD
// =====================================================
export function WalletBalanceCard() {
  const { wallet, loading } = useWallet();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-3xl font-bold">${(wallet?.available_balance || 0).toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-warning">
                ${(wallet?.pending_balance || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Escrow</p>
              <p className="text-lg font-semibold text-primary">
                ${(wallet?.escrow_balance || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1 gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Withdraw
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Deposit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// FINANCIAL DASHBOARD
// =====================================================
export function FinancialDashboard() {
  const {
    earningsForecast,
    revenueStreams,
    clientValues,
    financialGoals,
    generateEarningsForecast,
    calculateFinancialHealth
  } = useFinancialIntelligence();

  const [activeTab, setActiveTab] = useState("overview");

  // Generate sample forecast for demo
  const forecast = useMemo(() => {
    return generateEarningsForecast(
      [
        { month: "2024-07", amount: 8500 },
        { month: "2024-08", amount: 9200 },
        { month: "2024-09", amount: 8800 },
        { month: "2024-10", amount: 10500 },
        { month: "2024-11", amount: 11200 },
        { month: "2024-12", amount: 12000 },
      ],
      45000,
      0.35
    );
  }, [generateEarningsForecast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Track your earnings, revenue streams, and financial goals
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialStatCard
          title="Total Revenue (YTD)"
          value="$124,500"
          change={23}
          changeLabel="vs last year"
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          trend="up"
        />
        <FinancialStatCard
          title="Monthly Average"
          value="$10,375"
          change={8}
          changeLabel="vs 6-month avg"
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
          trend="up"
        />
        <FinancialStatCard
          title="Outstanding Invoices"
          value="$8,250"
          change={-15}
          changeLabel="3 invoices pending"
          icon={<Receipt className="h-5 w-5 text-yellow-500" />}
          trend="down"
        />
        <FinancialStatCard
          title="Projected (Next Month)"
          value="$12,800"
          icon={<Calculator className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <EarningsForecastCard forecast={forecast} />
            <RevenueStreamsCard streams={revenueStreams} />
          </div>
          <FinancialGoalsTracker goals={financialGoals} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          <EarningsForecastCard forecast={forecast} />
          <RevenueStreamsCard streams={revenueStreams} />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ClientValueTable clients={clientValues} />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <FinancialGoalsTracker goals={financialGoals} />
        </TabsContent>

        <TabsContent value="wallet" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <WalletBalanceCard />
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No recent transactions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinancialDashboard;
