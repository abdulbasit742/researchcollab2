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
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getResearchFunds, createResearchFund,
  getResearchAssets, createResearchAsset,
  getResearchBonds, createResearchBond,
  getMarketAnalytics,
  FUND_TYPES, ASSET_TYPES,
} from "@/lib/innovation/researchCapitalMarket";
import {
  Landmark, DollarSign, TrendingUp, Building2, Plus,
  FileText, Shield, BarChart3, Layers,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { toast } from "sonner";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

export default function ResearchCapitalMarketPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateFund, setShowCreateFund] = useState(false);
  const [showCreateAsset, setShowCreateAsset] = useState(false);
  const [showCreateBond, setShowCreateBond] = useState(false);

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["rcm-analytics"],
    queryFn: getMarketAnalytics,
    enabled: !!user,
  });

  const { data: funds, isLoading: loadingFunds } = useQuery({
    queryKey: ["rcm-funds"],
    queryFn: () => getResearchFunds(),
    enabled: !!user,
  });

  const { data: assets, isLoading: loadingAssets } = useQuery({
    queryKey: ["rcm-assets"],
    queryFn: () => getResearchAssets(),
    enabled: !!user,
  });

  const { data: bonds, isLoading: loadingBonds } = useQuery({
    queryKey: ["rcm-bonds"],
    queryFn: () => getResearchBonds(),
    enabled: !!user,
  });

  const createFundMutation = useMutation({
    mutationFn: createResearchFund,
    onSuccess: () => {
      toast.success("Fund created");
      queryClient.invalidateQueries({ queryKey: ["rcm-funds"] });
      queryClient.invalidateQueries({ queryKey: ["rcm-analytics"] });
      setShowCreateFund(false);
    },
    onError: () => toast.error("Failed to create fund"),
  });

  const createAssetMutation = useMutation({
    mutationFn: createResearchAsset,
    onSuccess: () => {
      toast.success("Research asset registered");
      queryClient.invalidateQueries({ queryKey: ["rcm-assets"] });
      setShowCreateAsset(false);
    },
    onError: () => toast.error("Failed to register asset"),
  });

  const createBondMutation = useMutation({
    mutationFn: createResearchBond,
    onSuccess: () => {
      toast.success("Research bond issued");
      queryClient.invalidateQueries({ queryKey: ["rcm-bonds"] });
      setShowCreateBond(false);
    },
    onError: () => toast.error("Failed to issue bond"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              Global Research Capital Market
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Structured funding pools, research assets, and bonds • 2% management + 1% success fee
            </p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingAnalytics ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
          ) : (
            <>
              <Card>
                <CardContent className="pt-5 flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">${((analytics?.totalCapital ?? 0) / 1e6).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Total Capital</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{analytics?.allocationRate ?? 0}%</p>
                    <p className="text-xs text-muted-foreground">Allocation Rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 flex items-center gap-3">
                  <Layers className="h-8 w-8 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">{analytics?.totalAssets ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Research Assets</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold">${((analytics?.totalBondPrincipal ?? 0) / 1e6).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Bond Principal</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Domain Chart */}
        {analytics?.topDomains && analytics.topDomains.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Capital by Research Domain</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.topDomains}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="capital" radius={[4, 4, 0, 0]}>
                    {analytics.topDomains.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Funding Pools</TabsTrigger>
            <TabsTrigger value="assets">Research Assets</TabsTrigger>
            <TabsTrigger value="bonds">Research Bonds</TabsTrigger>
          </TabsList>

          {/* ── Funding Pools ── */}
          <TabsContent value="overview" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Dialog open={showCreateFund} onOpenChange={setShowCreateFund}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Fund</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Research Fund</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!user) return;
                    const fd = new FormData(e.currentTarget);
                    createFundMutation.mutate({
                      fund_name: fd.get("name") as string,
                      description: fd.get("description") as string,
                      fund_type: fd.get("type") as string,
                      total_size: Number(fd.get("size") || 0),
                      domain: fd.get("domain") as string,
                      management_fee_pct: 2,
                      success_fee_pct: 1,
                      created_by: user.id,
                    });
                  }} className="space-y-4">
                    <div><Label>Fund Name</Label><Input name="name" required /></div>
                    <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select name="type" required>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {FUND_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Total Size ($)</Label><Input name="size" type="number" min={1000} required /></div>
                    </div>
                    <div><Label>Research Domain</Label><Input name="domain" placeholder="e.g. AI, Climate, Biotech" /></div>
                    <Button type="submit" disabled={createFundMutation.isPending}>Create Fund</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loadingFunds ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
            ) : !funds?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No research funds created yet.</CardContent></Card>
            ) : (
              funds.map((f: any) => {
                const pct = f.total_size > 0 ? ((f.allocated_amount || 0) / f.total_size) * 100 : 0;
                return (
                  <Card key={f.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{f.fund_name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{f.description || "No description"}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <Badge>{f.fund_type?.replace(/_/g, " ")}</Badge>
                          {f.domain && <Badge variant="secondary">{f.domain}</Badge>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Allocated: ${(f.allocated_amount || 0).toLocaleString()}</span>
                          <span>Total: ${(f.total_size || 0).toLocaleString()}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{f.participating_institutions || 0} institutions</span>
                        <span>{f.active_projects || 0} active projects</span>
                        <span>Mgmt: {f.management_fee_pct}% • Success: {f.success_fee_pct}%</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* ── Research Assets ── */}
          <TabsContent value="assets" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Dialog open={showCreateAsset} onOpenChange={setShowCreateAsset}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Register Asset</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Register Research Asset</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!user) return;
                    const fd = new FormData(e.currentTarget);
                    createAssetMutation.mutate({
                      creator_id: user.id,
                      title: fd.get("title") as string,
                      description: fd.get("description") as string,
                      asset_type: fd.get("type") as string,
                      ip_status: fd.get("ip") as string,
                      valuation_score: Number(fd.get("valuation") || 0),
                    });
                  }} className="space-y-4">
                    <div><Label>Title</Label><Input name="title" required /></div>
                    <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select name="type" required>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>IP Status</Label>
                        <Select name="ip">
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {["open", "pending_patent", "patented", "licensed", "restricted"].map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Valuation Score (0-100)</Label><Input name="valuation" type="number" min={0} max={100} /></div>
                    <Button type="submit" disabled={createAssetMutation.isPending}>Register</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loadingAssets ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !assets?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No research assets registered.</CardContent></Card>
            ) : (
              assets.map((a: any) => (
                <Card key={a.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {a.title}
                      </span>
                      <div className="flex gap-1.5">
                        <Badge variant="outline">{a.asset_type}</Badge>
                        <Badge variant="secondary">{a.validation_status}</Badge>
                      </div>
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground mb-2">{a.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {a.ip_status && <span>IP: {a.ip_status.replace(/_/g, " ")}</span>}
                      {a.valuation_score != null && <span>Valuation: {a.valuation_score}/100</span>}
                      <span>Validations: {a.validation_count || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── Research Bonds ── */}
          <TabsContent value="bonds" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Dialog open={showCreateBond} onOpenChange={setShowCreateBond}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Issue Bond</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Issue Research Bond</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    createBondMutation.mutate({
                      bond_name: fd.get("name") as string,
                      issuing_institution: fd.get("institution") as string,
                      total_principal: Number(fd.get("principal") || 0),
                      coupon_rate: Number(fd.get("coupon") || 0),
                      maturity_date: fd.get("maturity") as string,
                    });
                  }} className="space-y-4">
                    <div><Label>Bond Name</Label><Input name="name" required /></div>
                    <div><Label>Issuing Institution ID</Label><Input name="institution" required /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Principal ($)</Label><Input name="principal" type="number" min={1000} required /></div>
                      <div><Label>Coupon Rate (%)</Label><Input name="coupon" type="number" step={0.1} min={0} /></div>
                      <div><Label>Maturity Date</Label><Input name="maturity" type="date" required /></div>
                    </div>
                    <Button type="submit" disabled={createBondMutation.isPending}>Issue Bond</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loadingBonds ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !bonds?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No research bonds issued.</CardContent></Card>
            ) : (
              bonds.map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        {b.bond_name}
                      </span>
                      <Badge variant={b.status === "active" ? "default" : "secondary"}>{b.status}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Principal: ${(b.total_principal || 0).toLocaleString()}</span>
                      <span>Coupon: {b.coupon_rate}%</span>
                      <span>Risk: {Math.round(b.risk_score || 0)}/100</span>
                      <span>Escrow Locked: ${(b.escrow_locked_amount || 0).toLocaleString()}</span>
                      <span>Maturity: {new Date(b.maturity_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {b.compliance_approved && <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 text-[10px]">Compliance ✓</Badge>}
                      {b.governance_approved && <Badge variant="outline" className="text-blue-600 border-blue-500/20 text-[10px]">Governance ✓</Badge>}
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
