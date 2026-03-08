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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getGlobalProblems,
  proposeProblem,
  PROBLEM_CATEGORIES,
} from "@/lib/innovation/globalProblemRegistry";
import { getProposals, createProposal, getFundingPools, createFundingPool } from "@/lib/innovation/problemMarketplace";
import {
  Globe, Plus, DollarSign, FileText, Users, Target, Flame,
} from "lucide-react";
import { toast } from "sonner";

const severityColor = (score: number) => {
  if (score >= 80) return "bg-red-500/10 text-red-600 border-red-500/20";
  if (score >= 50) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-blue-500/10 text-blue-600 border-blue-500/20";
};

export default function ProblemMarketplacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("problems");
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [showPropose, setShowPropose] = useState(false);
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [showFundPool, setShowFundPool] = useState(false);

  const { data: problems, isLoading: loadingProblems } = useQuery({
    queryKey: ["global-problems"],
    queryFn: () => getGlobalProblems(),
    enabled: !!user,
  });

  const { data: proposals, isLoading: loadingProposals } = useQuery({
    queryKey: ["problem-proposals", selectedProblem],
    queryFn: () => getProposals(selectedProblem ?? undefined),
    enabled: !!user,
  });

  const { data: pools, isLoading: loadingPools } = useQuery({
    queryKey: ["funding-pools", selectedProblem],
    queryFn: () => getFundingPools(selectedProblem ?? undefined),
    enabled: !!user,
  });

  const addProblemMutation = useMutation({
    mutationFn: proposeProblem,
    onSuccess: () => {
      toast.success("Problem submitted");
      queryClient.invalidateQueries({ queryKey: ["global-problems"] });
      setShowAddProblem(false);
    },
    onError: () => toast.error("Failed to submit problem"),
  });

  const addProposalMutation = useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      toast.success("Proposal submitted");
      queryClient.invalidateQueries({ queryKey: ["problem-proposals"] });
      setShowPropose(false);
    },
    onError: () => toast.error("Failed to submit proposal"),
  });

  const addPoolMutation = useMutation({
    mutationFn: createFundingPool,
    onSuccess: () => {
      toast.success("Funding pool created");
      queryClient.invalidateQueries({ queryKey: ["funding-pools"] });
      setShowFundPool(false);
    },
    onError: () => toast.error("Failed to create pool"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container py-6 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Global Problem Marketplace
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse challenges, submit proposals, and fund research solving real-world problems.
            </p>
          </div>
          <Dialog open={showAddProblem} onOpenChange={setShowAddProblem}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Post Problem</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post a Global Problem</DialogTitle></DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                addProblemMutation.mutate({
                  title: fd.get("title") as string,
                  category: fd.get("category") as string,
                  description: fd.get("description") as string,
                  severity_score: Number(fd.get("severity") || 50),
                  proposed_by: user?.id,
                });
              }} className="space-y-4">
                <div><Label>Title</Label><Input name="title" required /></div>
                <div>
                  <Label>Category</Label>
                  <Select name="category" required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {PROBLEM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Textarea name="description" rows={3} /></div>
                <div><Label>Severity (0-100)</Label><Input name="severity" type="number" min={0} max={100} defaultValue={50} /></div>
                <Button type="submit" disabled={addProblemMutation.isPending}>Submit</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{problems?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Active Problems</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{proposals?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Proposals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{pools?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Funding Pools</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <Users className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">
                  ${((pools ?? []).reduce((s: number, p: any) => s + (p.total_amount || 0), 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-muted-foreground">Total Funding</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="funding">Funding Pools</TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-3 mt-4">
            {loadingProblems ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
            ) : !problems?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No problems posted yet.</CardContent></Card>
            ) : (
              problems.map((p: any) => (
                <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProblem(p.id)}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-destructive" />
                          <span className="font-medium">{p.title}</span>
                          <Badge variant="outline">{p.category}</Badge>
                          <Badge variant="outline" className={severityColor(p.severity_score ?? 0)}>
                            Severity: {p.severity_score ?? 0}
                          </Badge>
                        </div>
                        {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                        {p.affected_population && (
                          <p className="text-xs text-muted-foreground">Affected: {p.affected_population}</p>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedProblem(p.id); setShowPropose(true); }}>
                          Propose
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedProblem(p.id); setShowFundPool(true); }}>
                          Fund
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="proposals" className="space-y-3 mt-4">
            {loadingProposals ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !proposals?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No proposals submitted.</CardContent></Card>
            ) : (
              proposals.map((pr: any) => (
                <Card key={pr.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{pr.title}</span>
                      <Badge variant="outline">{pr.status}</Badge>
                    </div>
                    {pr.approach_summary && <p className="text-xs text-muted-foreground mb-2">{pr.approach_summary}</p>}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Budget: ${(pr.estimated_budget || 0).toLocaleString()}</span>
                      <span>Timeline: {pr.estimated_timeline_months}mo</span>
                      <span>Team: {pr.team_size}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="funding" className="space-y-3 mt-4">
            {loadingPools ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
            ) : !pools?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No funding pools created.</CardContent></Card>
            ) : (
              pools.map((pool: any) => (
                <Card key={pool.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{pool.pool_name}</span>
                      <Badge variant={pool.status === "active" ? "default" : "secondary"}>{pool.status}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Total: ${(pool.total_amount || 0).toLocaleString()}</span>
                      <span>Allocated: ${(pool.allocated_amount || 0).toLocaleString()}</span>
                      <span>Remaining: ${(pool.remaining_amount || 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Propose Dialog */}
        <Dialog open={showPropose} onOpenChange={setShowPropose}>
          <DialogContent>
            <DialogHeader><DialogTitle>Submit Research Proposal</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedProblem || !user) return;
              const fd = new FormData(e.currentTarget);
              addProposalMutation.mutate({
                problem_id: selectedProblem,
                proposer_id: user.id,
                title: fd.get("title") as string,
                approach_summary: fd.get("approach") as string,
                estimated_budget: Number(fd.get("budget") || 0),
                estimated_timeline_months: Number(fd.get("timeline") || 6),
                team_size: Number(fd.get("team") || 1),
              });
            }} className="space-y-4">
              <div><Label>Proposal Title</Label><Input name="title" required /></div>
              <div><Label>Approach Summary</Label><Textarea name="approach" rows={3} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Budget ($)</Label><Input name="budget" type="number" min={0} /></div>
                <div><Label>Timeline (months)</Label><Input name="timeline" type="number" min={1} defaultValue={6} /></div>
                <div><Label>Team Size</Label><Input name="team" type="number" min={1} defaultValue={1} /></div>
              </div>
              <Button type="submit" disabled={addProposalMutation.isPending}>Submit Proposal</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Fund Pool Dialog */}
        <Dialog open={showFundPool} onOpenChange={setShowFundPool}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Funding Pool</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedProblem || !user) return;
              const fd = new FormData(e.currentTarget);
              addPoolMutation.mutate({
                problem_id: selectedProblem,
                sponsor_id: user.id,
                pool_name: fd.get("name") as string,
                total_amount: Number(fd.get("amount") || 0),
              });
            }} className="space-y-4">
              <div><Label>Pool Name</Label><Input name="name" required /></div>
              <div><Label>Total Amount ($)</Label><Input name="amount" type="number" min={100} required /></div>
              <Button type="submit" disabled={addPoolMutation.isPending}>Create Pool</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
