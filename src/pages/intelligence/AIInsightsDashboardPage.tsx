import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Zap, Eye, BarChart3, Lightbulb, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  getInsights, getAgentRuns, markInsightRead, dismissInsight, runAgent,
  getAIANAnalytics, AGENT_TYPES,
} from "@/lib/intelligence/agentNetwork";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-orange-500/10 text-orange-700",
  medium: "bg-amber-500/10 text-amber-700",
  low: "bg-muted text-muted-foreground",
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#06b6d4"];

export default function AIInsightsDashboardPage() {
  const qc = useQueryClient();
  const [agentFilter, setAgentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["aian-insights", agentFilter, priorityFilter],
    queryFn: () => getInsights({
      ...(agentFilter && agentFilter !== "all" ? { agentType: agentFilter } : {}),
      ...(priorityFilter && priorityFilter !== "all" ? { priority: priorityFilter } : {}),
    }),
  });

  const { data: runs = [] } = useQuery({
    queryKey: ["aian-runs"],
    queryFn: () => getAgentRuns(),
  });

  const { data: analytics } = useQuery({
    queryKey: ["aian-analytics"],
    queryFn: getAIANAnalytics,
  });

  const triggerAgent = async (agentType: string) => {
    setRunningAgent(agentType);
    try {
      const result = await runAgent(agentType, {});
      toast.success(`${agentType} generated ${result.insights?.length || 0} insights`);
      qc.invalidateQueries({ queryKey: ["aian-insights"] });
      qc.invalidateQueries({ queryKey: ["aian-runs"] });
      qc.invalidateQueries({ queryKey: ["aian-analytics"] });
    } catch (e: any) {
      toast.error(e.message || "Agent run failed");
    } finally {
      setRunningAgent(null);
    }
  };

  const readMut = useMutation({
    mutationFn: markInsightRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aian-insights"] }),
  });

  const dismissMut = useMutation({
    mutationFn: dismissInsight,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aian-insights"] }); toast.success("Dismissed"); },
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" /> AI Agent Network
        </h1>
        <p className="text-muted-foreground mt-1">Autonomous intelligence layer — advisory insights & recommendations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalRuns ?? 0}</p>
          <p className="text-sm text-muted-foreground">Agent Runs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{analytics?.totalInsights ?? 0}</p>
          <p className="text-sm text-muted-foreground">Insights</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.unreadInsights ?? 0}</p>
          <p className="text-sm text-muted-foreground">Unread</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.avgConfidence ?? 0}%</p>
          <p className="text-sm text-muted-foreground">Avg Confidence</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalEvents ?? 0}</p>
          <p className="text-sm text-muted-foreground">Events Tracked</p>
        </CardContent></Card>
      </div>

      {/* Agent Triggers */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Run AI Agents</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AGENT_TYPES.map((a) => (
              <Button key={a.value} variant="outline" size="sm" disabled={runningAgent === a.value}
                onClick={() => triggerAgent(a.value)}>
                <span className="mr-1">{a.icon}</span>
                {runningAgent === a.value ? "Running..." : a.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights">
        <TabsList>
          <TabsTrigger value="insights"><Lightbulb className="h-4 w-4 mr-1" /> Insights</TabsTrigger>
          <TabsTrigger value="runs"><Clock className="h-4 w-4 mr-1" /> Runs</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex gap-2">
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All agents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {AGENT_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {["critical", "high", "medium", "low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? <p className="text-muted-foreground">Loading...</p> : insights.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No insights yet. Run an agent above to generate intelligence.</CardContent></Card>
          ) : insights.filter((i: any) => !i.is_dismissed).map((insight: any) => (
            <Card key={insight.id} className={insight.is_read ? "opacity-70" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{insight.title}</h3>
                      <Badge className={PRIORITY_COLORS[insight.priority] || ""}>{insight.priority}</Badge>
                      <Badge variant="outline">{insight.insight_type}</Badge>
                      <Badge variant="secondary">{insight.confidence_score}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.summary}</p>
                    {insight.action_suggested && (
                      <p className="text-sm text-primary flex items-center gap-1"><Zap className="h-3 w-3" /> {insight.action_suggested}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Agent: {insight.agent_type}</p>
                  </div>
                  <div className="flex gap-1">
                    {!insight.is_read && (
                      <Button size="sm" variant="ghost" onClick={() => readMut.mutate(insight.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => dismissMut.mutate(insight.id)}>✕</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          {runs.map((run: any) => (
            <Card key={run.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{run.agent_type}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(run.started_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{run.insights_generated} insights</Badge>
                  <Badge variant={run.status === "completed" ? "default" : "outline"}>
                    {run.status === "completed" ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    {run.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Runs by Agent</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.byAgent || []}>
                    <XAxis dataKey="agent" tick={{ fontSize: 10 }} angle={-20} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Insights by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics?.byType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                      {(analytics?.byType || []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
