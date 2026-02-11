import { Navigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useOpportunityIntelligence } from "@/hooks/useOpportunityIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from "recharts";

const priorityColor = {
  high: "text-red-500 bg-red-500/10 border-red-500/20",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
};

export default function OpportunityIntelligencePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, refetch, history, scoreIncreased } = useOpportunityIntelligence();

  if (!authLoading && !user) return <Navigate to="/" replace />;

  const radialData = data
    ? [{ name: "Score", value: data.opportunity_score, fill: "hsl(var(--primary))" }]
    : [];

  return (
    <MainLayout>
      <div className="container py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Opportunity Intelligence Engine
              {scoreIncreased && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                  <TrendingUp className="h-3 w-3" /> Score Up
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered analysis of your market position, skill alignment, and income potential.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
            <Skeleton className="h-64 w-full rounded-xl md:col-span-2" />
            <Skeleton className="h-64 w-full rounded-xl md:col-span-2" />
          </div>
        ) : !data ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No intelligence data yet. Click Refresh to compute.</CardContent></Card>
        ) : (
          <>
            {/* Top KPI Row */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Opportunity Score */}
              <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                  <ResponsiveContainer width={120} height={120}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                      <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <span className="text-3xl font-bold -mt-2">{data.opportunity_score}</span>
                  <span className="text-xs text-muted-foreground">Opportunity Score</span>
                </CardContent>
              </Card>

              {/* Projected Income */}
              <Card>
                <CardContent className="pt-6 text-center space-y-2">
                  <TrendingUp className="h-8 w-8 mx-auto text-emerald-500" />
                  <p className="text-2xl font-bold">PKR {data.projected_income.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Projected Income (90 days)</p>
                </CardContent>
              </Card>

              {/* Skill Gap Index */}
              <Card>
                <CardContent className="pt-6 text-center space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
                  <p className="text-2xl font-bold">{data.skill_gap_index}%</p>
                  <p className="text-xs text-muted-foreground">Skill Gap Index</p>
                  <Progress value={100 - data.skill_gap_index} className="h-1.5" />
                </CardContent>
              </Card>

              {/* Trust Growth Potential */}
              <Card>
                <CardContent className="pt-6 text-center space-y-2">
                  <Sparkles className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-2xl font-bold">+{data.trust_growth_potential}</p>
                  <p className="text-xs text-muted-foreground">Trust Growth Potential</p>
                </CardContent>
              </Card>
            </div>

            {/* Second Row: Skill Gaps + Recommended Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Skill Gaps */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Skill Gaps — Priority List
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.skill_gaps.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No significant skill gaps detected 🎯</p>
                  ) : (
                    data.skill_gaps.map((gap) => (
                      <div key={gap.skill} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] ${priorityColor[gap.priority]}`}>
                            {gap.priority}
                          </Badge>
                          <span className="text-sm font-medium capitalize">{gap.skill}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{gap.potential_projects} projects</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.recommended_actions.map((action, i) => (
                    <Link
                      key={i}
                      to={action.link}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                    >
                      <div className="space-y-0.5 flex-1">
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-muted-foreground">{action.impact}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Third Row: Market Heat Map + Score Trend */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Market Heat Map */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Market Heat Map — Demand vs Your Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.market_heat_map.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No market data available yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.market_heat_map} layout="vertical" margin={{ left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={55} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                          {data.market_heat_map.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.user_has_skill ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex gap-4 mt-2 justify-center text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary" /> Your skills
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" /> Gaps
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Score Trend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Score Trend (Historical)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length < 2 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Refresh a few times to build trend data.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={[...history].reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="snapshot_version" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Snapshot", position: "insideBottom", offset: -2, fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="opportunity_score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
