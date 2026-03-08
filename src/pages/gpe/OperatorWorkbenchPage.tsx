import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, AlertTriangle, CheckCircle, Clock, Users, Brain, TrendingUp, Globe, DollarSign, Inbox } from "lucide-react";
import { toast } from "sonner";
import {
  getOperatorTasks, updateOperatorTask, getProblems, getProposals,
  getLeads, getCommercializationSignals, getProblemAnalytics
} from "@/lib/gpe/problemRegistryService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function OperatorWorkbenchPage() {
  const qc = useQueryClient();
  const [taskStatus, setTaskStatus] = useState("open");

  const { data: tasks = [] } = useQuery({
    queryKey: ["gpe-operator-tasks", taskStatus],
    queryFn: () => getOperatorTasks(taskStatus || undefined),
  });

  const { data: pendingProblems = [] } = useQuery({
    queryKey: ["gpe-pending-problems"],
    queryFn: () => getProblems({ status: "submitted" }),
  });

  const { data: pendingProposals = [] } = useQuery({
    queryKey: ["gpe-pending-proposals"],
    queryFn: () => getProposals(undefined, "submitted"),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["gpe-leads"],
    queryFn: () => getLeads("new"),
  });

  const { data: signals = [] } = useQuery({
    queryKey: ["gpe-signals"],
    queryFn: () => getCommercializationSignals(),
  });

  const { data: analytics } = useQuery({
    queryKey: ["gpe-analytics"],
    queryFn: getProblemAnalytics,
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => updateOperatorTask(id, { status: "completed", completed_at: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gpe-operator-tasks"] }); toast.success("Task completed"); },
  });

  const priorityColor = (p: string) => p === "critical" ? "destructive" : p === "high" ? "secondary" : "outline";

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Operator Workbench</h1>
          <p className="text-sm text-muted-foreground">Manage the Global Problem → Execution ecosystem</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Open Tasks", value: tasks.length, icon: Inbox, color: "text-blue-600" },
          { label: "Pending Problems", value: pendingProblems.length, icon: Globe, color: "text-orange-600" },
          { label: "Pending Proposals", value: pendingProposals.length, icon: Users, color: "text-purple-600" },
          { label: "New Leads", value: leads.length, icon: TrendingUp, color: "text-green-600" },
          { label: "Signals", value: signals.length, icon: Brain, color: "text-pink-600" },
          { label: "Total Problems", value: analytics?.totalProblems || 0, icon: DollarSign, color: "text-primary" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <div>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="triage">Problem Triage</TabsTrigger>
          <TabsTrigger value="proposals">Proposal Moderation</TabsTrigger>
          <TabsTrigger value="leads">Lead Pipeline</TabsTrigger>
          <TabsTrigger value="signals">Commercialization</TabsTrigger>
          <TabsTrigger value="health">Marketplace Health</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex gap-3">
            <Select value={taskStatus} onValueChange={setTaskStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["open", "in_progress", "completed"].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {tasks.map((t: any) => (
              <Card key={t.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{t.title}</p>
                      <Badge variant={priorityColor(t.priority)} className="text-[10px]">{t.priority}</Badge>
                      <Badge variant="outline" className="text-[10px]">{t.task_type}</Badge>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                    {t.ai_summary && <p className="text-xs text-blue-600 mt-1">AI: {t.ai_summary}</p>}
                  </div>
                  {t.status !== "completed" && (
                    <Button size="sm" variant="outline" onClick={() => completeMut.mutate(t.id)}>
                      <CheckCircle className="h-3 w-3 mr-1" />Done
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks in this status.</p>}
          </div>
        </TabsContent>

        <TabsContent value="triage" className="space-y-4">
          <h3 className="font-semibold text-sm">Problems Awaiting Review</h3>
          {pendingProblems.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{p.problem_title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{p.problem_summary?.slice(0, 150)}</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="outline">{p.category}</Badge>
                      <Badge variant="secondary">{p.urgency_level}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Revise</Button>
                    <Button size="sm"><CheckCircle className="h-3 w-3 mr-1" />Publish</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingProblems.length === 0 && <p className="text-center text-muted-foreground py-8">No problems pending review.</p>}
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <h3 className="font-semibold text-sm">Proposals Awaiting Moderation</h3>
          {pendingProposals.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.capability_summary || "Untitled Proposal"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Budget: ${(p.budget_request / 1000).toFixed(0)}K | Timeline: {p.timeline}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Request Revision</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingProposals.length === 0 && <p className="text-center text-muted-foreground py-8">No proposals pending.</p>}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <h3 className="font-semibold text-sm">Incoming Sponsor Leads</h3>
          {leads.map((l: any) => (
            <Card key={l.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{l.contact_name || l.organization || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{l.contact_email} · {l.channel} · {l.lead_type}</p>
                    {l.raw_inquiry && <p className="text-sm mt-1">{l.raw_inquiry.slice(0, 200)}</p>}
                  </div>
                  {l.funding_intent_score && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Intent</p>
                      <p className="text-lg font-bold text-primary">{l.funding_intent_score}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {leads.length === 0 && <p className="text-center text-muted-foreground py-8">No new leads.</p>}
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <h3 className="font-semibold text-sm">Commercialization Signals</h3>
          {signals.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary">{s.signal_type}</Badge>
                    <p className="text-sm mt-1">Strength: {s.signal_strength}% | Market Pull: {s.market_pull_score || 0}% | Startup: {s.startup_potential_score || 0}%</p>
                    {(s.recommendations || []).length > 0 && (
                      <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                        {s.recommendations.slice(0, 3).map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {signals.length === 0 && <p className="text-center text-muted-foreground py-8">No commercialization signals detected yet.</p>}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Problem Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.byCategory ? Object.entries(analytics.byCategory).map(([name, value]) => ({ name: name.slice(0, 12), value })) : []}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Key Metrics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Proposals/Problem</span>
                  <span className="font-bold">{(analytics?.avgProposalsPerProblem || 0).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Capital Committed</span>
                  <span className="font-bold">${((analytics?.totalCapitalCommitted || 0) / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform Revenue</span>
                  <span className="font-bold">${((analytics?.totalRevenue || 0) / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Funding Pools</span>
                  <span className="font-bold">{analytics?.totalFundingPools || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
