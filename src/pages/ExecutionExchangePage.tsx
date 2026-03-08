import { useState } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getContracts, createContract,
  getTalentPools, createTalentPool,
  getOpportunities, postOpportunity,
  getExchangeAnalytics,
  CONTRACT_TYPES, POOL_TYPES, OPPORTUNITY_TYPES,
} from "@/lib/innovation/executionExchange";
import { getTalentProfiles } from "@/lib/innovation/talentDiscovery";
import { getGlobalExecutionTrends } from "@/lib/innovation/executionTalentMatching";
import {
  Globe, Plus, DollarSign, Users, Briefcase, Target,
  FileText, BarChart3, Building2, Clock, Shield,
  UserSearch, TrendingUp, Milestone, BookOpen, Globe2, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie,
} from "recharts";
import { toast } from "sonner";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

const statusBadge: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function ExecutionExchangePage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("contracts");
  const [showCreate, setShowCreate] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [showOpp, setShowOpp] = useState(false);
  const [talentSearch, setTalentSearch] = useState("");

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["exchange-analytics"],
    queryFn: getExchangeAnalytics,
    enabled: !!user,
  });

  const { data: contracts, isLoading: loadingContracts } = useQuery({
    queryKey: ["exchange-contracts"],
    queryFn: () => getContracts(),
    enabled: !!user,
  });

  const { data: pools, isLoading: loadingPools } = useQuery({
    queryKey: ["exchange-pools"],
    queryFn: () => getTalentPools(),
    enabled: !!user,
  });

  const { data: opportunities, isLoading: loadingOpps } = useQuery({
    queryKey: ["exchange-opportunities"],
    queryFn: () => getOpportunities(),
    enabled: !!user,
  });

  const { data: talentProfiles = [], isLoading: loadingTalent } = useQuery({
    queryKey: ["exchange-talent-profiles"],
    queryFn: () => getTalentProfiles(),
    enabled: !!user,
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ["exchange-global-trends"],
    queryFn: getGlobalExecutionTrends,
    enabled: !!user && activeTab === "analytics",
  });

  const createContractMut = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      toast.success("Contract created");
      queryClient.invalidateQueries({ queryKey: ["exchange-contracts"] });
      queryClient.invalidateQueries({ queryKey: ["exchange-analytics"] });
      setShowCreate(false);
    },
    onError: () => toast.error("Failed"),
  });

  const createPoolMut = useMutation({
    mutationFn: createTalentPool,
    onSuccess: () => {
      toast.success("Talent pool created");
      queryClient.invalidateQueries({ queryKey: ["exchange-pools"] });
      setShowPool(false);
    },
    onError: () => toast.error("Failed"),
  });

  const postOppMut = useMutation({
    mutationFn: postOpportunity,
    onSuccess: () => {
      toast.success("Opportunity posted");
      queryClient.invalidateQueries({ queryKey: ["exchange-opportunities"] });
      setShowOpp(false);
    },
    onError: () => toast.error("Failed"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  const filteredTalent = talentSearch
    ? talentProfiles.filter((p: any) =>
        (p.top_skills ?? []).some((s: string) => s.toLowerCase().includes(talentSearch.toLowerCase())) ||
        (p.domains ?? []).some((d: string) => d.toLowerCase().includes(talentSearch.toLowerCase()))
      )
    : talentProfiles;

  const availabilityData = trends
    ? Object.entries(trends.talentAvailability).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Global Execution Exchange
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hire verified talent based on execution history. Browse contracts, talent pools, and opportunities.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loadingAnalytics ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
          ) : (
            <>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalContracts ?? 0}</p><p className="text-xs text-muted-foreground">Contracts ({analytics?.openContracts ?? 0} open)</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500 shrink-0" />
                <div><p className="text-2xl font-bold">${((analytics?.totalBudget ?? 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Budget</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalPools ?? 0}</p><p className="text-xs text-muted-foreground">Talent Pools</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Target className="h-8 w-8 text-amber-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalOpportunities ?? 0}</p><p className="text-xs text-muted-foreground">Opportunities</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <UserSearch className="h-8 w-8 text-violet-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalMembers ?? 0}</p><p className="text-xs text-muted-foreground">Registered Talent</p></div>
              </CardContent></Card>
            </>
          )}
        </div>

        {/* Domain Chart */}
        {analytics?.topDomains && analytics.topDomains.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Contracts by Domain</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.topDomains}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.topDomains.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="contracts">Execution Contracts</TabsTrigger>
            <TabsTrigger value="talent">Talent Registry</TabsTrigger>
            <TabsTrigger value="pools">Talent Pools</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="analytics">Global Analytics</TabsTrigger>
          </TabsList>

          {/* ═══ Contracts ═══ */}
          <TabsContent value="contracts" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Contract</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Execution Contract</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!user) return;
                    const fd = new FormData(e.currentTarget);
                    createContractMut.mutate({
                      title: fd.get("title") as string,
                      description: fd.get("description") as string,
                      organization_name: fd.get("org") as string,
                      contract_type: fd.get("type") as string,
                      domain: fd.get("domain") as string,
                      budget_amount: Number(fd.get("budget") || 0),
                      duration_months: Number(fd.get("duration") || 3),
                      milestone_count: Number(fd.get("milestones") || 1),
                      min_trust_score: Number(fd.get("trust") || 0),
                      created_by: user.id,
                    });
                  }} className="space-y-4">
                    <div><Label>Title</Label><Input name="title" required /></div>
                    <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Organization</Label><Input name="org" /></div>
                      <div>
                        <Label>Type</Label>
                        <Select name="type"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{CONTRACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Budget ($)</Label><Input name="budget" type="number" min={0} /></div>
                      <div><Label>Duration (mo)</Label><Input name="duration" type="number" min={1} defaultValue={3} /></div>
                      <div><Label>Milestones</Label><Input name="milestones" type="number" min={1} defaultValue={1} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Domain</Label><Input name="domain" placeholder="e.g. AI, Biotech" /></div>
                      <div><Label>Min Trust Score</Label><Input name="trust" type="number" min={0} max={100} defaultValue={0} /></div>
                    </div>
                    <Button type="submit" disabled={createContractMut.isPending}>Create</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loadingContracts ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
            ) : !contracts?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No contracts yet.</CardContent></Card>
            ) : (
              contracts.map((c: any) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="font-medium">{c.title}</span>
                          <Badge variant="outline" className={statusBadge[c.status] ?? ""}>{c.status}</Badge>
                          <Badge variant="secondary">{c.contract_type}</Badge>
                        </div>
                        {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                        <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                          {c.organization_name && <span>{c.organization_name}</span>}
                          {c.domain && <span>Domain: {c.domain}</span>}
                          <span>${(c.budget_amount || 0).toLocaleString()}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration_months}mo</span>
                          <span>{c.milestone_count} milestones</span>
                          {c.min_trust_score > 0 && <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Min Trust: {c.min_trust_score}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ═══ Talent Registry ═══ */}
          <TabsContent value="talent" className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by skill or domain…"
                  className="pl-9"
                  value={talentSearch}
                  onChange={e => setTalentSearch(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">{filteredTalent.length} professionals</p>
            </div>
            {loadingTalent ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
              </div>
            ) : !filteredTalent.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No talent profiles found.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTalent.map((p: any) => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">User {p.user_id?.slice(0, 8)}…</span>
                        <Badge variant={p.availability === "open" ? "default" : "secondary"}>{p.availability}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Discovery Score</span>
                          <span className="font-medium">{Number(p.discovery_score).toFixed(0)}</span>
                        </div>
                        <Progress value={Number(p.discovery_score)} className="h-1.5" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Milestone className="h-3 w-3" />{p.completed_milestones} milestones</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{p.knowledge_contributions} contributions</span>
                        <span>{p.peer_endorsements} endorsements</span>
                        <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" />{p.cross_border_collaborations} cross-border</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {(p.top_skills || []).slice(0, 4).map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {(p.domains || []).map((d: string) => <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ Talent Pools ═══ */}
          <TabsContent value="pools" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Dialog open={showPool} onOpenChange={setShowPool}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Pool</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Talent Pool</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    createPoolMut.mutate({
                      pool_name: fd.get("name") as string,
                      description: fd.get("description") as string,
                      pool_type: fd.get("type") as string,
                      domain: fd.get("domain") as string,
                    });
                  }} className="space-y-4">
                    <div><Label>Pool Name</Label><Input name="name" required /></div>
                    <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select name="type"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{POOL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Domain</Label><Input name="domain" placeholder="e.g. AI, Climate" /></div>
                    </div>
                    <Button type="submit" disabled={createPoolMut.isPending}>Create</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loadingPools ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !pools?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No talent pools created.</CardContent></Card>
            ) : (
              pools.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {p.pool_name}
                      </span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline">{p.pool_type}</Badge>
                        {p.domain && <Badge variant="secondary">{p.domain}</Badge>}
                      </div>
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground mb-2">{p.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{p.member_count} members</span>
                      <span>Avg Trust: {Math.round(p.avg_trust_score || 0)}</span>
                      <Badge variant={p.is_public ? "default" : "secondary"} className="text-[10px]">{p.is_public ? "Public" : "Private"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ═══ Opportunities ═══ */}
          <TabsContent value="opportunities" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Dialog open={showOpp} onOpenChange={setShowOpp}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Post Opportunity</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Post Professional Opportunity</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!user) return;
                    const fd = new FormData(e.currentTarget);
                    postOppMut.mutate({
                      opportunity_type: fd.get("type") as string,
                      title: fd.get("title") as string,
                      description: fd.get("description") as string,
                      organization_name: fd.get("org") as string,
                      domain: fd.get("domain") as string,
                      budget_range_min: Number(fd.get("min") || 0),
                      budget_range_max: Number(fd.get("max") || 0),
                      location: fd.get("location") as string || "Remote",
                      posted_by: user.id,
                    });
                  }} className="space-y-4">
                    <div><Label>Title</Label><Input name="title" required /></div>
                    <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select name="type"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{OPPORTUNITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Organization</Label><Input name="org" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Domain</Label><Input name="domain" /></div>
                      <div><Label>Budget Min ($)</Label><Input name="min" type="number" min={0} /></div>
                      <div><Label>Budget Max ($)</Label><Input name="max" type="number" min={0} /></div>
                    </div>
                    <div><Label>Location</Label><Input name="location" defaultValue="Remote" /></div>
                    <Button type="submit" disabled={postOppMut.isPending}>Post</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loadingOpps ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !opportunities?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No opportunities posted.</CardContent></Card>
            ) : (
              opportunities.map((o: any) => (
                <Card key={o.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {o.title}
                      </span>
                      <Badge variant="outline">{o.opportunity_type}</Badge>
                    </div>
                    {o.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{o.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      {o.organization_name && <span>{o.organization_name}</span>}
                      {o.domain && <span>Domain: {o.domain}</span>}
                      {(o.budget_range_max > 0) && <span>${o.budget_range_min?.toLocaleString()} - ${o.budget_range_max?.toLocaleString()}</span>}
                      <span>{o.location}</span>
                      {o.min_trust_score > 0 && <span>Min Trust: {o.min_trust_score}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ═══ Global Analytics ═══ */}
          <TabsContent value="analytics" className="mt-4 space-y-4">
            {loadingTrends ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-lg" />)}
              </div>
            ) : !trends ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No analytics data available.</CardContent></Card>
            ) : (
              <>
                {/* Summary KPIs */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card><CardContent className="pt-5 flex items-center gap-3">
                    <Activity className="h-7 w-7 text-primary shrink-0" />
                    <div><p className="text-xl font-bold">{trends.totalTalent}</p><p className="text-xs text-muted-foreground">Registered Professionals</p></div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-5 flex items-center gap-3">
                    <Briefcase className="h-7 w-7 text-emerald-500 shrink-0" />
                    <div><p className="text-xl font-bold">{trends.openContracts}/{trends.totalContracts}</p><p className="text-xs text-muted-foreground">Open / Total Contracts</p></div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-5 flex items-center gap-3">
                    <DollarSign className="h-7 w-7 text-amber-500 shrink-0" />
                    <div><p className="text-xl font-bold">${(trends.totalBudget / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Capital Deployed</p></div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-5 flex items-center gap-3">
                    <TrendingUp className="h-7 w-7 text-violet-500 shrink-0" />
                    <div><p className="text-xl font-bold">{trends.totalOpportunities}</p><p className="text-xs text-muted-foreground">Active Opportunities</p></div>
                  </CardContent></Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Domain Demand */}
                  {trends.domainDemand.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Demand by Domain</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={trends.domainDemand} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis type="category" dataKey="domain" width={90} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                            <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                              {trends.domainDemand.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Talent Availability */}
                  {availabilityData.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Talent Availability</CardTitle></CardHeader>
                      <CardContent className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={availabilityData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={3}
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {availabilityData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Institutions */}
                  {trends.topInstitutions.length > 0 && (
                    <Card className="md:col-span-2">
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Top Institutions by Talent Pool Size</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={trends.topInstitutions}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="institution" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                            <Bar dataKey="members" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
