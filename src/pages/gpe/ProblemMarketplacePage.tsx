import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Globe, Plus, Search, Bookmark, Brain, Zap, DollarSign, Users, TrendingUp, Filter, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProblems, createProblem, saveProblem, runAITriage, runAIMatching,
  GPE_CATEGORIES, getProblemAnalytics
} from "@/lib/gpe/problemRegistryService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const URGENCY_LEVELS = ["low", "normal", "high", "critical"];
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function ProblemMarketplacePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    problem_title: "", problem_summary: "", full_problem_brief: "", category: "",
    urgency_level: "normal", difficulty_level: "medium", geographic_scope: "global",
    budget_range_min: 0, budget_range_max: 0, timeline_expectation: "",
    affected_population: "", funding_model: "milestone_based",
    domain_tags: "" as string, required_capabilities: "" as string,
  });

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["gpe-problems", catFilter, statusFilter, urgencyFilter, search],
    queryFn: () => getProblems({ category: catFilter || undefined, status: statusFilter || undefined, urgency: urgencyFilter || undefined, search: search || undefined }),
  });

  const { data: analytics } = useQuery({
    queryKey: ["gpe-analytics"],
    queryFn: getProblemAnalytics,
  });

  const createMut = useMutation({
    mutationFn: () => createProblem({
      ...form,
      domain_tags: form.domain_tags.split(",").map(t => t.trim()).filter(Boolean),
      required_capabilities: form.required_capabilities.split(",").map(t => t.trim()).filter(Boolean),
      created_by: user?.id,
      status: "submitted",
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gpe-problems"] }); toast.success("Problem submitted"); setDialogOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const triageMut = useMutation({
    mutationFn: (id: string) => runAITriage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gpe-problems"] }); toast.success("AI Triage complete"); },
    onError: (e: any) => toast.error(e.message),
  });

  const matchMut = useMutation({
    mutationFn: (id: string) => runAIMatching(id),
    onSuccess: () => toast.success("AI Matching complete"),
    onError: (e: any) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: (problemId: string) => saveProblem(user?.id || "", problemId),
    onSuccess: () => toast.success("Saved"),
    onError: () => toast.error("Already saved"),
  });

  const urgencyColor = (u: string) => u === "critical" ? "destructive" : u === "high" ? "secondary" : "outline";
  const statusColor = (s: string) => s === "execution_active" ? "default" : s === "funding_open" ? "secondary" : "outline";

  const categoryData = analytics?.byCategory ? Object.entries(analytics.byCategory).map(([name, value]) => ({ name, value })) : [];
  const statusData = analytics?.byStatus ? Object.entries(analytics.byStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Global Problem Marketplace</h1>
            <p className="text-sm text-muted-foreground">Real problems. Real funding. Real execution.</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Post Problem</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Submit a Problem Statement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Problem Title *" value={form.problem_title} onChange={e => setForm(f => ({ ...f, problem_title: e.target.value }))} />
              <Textarea placeholder="Problem Summary *" value={form.problem_summary} onChange={e => setForm(f => ({ ...f, problem_summary: e.target.value }))} />
              <Textarea placeholder="Full Problem Brief" rows={4} value={form.full_problem_brief} onChange={e => setForm(f => ({ ...f, full_problem_brief: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category *" /></SelectTrigger>
                  <SelectContent>{GPE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.urgency_level} onValueChange={v => setForm(f => ({ ...f, urgency_level: v }))}>
                  <SelectTrigger><SelectValue placeholder="Urgency" /></SelectTrigger>
                  <SelectContent>{URGENCY_LEVELS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Min Budget" value={form.budget_range_min || ""} onChange={e => setForm(f => ({ ...f, budget_range_min: Number(e.target.value) }))} />
                <Input type="number" placeholder="Max Budget" value={form.budget_range_max || ""} onChange={e => setForm(f => ({ ...f, budget_range_max: Number(e.target.value) }))} />
              </div>
              <Input placeholder="Domain Tags (comma-separated)" value={form.domain_tags} onChange={e => setForm(f => ({ ...f, domain_tags: e.target.value }))} />
              <Input placeholder="Required Capabilities (comma-separated)" value={form.required_capabilities} onChange={e => setForm(f => ({ ...f, required_capabilities: e.target.value }))} />
              <Input placeholder="Timeline Expectation" value={form.timeline_expectation} onChange={e => setForm(f => ({ ...f, timeline_expectation: e.target.value }))} />
              <Input placeholder="Affected Population" value={form.affected_population} onChange={e => setForm(f => ({ ...f, affected_population: e.target.value }))} />
              <Button className="w-full" onClick={() => createMut.mutate()} disabled={!form.problem_title || !form.category || createMut.isPending}>
                {createMut.isPending ? "Submitting…" : "Submit Problem"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Active Problems", value: analytics?.totalProblems || 0, icon: Globe },
          { label: "Proposals", value: analytics?.totalProposals || 0, icon: Users },
          { label: "Funding Pools", value: analytics?.totalFundingPools || 0, icon: DollarSign },
          { label: "Capital Committed", value: `$${((analytics?.totalCapitalCommitted || 0) / 1000).toFixed(0)}K`, icon: TrendingUp },
          { label: "Platform Revenue", value: `$${((analytics?.totalRevenue || 0) / 1000).toFixed(0)}K`, icon: Zap },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-lg font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Problems</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search problems…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {GPE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {["published", "funding_open", "proposal_review", "execution_active", "completed"].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {URGENCY_LEVELS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Problem Cards */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading problems…</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No problems found. Be the first to post one!</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((p: any) => (
                <Card key={p.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base leading-tight line-clamp-2">{p.problem_title}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => saveMut.mutate(p.id)}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline">{p.category}</Badge>
                      <Badge variant={urgencyColor(p.urgency_level)}>{p.urgency_level}</Badge>
                      <Badge variant={statusColor(p.status)}>{p.status?.replace(/_/g, " ")}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">{p.problem_summary || "No summary provided"}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {p.budget_range_max > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          ${(p.budget_range_min / 1000).toFixed(0)}K - ${(p.budget_range_max / 1000).toFixed(0)}K
                        </div>
                      )}
                      {p.geographic_scope && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />{p.geographic_scope}
                        </div>
                      )}
                      {p.timeline_expectation && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />{p.timeline_expectation}
                        </div>
                      )}
                      {p.total_proposals > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />{p.total_proposals} proposals
                        </div>
                      )}
                    </div>

                    {/* AI Scores */}
                    {p.ai_clarity_score && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">AI Clarity</span>
                          <span className="font-medium">{p.ai_clarity_score}%</span>
                        </div>
                        <Progress value={p.ai_clarity_score} className="h-1" />
                      </div>
                    )}

                    {(p.domain_tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.domain_tags.slice(0, 3).map((t: string) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => triageMut.mutate(p.id)} disabled={triageMut.isPending}>
                        <Brain className="h-3 w-3 mr-1" />Triage
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => matchMut.mutate(p.id)} disabled={matchMut.isPending}>
                        <Zap className="h-3 w-3 mr-1" />Match
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Problems by Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Problems by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
