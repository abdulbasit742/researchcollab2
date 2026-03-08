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
  getIndustryChallenges, createIndustryChallenge, getPartnershipAnalytics, CHALLENGE_TYPES,
} from "@/lib/innovation/industryPartnership";
import {
  Building, Plus, DollarSign, BarChart3, Star, Clock, Shield, Users, Briefcase,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { toast } from "sonner";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(142 76% 36%)",
  "hsl(280 65% 60%)", "hsl(30 80% 55%)",
];

const statusBadge: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-muted text-muted-foreground",
  closed: "bg-destructive/10 text-destructive",
};

export default function IndustryPartnershipPage() {
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState("challenges");

  const { data: analytics, isLoading: la } = useQuery({
    queryKey: ["partnership-analytics"],
    queryFn: getPartnershipAnalytics,
    enabled: !!user,
  });

  const { data: challenges = [], isLoading: lc } = useQuery({
    queryKey: ["industry-challenges"],
    queryFn: () => getIndustryChallenges(),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: createIndustryChallenge,
    onSuccess: () => {
      toast.success("Challenge posted");
      qc.invalidateQueries({ queryKey: ["industry-challenges"] });
      qc.invalidateQueries({ queryKey: ["partnership-analytics"] });
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
            <Building className="h-6 w-6 text-primary" />
            Industry Partnership Exchange
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Companies post R&D challenges. Researchers respond with execution-verified proposals.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {la ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />) : (
            <>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalChallenges ?? 0}</p><p className="text-xs text-muted-foreground">Total Challenges ({analytics?.openChallenges ?? 0} open)</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-emerald-500 shrink-0" />
                <div><p className="text-2xl font-bold">${((analytics?.totalBudget ?? 0) / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">R&D Budget Pool</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.totalApplications ?? 0}</p><p className="text-xs text-muted-foreground">Proposals Submitted</p></div>
              </CardContent></Card>
              <Card><CardContent className="pt-5 flex items-center gap-3">
                <Star className="h-8 w-8 text-amber-500 shrink-0" />
                <div><p className="text-2xl font-bold">{analytics?.featuredChallenges ?? 0}</p><p className="text-xs text-muted-foreground">Featured Challenges</p></div>
              </CardContent></Card>
            </>
          )}
        </div>

        {/* Charts */}
        {analytics?.byDomain && analytics.byDomain.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Challenges by Domain</CardTitle></CardHeader>
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

        {/* Challenge List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">R&D Challenges</h2>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Post Challenge</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Post an Industry Challenge</DialogTitle></DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!user) return;
                  const fd = new FormData(e.currentTarget);
                  createMut.mutate({
                    company_name: fd.get("company") as string,
                    title: fd.get("title") as string,
                    description: fd.get("description") as string,
                    domain: fd.get("domain") as string,
                    challenge_type: fd.get("type") as string,
                    budget_amount: Number(fd.get("budget") || 0),
                    min_trust_score: Number(fd.get("trust") || 0),
                    posted_by: user.id,
                  });
                }} className="space-y-4">
                  <div><Label>Company Name</Label><Input name="company" required /></div>
                  <div><Label>Challenge Title</Label><Input name="title" required /></div>
                  <div><Label>Description</Label><Textarea name="description" rows={3} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Domain</Label><Input name="domain" placeholder="e.g. AI, Energy" /></div>
                    <div>
                      <Label>Type</Label>
                      <Select name="type"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{CHALLENGE_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Budget ($)</Label><Input name="budget" type="number" min={0} /></div>
                    <div><Label>Min Trust Score</Label><Input name="trust" type="number" min={0} max={100} defaultValue={0} /></div>
                  </div>
                  <Button type="submit" disabled={createMut.isPending}>Post Challenge</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {lc ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />) : !challenges.length ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No industry challenges posted yet.</CardContent></Card>
          ) : challenges.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium">{c.title}</span>
                      <Badge variant="outline" className={statusBadge[c.status] ?? ""}>{c.status}</Badge>
                      <Badge variant="secondary">{(c.challenge_type || "").replace(/_/g, " ")}</Badge>
                      {c.is_featured && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">Featured</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{c.company_name}</p>
                    {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                      {c.domain && <span>Domain: {c.domain}</span>}
                      <span>${(c.budget_amount || 0).toLocaleString()}</span>
                      <span>{c.application_count || 0} proposals</span>
                      {c.min_trust_score > 0 && <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Min Trust: {c.min_trust_score}</span>}
                      {c.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(c.deadline).toLocaleDateString()}</span>}
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
