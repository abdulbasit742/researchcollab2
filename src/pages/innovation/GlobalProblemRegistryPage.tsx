import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Globe, Plus, ThumbsUp, Link2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getGlobalProblems, proposeProblem, voteProblem, PROBLEM_CATEGORIES } from "@/lib/innovation/globalProblemRegistry";

export default function GlobalProblemRegistryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", description: "", severity_score: 50, affected_population: "" });

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["global-problems", selectedCategory],
    queryFn: () => getGlobalProblems(selectedCategory || undefined),
  });

  const proposeMutation = useMutation({
    mutationFn: () => proposeProblem({ ...form, proposed_by: user?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["global-problems"] }); toast.success("Problem proposed"); setDialogOpen(false); },
  });

  const voteMutation = useMutation({
    mutationFn: (problemId: string) => voteProblem(problemId, user?.id || ""),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["global-problems"] }); toast.success("Vote recorded"); },
    onError: () => toast.error("Already voted"),
  });

  const severityColor = (s: number) => s >= 80 ? "text-destructive" : s >= 50 ? "text-yellow-600" : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Global Problem Registry</h1>
            <p className="text-sm text-muted-foreground">Humanity's challenges as structured execution opportunities</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Propose Problem</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Propose a Global Problem</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Problem title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{PROBLEM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <div>
                <label className="text-xs text-muted-foreground">Severity Score: {form.severity_score}</label>
                <Input type="range" min={0} max={100} value={form.severity_score} onChange={e => setForm(p => ({ ...p, severity_score: Number(e.target.value) }))} />
              </div>
              <Input placeholder="Affected population" value={form.affected_population} onChange={e => setForm(p => ({ ...p, affected_population: e.target.value }))} />
              <Button className="w-full" onClick={() => proposeMutation.mutate()} disabled={!form.title || !form.category}>Submit Proposal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant={!selectedCategory ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("")}>All</Badge>
        {PROBLEM_CATEGORIES.map(c => (
          <Badge key={c} variant={selectedCategory === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory(c)}>{c}</Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading problems…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <Badge variant="secondary">{p.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Impact Severity</span>
                    <span className={severityColor(p.severity_score)}>{p.severity_score}/100</span>
                  </div>
                  <Progress value={p.severity_score} className="h-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Funding:</span> <Badge variant="outline" className="text-[10px]">{p.funding_availability}</Badge></div>
                  <div><span className="text-muted-foreground">Commercial:</span> <Badge variant="outline" className="text-[10px]">{p.commercialization_potential}</Badge></div>
                </div>
                {p.affected_population && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{p.affected_population}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => voteMutation.mutate(p.id)}>
                    <ThumbsUp className="h-3 w-3 mr-1" />Support
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs"><Link2 className="h-3 w-3 mr-1" />Link Project</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {problems.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">No problems registered yet. Be the first to propose one.</div>
          )}
        </div>
      )}
    </div>
  );
}
