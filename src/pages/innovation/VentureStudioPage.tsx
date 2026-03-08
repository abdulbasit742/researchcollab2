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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getVentureTracks, createVentureTrack, getVentureAnalytics, VENTURE_STAGES,
} from "@/lib/innovation/ventureStudio";
import {
  Rocket, Plus, DollarSign, BarChart3, Target, Lightbulb, GraduationCap, TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from "recharts";
import { toast } from "sonner";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

const stageBadge: Record<string, string> = {
  ideation: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  validation: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  prototype: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  mvp: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  growth: "bg-primary/10 text-primary border-primary/20",
  graduated: "bg-muted text-muted-foreground",
};

export default function VentureStudioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: analytics, isLoading: la } = useQuery({
    queryKey: ["venture-analytics"],
    queryFn: getVentureAnalytics,
    enabled: !!user,
  });

  const { data: tracks = [], isLoading: lt } = useQuery({
    queryKey: ["venture-tracks"],
    queryFn: () => getVentureTracks(),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: createVentureTrack,
    onSuccess: () => {
      toast.success("Venture track created");
      qc.invalidateQueries({ queryKey: ["venture-tracks"] });
      qc.invalidateQueries({ queryKey: ["venture-analytics"] });
      setShowCreate(false);
    },
    onError: () => toast.error("Failed to create venture"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Research Venture Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convert research into startups through structured incubation with milestone-backed funding.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {la ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : (
            <>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-primary shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalVentures ?? 0}</p><p className="text-xs text-muted-foreground">Active Ventures</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500 shrink-0" />
                <div><p className="text-2xl font-bold">${((analytics?.totalFunding ?? 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Funding Target</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.fundingRate ?? 0}%</p><p className="text-xs text-muted-foreground">Funding Rate</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-violet-500 shrink-0" />
                <div><p className="text-2xl font-bold">${((analytics?.totalRaised ?? 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Capital Raised</p></div>
              </CardContent></Card>
            </>
          )}
        </div>

        {/* Charts */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2">
            {analytics.byStage.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Ventures by Stage</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.byStage} dataKey="count" nameKey="stage" cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} label={({ stage, count }) => `${stage}: ${count}`}>
                        {analytics.byStage.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {analytics.byDomain.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Ventures by Domain</CardTitle></CardHeader>
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
          </div>
        )}

        {/* Venture List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Venture Tracks</h2>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Launch Venture</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Launch a Research Venture</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!user) return;
                  const fd = new FormData(e.currentTarget);
                  createMut.mutate({
                    venture_name: fd.get("name") as string,
                    description: fd.get("description") as string,
                    domain: fd.get("domain") as string,
                    funding_target: Number(fd.get("funding") || 0),
                    milestones_total: Number(fd.get("milestones") || 4),
                    founder_id: user.id,
                  });
                }} className="space-y-4">
                  <div><Label>Venture Name</Label><Input name="name" required /></div>
                  <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Domain</Label><Input name="domain" placeholder="e.g. AI, Biotech" /></div>
                    <div><Label>Funding Target ($)</Label><Input name="funding" type="number" min={0} /></div>
                  </div>
                  <div><Label>Total Milestones</Label><Input name="milestones" type="number" min={1} defaultValue={4} /></div>
                  <Button type="submit" disabled={createMut.isPending}>Launch</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {lt ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />) : !tracks.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No venture tracks yet. Launch the first one!</CardContent></Card>
          ) : tracks.map((t: any) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Rocket className="h-4 w-4 text-primary" />
                      <span className="font-medium">{t.venture_name}</span>
                      <Badge variant="outline" className={stageBadge[t.stage] ?? ""}>{t.stage}</Badge>
                      {t.domain && <Badge variant="secondary">{t.domain}</Badge>}
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>Target: ${(t.funding_target || 0).toLocaleString()}</span>
                      <span>Raised: ${(t.funding_raised || 0).toLocaleString()}</span>
                      <span>{t.milestones_completed}/{t.milestones_total} milestones</span>
                      {t.ip_status && <span>IP: {t.ip_status}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
