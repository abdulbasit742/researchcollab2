/**
 * ResearchPortfolioPanel — Portfolio optimization, stress testing, and diversification UI.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Plus, Briefcase, BarChart3, Shield, Zap, TrendingUp, AlertTriangle, Target,
} from "lucide-react";
import {
  useResearchPortfolios, useCreatePortfolio, usePortfolioAllocations,
  useAddAllocation, useOptimizePortfolio, useStressTestPortfolio, usePortfolioSnapshots,
} from "@/hooks/useResearchPortfolio";

const OWNER_TYPES = ["institution", "government", "enterprise", "foundation"];

export function ResearchPortfolioPanel() {
  const { data: portfolios = [], isLoading } = useResearchPortfolios();
  const createPortfolio = useCreatePortfolio();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("institution");
  const [newBudget, setNewBudget] = useState("");

  return (
    <Tabs defaultValue="portfolios" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="optimize">Optimize</TabsTrigger>
        <TabsTrigger value="stress">Stress Test</TabsTrigger>
      </TabsList>

      <TabsContent value="portfolios">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Research Portfolios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Portfolio title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1" />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OWNER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Budget" type="number" value={newBudget} onChange={e => setNewBudget(e.target.value)} className="w-28" />
              <Button size="sm" disabled={!newTitle.trim() || createPortfolio.isPending}
                onClick={() => { createPortfolio.mutate({ title: newTitle, owner_type: newType, total_budget: Number(newBudget) || 0 }); setNewTitle(""); setNewBudget(""); }}>
                {createPortfolio.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {portfolios.map((p: any) => (
                    <div key={p.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedId === p.id ? "border-primary bg-primary/5" : "hover:bg-accent/30"}`}
                      onClick={() => setSelectedId(p.id)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{p.title}</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-[10px]">{p.owner_type}</Badge>
                          <Badge variant="secondary" className="text-[10px]">${(p.total_budget || 0).toLocaleString()}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="projects">
        {selectedId ? <ProjectsTab portfolioId={selectedId} /> : <EmptyState text="Select a portfolio first" />}
      </TabsContent>

      <TabsContent value="optimize">
        {selectedId ? <OptimizeTab portfolioId={selectedId} /> : <EmptyState text="Select a portfolio first" />}
      </TabsContent>

      <TabsContent value="stress">
        {selectedId ? <StressTab portfolioId={selectedId} /> : <EmptyState text="Select a portfolio first" />}
      </TabsContent>
    </Tabs>
  );
}

function ProjectsTab({ portfolioId }: { portfolioId: string }) {
  const { data: allocations = [], isLoading } = usePortfolioAllocations(portfolioId);
  const addAlloc = useAddAllocation();
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [region, setRegion] = useState("");
  const [sector, setSector] = useState("");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Portfolio Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Project title" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 min-w-[150px]" />
          <Input placeholder="Budget" type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-24" />
          <Input placeholder="Region" value={region} onChange={e => setRegion(e.target.value)} className="w-24" />
          <Input placeholder="Sector" value={sector} onChange={e => setSector(e.target.value)} className="w-24" />
          <Button size="sm" disabled={!title.trim() || addAlloc.isPending}
            onClick={() => {
              addAlloc.mutate({ portfolio_id: portfolioId, project_title: title, allocated_budget: Number(budget) || 0, region: region || undefined, sector: sector || undefined });
              setTitle(""); setBudget(""); setRegion(""); setSector("");
            }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {allocations.map((a: any) => (
                <div key={a.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{a.project_title}</span>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-[10px]">${(a.allocated_budget || 0).toLocaleString()}</Badge>
                      {a.is_underfunded_high_potential && <Badge variant="default" className="text-[10px]">⭐ High Potential</Badge>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: "Risk", value: a.risk_score, color: a.risk_score > 70 },
                      { label: "Impact", value: a.expected_impact_score },
                      { label: "Trust", value: a.trust_score },
                      { label: "Stability", value: a.knowledge_stability_score },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <span className="text-[10px] text-muted-foreground block">{m.label}</span>
                        <span className="text-xs font-bold">{m.value}</span>
                      </div>
                    ))}
                  </div>
                  {a.region && <span className="text-[10px] text-muted-foreground">{a.region} · {a.sector || "General"} · {a.stage}</span>}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function OptimizeTab({ portfolioId }: { portfolioId: string }) {
  const optimize = useOptimizePortfolio();
  const { data: snapshots = [] } = usePortfolioSnapshots(portfolioId);
  const latestOpt = snapshots.find((s: any) => s.snapshot_type === "optimization");
  const optData = latestOpt?.snapshot_data || {};

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Portfolio Optimization
          </CardTitle>
          <Button size="sm" disabled={optimize.isPending} onClick={() => optimize.mutate(portfolioId)}>
            {optimize.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Target className="h-4 w-4 mr-1" />}
            Run Optimization
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!latestOpt ? (
          <p className="text-sm text-muted-foreground text-center py-4">Run optimization to see suggestions.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border text-center">
                <span className="text-[10px] text-muted-foreground block">Portfolio Score</span>
                <span className="text-xl font-bold">{optData.overall_portfolio_score || 0}</span>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <span className="text-[10px] text-muted-foreground block">Diversification</span>
                <span className="text-xl font-bold">{optData.diversification_index || 0}</span>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <span className="text-[10px] text-muted-foreground block">Confidence</span>
                <span className="text-xl font-bold">{((optData.confidence_score || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Reallocation Plan */}
            {(optData.reallocation_plan || []).length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Suggested Reallocation</h4>
                <div className="space-y-1">
                  {optData.reallocation_plan.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded border">
                      <span className="truncate flex-1">{r.project_id?.substring(0, 8)}...</span>
                      <span className="text-muted-foreground">${r.current_budget?.toLocaleString()} →</span>
                      <span className="font-bold ml-1">${r.suggested_budget?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concentration Risks */}
            {(optData.concentration_risks || []).length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Concentration Risks</h4>
                <div className="space-y-1">
                  {optData.concentration_risks.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded border">
                      <span>{r.description}</span>
                      <Badge variant={r.severity === "high" ? "destructive" : "outline"} className="text-[10px]">{r.severity}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trade-offs */}
            {(optData.trade_offs || []).length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-2">Trade-offs</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {optData.trade_offs.map((t: string, i: number) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StressTab({ portfolioId }: { portfolioId: string }) {
  const stressTest = useStressTestPortfolio();
  const { data: snapshots = [] } = usePortfolioSnapshots(portfolioId);
  const latestStress = snapshots.find((s: any) => s.snapshot_type === "stress_test");
  const stressData = latestStress?.snapshot_data || {};

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Stress Testing
          </CardTitle>
          <Button size="sm" disabled={stressTest.isPending} onClick={() => stressTest.mutate({ portfolio_id: portfolioId })}>
            {stressTest.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <AlertTriangle className="h-4 w-4 mr-1" />}
            Run Stress Test
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!latestStress ? (
          <p className="text-sm text-muted-foreground text-center py-4">Run a stress test to evaluate portfolio resilience.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border text-center">
                <span className="text-[10px] text-muted-foreground block">Overall Resilience</span>
                <span className="text-xl font-bold">{stressData.overall_resilience || 0}</span>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <span className="text-[10px] text-muted-foreground block">Weakest Link</span>
                <span className="text-xs font-bold truncate block">{stressData.weakest_link || "N/A"}</span>
              </div>
              <div className="p-3 rounded-lg border text-center">
                <span className="text-[10px] text-muted-foreground block">Strongest Anchor</span>
                <span className="text-xs font-bold truncate block">{stressData.strongest_anchor || "N/A"}</span>
              </div>
            </div>

            {(stressData.scenarios || []).map((s: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{s.scenario}</span>
                  <Badge variant={s.resilience_score > 60 ? "default" : "destructive"} className="text-[10px]">
                    Resilience: {s.resilience_score}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-1 rounded bg-muted/50">
                    <span className="text-muted-foreground block">Capital Loss</span>
                    <span className="font-bold text-destructive">{s.capital_loss_pct}%</span>
                  </div>
                  <div className="text-center p-1 rounded bg-muted/50">
                    <span className="text-muted-foreground block">Impact Loss</span>
                    <span className="font-bold text-destructive">{s.impact_loss_pct}%</span>
                  </div>
                  <div className="text-center p-1 rounded bg-muted/50">
                    <span className="text-muted-foreground block">Recovery</span>
                    <span className="font-bold">{s.recovery_months}mo</span>
                  </div>
                </div>
                <Progress value={s.resilience_score} className="h-1" />
                {(s.mitigation_suggestions || []).length > 0 && (
                  <ul className="text-[10px] text-muted-foreground list-disc list-inside">
                    {s.mitigation_suggestions.map((m: string, j: number) => <li key={j}>{m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
        {text}
      </CardContent>
    </Card>
  );
}
