import { useState } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOpportunities,
  getOpportunityStats,
  updateOpportunityStatus,
  OPPORTUNITY_TYPES,
} from "@/lib/revenue/opportunityIntelligence";
import { getCommercializationPaths, PATH_TYPES } from "@/lib/revenue/commercializationEngine";
import { getSponsorMatches } from "@/lib/revenue/sponsorMatchingEngine";
import {
  TrendingUp, DollarSign, Lightbulb, Users, Rocket, FileText, Handshake,
  Eye, CheckCircle, XCircle, BarChart3, ArrowUpRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142 76% 36%)",
];

const typeIcons: Record<string, React.ReactNode> = {
  funding: <DollarSign className="h-4 w-4" />,
  commercialization: <Rocket className="h-4 w-4" />,
  startup: <Lightbulb className="h-4 w-4" />,
  hiring: <Users className="h-4 w-4" />,
  licensing: <FileText className="h-4 w-4" />,
  partnership: <Handshake className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  detected: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  reviewed: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  actioned: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  dismissed: "bg-muted text-muted-foreground",
  expired: "bg-destructive/10 text-destructive",
};

export default function RevenueIntelligencePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("opportunities");

  const { data: opportunities, isLoading: loadingOpp, refetch: refetchOpp } = useQuery({
    queryKey: ["revenue-opportunities"],
    queryFn: () => getOpportunities(),
    enabled: !!user,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["revenue-opp-stats"],
    queryFn: getOpportunityStats,
    enabled: !!user,
  });

  const { data: paths, isLoading: loadingPaths } = useQuery({
    queryKey: ["commercialization-paths"],
    queryFn: () => getCommercializationPaths(),
    enabled: !!user,
  });

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["sponsor-matches"],
    queryFn: () => getSponsorMatches(),
    enabled: !!user,
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  const pieData = stats?.byType
    ? Object.entries(stats.byType).map(([name, value], i) => ({
        name: OPPORTUNITY_TYPES.find((t) => t.value === name)?.label ?? name,
        value,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [];

  const statusData = stats?.byStatus
    ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  async function handleAction(id: string, status: "reviewed" | "actioned" | "dismissed") {
    try {
      await updateOpportunityStatus(id, status, user?.id);
      toast.success(`Opportunity ${status}`);
      refetchOpp();
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Revenue Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-detected opportunities, commercialization paths, and sponsor matches.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                ${((stats?.totalEstimatedValue ?? 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">Estimated Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{paths?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Commercialization Paths</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{matches?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Sponsor Matches</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opportunities by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="commercialization">Commercialization</TabsTrigger>
            <TabsTrigger value="sponsor-matches">Sponsor Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-3 mt-4">
            {loadingOpp ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !opportunities?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No opportunities detected yet.</CardContent></Card>
            ) : (
              opportunities.map((opp: any) => (
                <Card key={opp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 text-primary">{typeIcons[opp.opportunity_type] ?? <Lightbulb className="h-4 w-4" />}</div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{opp.title}</span>
                          <Badge variant="outline" className={statusColors[opp.status]}>{opp.status}</Badge>
                        </div>
                        {opp.description && <p className="text-xs text-muted-foreground line-clamp-2">{opp.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(opp.confidence_score || 0)}%</span>
                          {opp.estimated_value > 0 && <span>Est. Value: ${opp.estimated_value.toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                    {opp.status === "detected" && (
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleAction(opp.id, "reviewed")}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => handleAction(opp.id, "actioned")}>
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleAction(opp.id, "dismissed")}>
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="commercialization" className="space-y-3 mt-4">
            {loadingPaths ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !paths?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No commercialization paths found.</CardContent></Card>
            ) : (
              paths.map((path: any) => (
                <Card key={path.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{path.title}</span>
                      <Badge variant="outline">{PATH_TYPES.find((t) => t.value === path.path_type)?.label ?? path.path_type}</Badge>
                    </div>
                    {path.description && <p className="text-xs text-muted-foreground mb-2">{path.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Market Potential: {Math.round(path.market_potential_score || 0)}%</span>
                      <span>Readiness: {Math.round(path.readiness_score || 0)}%</span>
                      <Badge variant="secondary" className="text-[10px]">{path.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sponsor-matches" className="space-y-3 mt-4">
            {loadingMatches ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !matches?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No sponsor matches generated.</CardContent></Card>
            ) : (
              matches.map((m: any) => (
                <Card key={m.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                        {m.target_type} Match
                      </span>
                      <Badge variant="outline" className={statusColors[m.status] ?? ""}>{m.status}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Score: {Math.round(m.match_score || 0)}%</span>
                      <span>Domain: {Math.round(m.domain_alignment || 0)}%</span>
                      <span>Funding Fit: {Math.round(m.funding_fit || 0)}%</span>
                      <span>Execution: {Math.round(m.execution_fit || 0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
