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
import { Building2, Plus, DollarSign, TrendingUp, Users, BarChart3, Eye, CheckCircle, AlertTriangle, Layers } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProblems, getProposals, getFundingPools, createFundingPool,
  getSponsorAccount, createSponsorAccount, getRevenueEvents,
} from "@/lib/gpe/problemRegistryService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function SponsorCommandCenterPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [poolDialog, setPoolDialog] = useState(false);
  const [poolForm, setPoolForm] = useState({
    title: "", description: "", pool_type: "single_problem",
    total_committed_capital: 0, funding_window_end: "",
  });

  const { data: account } = useQuery({
    queryKey: ["gpe-sponsor-account", user?.id],
    queryFn: () => getSponsorAccount(user?.id || ""),
    enabled: !!user,
  });

  const { data: myProblems = [] } = useQuery({
    queryKey: ["gpe-sponsor-problems", user?.id],
    queryFn: () => getProblems({ limit: 50 }),
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ["gpe-sponsor-proposals"],
    queryFn: () => getProposals(),
  });

  const { data: pools = [] } = useQuery({
    queryKey: ["gpe-sponsor-pools", user?.id],
    queryFn: () => getFundingPools(user?.id),
    enabled: !!user,
  });

  const { data: revenue = [] } = useQuery({
    queryKey: ["gpe-revenue"],
    queryFn: () => getRevenueEvents(50),
  });

  const createAccountMut = useMutation({
    mutationFn: () => createSponsorAccount({
      user_id: user?.id,
      organization_name: "My Organization",
      sponsor_type: "company",
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gpe-sponsor-account"] }); toast.success("Sponsor account created"); },
  });

  const createPoolMut = useMutation({
    mutationFn: () => createFundingPool({
      ...poolForm,
      sponsor_user_id: user?.id,
      available_capital: poolForm.total_committed_capital,
      funding_window_end: poolForm.funding_window_end || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gpe-sponsor-pools"] });
      toast.success("Funding pool created");
      setPoolDialog(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalCapital = pools.reduce((s: number, p: any) => s + (p.total_committed_capital || 0), 0);
  const availableCapital = pools.reduce((s: number, p: any) => s + (p.available_capital || 0), 0);
  const deploymentRate = totalCapital > 0 ? ((totalCapital - availableCapital) / totalCapital) * 100 : 0;

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Building2 className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Sponsor Command Center</h2>
            <p className="text-muted-foreground">Set up your sponsor account to post challenges, deploy capital, and track research execution.</p>
            <Button onClick={() => createAccountMut.mutate()} disabled={createAccountMut.isPending}>
              {createAccountMut.isPending ? "Creating…" : "Activate Sponsor Account"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Sponsor Command Center</h1>
          <p className="text-sm text-muted-foreground">{account.organization_name} — {account.sponsor_type}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Capital", value: `$${(totalCapital / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-green-600" },
          { label: "Deployment Rate", value: `${deploymentRate.toFixed(0)}%`, icon: TrendingUp, color: "text-primary" },
          { label: "Active Pools", value: pools.length, icon: Layers, color: "text-blue-600" },
          { label: "Proposals Received", value: proposals.length, icon: Users, color: "text-purple-600" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <k.icon className={`h-6 w-6 ${k.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">Funding Pools</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="problems">My Challenges</TabsTrigger>
          <TabsTrigger value="roi">ROI & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={poolDialog} onOpenChange={setPoolDialog}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Pool</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Funding Pool</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Pool Title *" value={poolForm.title} onChange={e => setPoolForm(f => ({ ...f, title: e.target.value }))} />
                  <Textarea placeholder="Description" value={poolForm.description} onChange={e => setPoolForm(f => ({ ...f, description: e.target.value }))} />
                  <Select value={poolForm.pool_type} onValueChange={v => setPoolForm(f => ({ ...f, pool_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["single_problem", "multi_problem", "domain", "innovation_grant", "rapid_response"].map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Total Capital ($)" value={poolForm.total_committed_capital || ""} onChange={e => setPoolForm(f => ({ ...f, total_committed_capital: Number(e.target.value) }))} />
                  <Input type="date" placeholder="Funding Window End" value={poolForm.funding_window_end} onChange={e => setPoolForm(f => ({ ...f, funding_window_end: e.target.value }))} />
                  <Button className="w-full" onClick={() => createPoolMut.mutate()} disabled={!poolForm.title || createPoolMut.isPending}>
                    {createPoolMut.isPending ? "Creating…" : "Create Pool"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {pools.map((pool: any) => (
              <Card key={pool.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{pool.title}</CardTitle>
                    <Badge variant={pool.status === "active" ? "default" : "outline"}>{pool.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{pool.description || "No description"}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Capital Deployed</span>
                      <span>${((pool.total_committed_capital - pool.available_capital) / 1000).toFixed(1)}K / ${(pool.total_committed_capital / 1000).toFixed(1)}K</span>
                    </div>
                    <Progress value={pool.total_committed_capital > 0 ? ((pool.total_committed_capital - pool.available_capital) / pool.total_committed_capital) * 100 : 0} className="h-2" />
                  </div>
                  <Badge variant="outline">{pool.pool_type?.replace(/_/g, " ")}</Badge>
                </CardContent>
              </Card>
            ))}
            {pools.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No funding pools yet. Create one to start deploying capital.</p>}
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          {proposals.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No proposals received yet.</p>
          ) : (
            <div className="space-y-3">
              {proposals.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{p.capability_summary || "Untitled Proposal"}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{p.status}</Badge>
                        {p.budget_request > 0 && <Badge variant="secondary">${(p.budget_request / 1000).toFixed(0)}K</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><Eye className="h-3 w-3 mr-1" />Review</Button>
                      <Button size="sm" variant="default"><CheckCircle className="h-3 w-3 mr-1" />Shortlist</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          {myProblems.filter((p: any) => p.created_by === user?.id).length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No challenges posted yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myProblems.filter((p: any) => p.created_by === user?.id).map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{p.problem_title}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{p.category}</Badge>
                      <Badge>{p.status?.replace(/_/g, " ")}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Capital Deployment Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenue.slice(0, 20).map((r: any, i: number) => ({ day: i + 1, amount: r.amount || 0 }))}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Pool Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pools.map((p: any) => ({ name: p.title?.slice(0, 15), deployed: p.total_committed_capital - p.available_capital, available: p.available_capital }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deployed" fill="hsl(var(--primary))" stackId="a" />
                    <Bar dataKey="available" fill="hsl(var(--muted))" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
