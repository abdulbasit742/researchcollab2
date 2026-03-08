import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, TrendingUp, Users, Brain, Plus, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  getStartupCandidates, createStartupCandidate, getVentureFactoryAnalytics,
  runCommercializationSignalEngine, CANDIDATE_STATUSES,
} from "@/lib/innovation/ventureFactory";

const STATUS_COLORS: Record<string, string> = {
  identified: "bg-muted text-muted-foreground",
  evaluation: "bg-blue-500/10 text-blue-700",
  incubation: "bg-amber-500/10 text-amber-700",
  venture_building: "bg-purple-500/10 text-purple-700",
  launched: "bg-green-500/10 text-green-700",
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#10b981"];

export default function VentureFactoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["vf-candidates", statusFilter],
    queryFn: () => getStartupCandidates(statusFilter ? { status: statusFilter } : undefined),
  });

  const { data: analytics } = useQuery({
    queryKey: ["vf-analytics"],
    queryFn: getVentureFactoryAnalytics,
  });

  const createMutation = useMutation({
    mutationFn: createStartupCandidate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vf-candidates"] });
      qc.invalidateQueries({ queryKey: ["vf-analytics"] });
      toast.success("Startup candidate registered");
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setDomain("");
    },
  });

  const runAI = async (candidate: any) => {
    setAiLoading(candidate.id);
    try {
      const result = await runCommercializationSignalEngine({
        projectTitle: candidate.title,
        projectDescription: candidate.description,
        domain: candidate.research_domain,
      });
      toast.success(`AI Score: ${result.commercialization_score}/100 — ${result.recommended_path}`);
    } catch (e: any) {
      toast.error(e.message || "AI analysis failed");
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" /> Venture Factory
          </h1>
          <p className="text-muted-foreground mt-1">Transform research into startups</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Register Candidate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Startup Candidate</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Venture title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input placeholder="Research domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
              <Button
                className="w-full"
                disabled={!title || createMutation.isPending}
                onClick={() => createMutation.mutate({ title, description, research_domain: domain, team_lead_id: user?.id || "" })}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">{analytics?.totalCandidates ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total Candidates</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-green-600">{analytics?.launched ?? 0}</p>
          <p className="text-sm text-muted-foreground">Launched</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-primary">{analytics?.conversionRate ?? 0}%</p>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold text-foreground">${(analytics?.totalFunding ?? 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Funding Secured</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="candidates">
        <TabsList>
          <TabsTrigger value="candidates"><Users className="h-4 w-4 mr-1" /> Candidates</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {CANDIDATE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? <p className="text-muted-foreground">Loading...</p> : candidates.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No startup candidates yet. Register one above.</CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {candidates.map((c: any) => (
                <Card key={c.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground text-lg">{c.title}</h3>
                        {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                        <div className="flex gap-2 mt-2">
                          <Badge className={STATUS_COLORS[c.status] || ""}>{c.status.replace("_", " ")}</Badge>
                          {c.research_domain && <Badge variant="outline">{c.research_domain}</Badge>}
                          {c.technology_readiness_level && <Badge variant="secondary">TRL {c.technology_readiness_level}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-primary">{c.commercialization_score ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <Button variant="outline" size="sm" disabled={aiLoading === c.id} onClick={() => runAI(c)}>
                          <Brain className="h-4 w-4 mr-1" /> {aiLoading === c.id ? "Analyzing..." : "AI Assess"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">By Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.byStatus || []}>
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">By Domain</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics?.byDomain || []} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={80} label>
                      {(analytics?.byDomain || []).map((_: any, i: number) => (
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
