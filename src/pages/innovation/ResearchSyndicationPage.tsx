import { useState } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getSyndicates, createSyndicate, getSyndicateAnalytics,
  SYNDICATE_STATUSES, GOVERNANCE_MODELS, IP_POLICIES,
} from "@/lib/innovation/researchSyndication";
import {
  Network, Plus, DollarSign, BarChart3, Users, TrendingUp, Shield,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from "recharts";
import { toast } from "sonner";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

const statusBadge: Record<string, string> = {
  forming: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  active: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  funded: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  executing: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  completed: "bg-muted text-muted-foreground",
};

export default function ResearchSyndicationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: analytics, isLoading: la } = useQuery({
    queryKey: ["syndicate-analytics"],
    queryFn: getSyndicateAnalytics,
    enabled: !!user,
  });

  const { data: syndicates = [], isLoading: ls } = useQuery({
    queryKey: ["syndicates"],
    queryFn: () => getSyndicates(),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: createSyndicate,
    onSuccess: () => {
      toast.success("Syndicate created");
      qc.invalidateQueries({ queryKey: ["syndicates"] });
      qc.invalidateQueries({ queryKey: ["syndicate-analytics"] });
      setShowCreate(false);
    },
    onError: () => toast.error("Failed"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Research Syndication Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-institution joint funding coordination — syndicated research pools for collaborative execution.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {la ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : (
            <>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Network className="h-8 w-8 text-primary shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalSyndicates ?? 0}</p><p className="text-xs text-muted-foreground">Syndicates</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500 shrink-0" />
                <div><p className="text-2xl font-bold">${((analytics?.totalCommitted ?? 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Capital Committed</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.commitmentRate ?? 0}%</p><p className="text-xs text-muted-foreground">Commitment Rate</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalMembers ?? 0}</p><p className="text-xs text-muted-foreground">Total Members</p></div>
              </CardContent></Card>
            </>
          )}
        </div>

        {analytics && (
          <div className="grid gap-4 md:grid-cols-2">
            {analytics.byDomain.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Syndicates by Domain</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.byDomain}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="domain" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {analytics.byDomain.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {analytics.byStatus.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Syndicate Status</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} label={({ status, count }) => `${status}: ${count}`}>
                        {analytics.byStatus.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Research Syndicates</h2>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Form Syndicate</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Form Research Syndicate</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!user) return;
                  const fd = new FormData(e.currentTarget);
                  createMut.mutate({
                    syndicate_name: fd.get("name") as string,
                    description: fd.get("description") as string,
                    domain: fd.get("domain") as string,
                    funding_target: Number(fd.get("target") || 0),
                    governance_model: fd.get("governance") as string || "consensus",
                    ip_sharing_policy: fd.get("ip") as string || "proportional",
                    lead_coordinator_id: user.id,
                  });
                }} className="space-y-4">
                  <div><Label>Syndicate Name</Label><Input name="name" required /></div>
                  <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Domain</Label><Input name="domain" placeholder="e.g. AI, Climate" /></div>
                    <div><Label>Funding Target ($)</Label><Input name="target" type="number" min={0} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Governance</Label>
                      <Select name="governance"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{GOVERNANCE_MODELS.map(g => <SelectItem key={g} value={g}>{g.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>IP Policy</Label>
                      <Select name="ip"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{IP_POLICIES.map(p => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={createMut.isPending}>Form Syndicate</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {ls ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />) : !syndicates.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No syndicates formed yet.</CardContent></Card>
          ) : syndicates.map((s: any) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Network className="h-4 w-4 text-primary" />
                  <span className="font-medium">{s.syndicate_name}</span>
                  <Badge variant="outline" className={statusBadge[s.status] ?? ""}>{s.status}</Badge>
                  {s.domain && <Badge variant="secondary">{s.domain}</Badge>}
                </div>
                {s.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{s.description}</p>}
                <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>Target: ${(s.funding_target || 0).toLocaleString()}</span>
                  <span>Committed: ${(s.funding_committed || 0).toLocaleString()}</span>
                  <span>{s.member_count} members</span>
                  <span>Governance: {(s.governance_model || "").replace(/_/g, " ")}</span>
                  <span>IP: {(s.ip_sharing_policy || "").replace(/_/g, " ")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
