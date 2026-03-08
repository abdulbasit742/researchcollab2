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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateInnovationProposal, saveProposal, getMyProposals,
  INNOVATION_DOMAINS, INNOVATION_CATEGORIES,
  type InnovationProposal,
} from "@/lib/innovation/innovationAdvisor";
import {
  Sparkles, Wand2, Save, Lightbulb, Layers, DollarSign, TrendingUp, Link2, Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function InnovationAdvisorPage() {
  const { user, isLoading: authLoading } = useAuth();
  const qc = useQueryClient();
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [currentProposal, setCurrentProposal] = useState<InnovationProposal | null>(null);

  const { data: savedProposals = [], isLoading: lp } = useQuery({
    queryKey: ["my-innovation-proposals", user?.id],
    queryFn: () => getMyProposals(user!.id),
    enabled: !!user,
  });

  const generateMut = useMutation({
    mutationFn: generateInnovationProposal,
    onSuccess: (data) => {
      setCurrentProposal(data);
      toast.success("Innovation proposal generated!");
    },
    onError: (err: any) => {
      if (err?.message?.includes("429") || err?.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (err?.message?.includes("402") || err?.message?.includes("Payment")) {
        toast.error("AI credits exhausted. Please add funds.");
      } else {
        toast.error("Failed to generate proposal");
      }
    },
  });

  const saveMut = useMutation({
    mutationFn: saveProposal,
    onSuccess: () => {
      toast.success("Proposal saved");
      qc.invalidateQueries({ queryKey: ["my-innovation-proposals"] });
    },
    onError: () => toast.error("Failed to save"),
  });

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <div className="container py-6 max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Innovation Advisor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered innovation engine — generate novel platform extension proposals.
          </p>
        </div>

        {/* Generator */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> Generate Proposal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <Label>Domain</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger><SelectValue placeholder="Any domain" /></SelectTrigger>
                  <SelectContent>{INNOVATION_DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Any category" /></SelectTrigger>
                  <SelectContent>{INNOVATION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Context (optional)</Label>
                <Input value={context} onChange={e => setContext(e.target.value)} placeholder="Extra focus area…" />
              </div>
            </div>
            <Button onClick={() => generateMut.mutate({ domain, category, platform_context: context })} disabled={generateMut.isPending}>
              {generateMut.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Innovation</>}
            </Button>
          </CardContent>
        </Card>

        {/* Current Proposal */}
        {currentProposal && (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {currentProposal.title}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => {
                  if (!user) return;
                  saveMut.mutate({
                    requested_by: user.id,
                    context_domain: domain,
                    innovation_category: category,
                    proposal_title: currentProposal.title,
                    proposal_summary: currentProposal.summary,
                    core_components: currentProposal.core_components,
                    revenue_model: currentProposal.revenue_model,
                    estimated_impact: currentProposal.estimated_impact,
                    ai_model_used: "google/gemini-3-flash-preview",
                  });
                }} disabled={saveMut.isPending}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{currentProposal.summary}</p>

              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Layers className="h-4 w-4 text-primary" /> Core Components</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentProposal.core_components.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <h4 className="text-xs font-semibold flex items-center gap-1 mb-1"><DollarSign className="h-3 w-3" /> Revenue Model</h4>
                  <p className="text-xs text-muted-foreground">{currentProposal.revenue_model}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <h4 className="text-xs font-semibold flex items-center gap-1 mb-1"><TrendingUp className="h-3 w-3" /> Expected Impact</h4>
                  <p className="text-xs text-muted-foreground">{currentProposal.estimated_impact}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2"><Link2 className="h-3 w-3" /> Integration Points</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {currentProposal.integration_points.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Proposals */}
        {savedProposals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Saved Proposals</h2>
            {savedProposals.map((p: any) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                setCurrentProposal({
                  title: p.proposal_title,
                  summary: p.proposal_summary,
                  core_components: p.core_components || [],
                  revenue_model: p.revenue_model || "",
                  estimated_impact: p.estimated_impact || "",
                  integration_points: [],
                });
              }}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">{p.proposal_title}</span>
                    {p.context_domain && <Badge variant="secondary" className="text-[10px]">{p.context_domain}</Badge>}
                    {p.innovation_category && <Badge variant="outline" className="text-[10px]">{p.innovation_category}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.proposal_summary}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
