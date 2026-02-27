import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Globe, Loader2, Zap, TrendingUp, Shield, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { useCivilizationEngine } from "@/hooks/useCivilizationEngine";

const DIMENSION_META: Record<string, { label: string; icon: string }> = {
  knowledge_growth_index: { label: "Knowledge Growth", icon: "📚" },
  trust_growth_index: { label: "Trust Growth", icon: "🤝" },
  capital_efficiency_index: { label: "Capital Efficiency", icon: "💰" },
  policy_impact_index: { label: "Policy Impact", icon: "📜" },
  governance_stability_index: { label: "Governance Stability", icon: "🏛" },
};

const LOOP_META: Record<string, { label: string; arrow: string }> = {
  knowledge_to_trust: { label: "Knowledge → Trust", arrow: "📚 → 🤝" },
  trust_to_capital: { label: "Trust → Capital", arrow: "🤝 → 💰" },
  capital_to_execution: { label: "Capital → Execution", arrow: "💰 → ⚡" },
  execution_to_policy: { label: "Execution → Policy", arrow: "⚡ → 📜" },
  policy_to_knowledge: { label: "Policy → Knowledge", arrow: "📜 → 📚" },
};

const SHOCK_TYPES = [
  "knowledge_collapse", "trust_scandal", "funding_crisis", "policy_failure",
  "institutional_downgrade", "cross_border_restriction", "governance_overload",
];

export function CivilizationEnginePanel() {
  const { cycles, shocks, loading, latestCycle, fetchCycles, fetchShocks, computeCycle, simulateShock } = useCivilizationEngine();
  const [shockType, setShockType] = useState("funding_crisis");
  const [shockMagnitude, setShockMagnitude] = useState([0.5]);

  useEffect(() => { fetchCycles(); fetchShocks(); }, []);

  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard"><Globe className="h-3 w-3 mr-1" />Dashboard</TabsTrigger>
        <TabsTrigger value="loops"><RefreshCw className="h-3 w-3 mr-1" />Loops</TabsTrigger>
        <TabsTrigger value="shock"><Zap className="h-3 w-3 mr-1" />Shock Test</TabsTrigger>
        <TabsTrigger value="history"><TrendingUp className="h-3 w-3 mr-1" />History</TabsTrigger>
      </TabsList>

      {/* DASHBOARD TAB */}
      <TabsContent value="dashboard" className="space-y-4">
        <div className="flex justify-between items-center">
          <div />
          <Button onClick={computeCycle} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Globe className="h-4 w-4 mr-1" />}
            Compute Civilization Cycle
          </Button>
        </div>

        {latestCycle ? (
          <>
            <Card className="p-6 text-center border-primary/30">
              <p className="text-xs text-muted-foreground">Composite Civilization Score</p>
              <p className="text-5xl font-bold text-primary mt-1">{latestCycle.composite_civilization_score.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-2">Cycle v{latestCycle.cycle_version} · {new Date(latestCycle.created_at).toLocaleString()}</p>
            </Card>

            <div className="grid grid-cols-5 gap-2">
              {Object.entries(DIMENSION_META).map(([key, { label, icon }]) => {
                const val = (latestCycle as any)[key] || 0;
                return (
                  <Card key={key} className="p-3 text-center">
                    <p className="text-lg">{icon}</p>
                    <p className="text-lg font-bold">{val.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </Card>
                );
              })}
            </div>

            {/* Optimization Suggestions */}
            {latestCycle.optimization_suggestions?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1"><Shield className="h-4 w-4" /> AI Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {latestCycle.optimization_suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded border">
                      <Badge variant={s.urgency === "high" ? "destructive" : s.urgency === "medium" ? "default" : "secondary"} className="text-[10px] mt-0.5">{s.urgency}</Badge>
                      <div>
                        <p className="text-xs font-medium">{s.category}</p>
                        <p className="text-xs text-muted-foreground">{s.suggestion}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground text-center">All suggestions require human approval before implementation</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No civilization cycles computed yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Compute Civilization Cycle" to begin</p>
          </Card>
        )}
      </TabsContent>

      {/* LOOPS TAB */}
      <TabsContent value="loops" className="space-y-4">
        {latestCycle?.feedback_loops ? (
          <>
            <Card className="p-4">
              <p className="text-sm font-medium mb-3">Feedback Loop Health</p>
              <div className="space-y-4">
                {Object.entries(LOOP_META).map(([key, { label, arrow }]) => {
                  const loop = (latestCycle.feedback_loops as any)?.[key];
                  const strength = loop?.strength || 0;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{arrow} {label}</span>
                        <span className="font-medium">{strength.toFixed(0)}/100</span>
                      </div>
                      <Progress value={strength} className="h-2" />
                      {loop?.bottleneck && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> {loop.bottleneck}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Circular flow */}
            <Card className="p-4">
              <p className="text-sm font-medium mb-3 text-center">Civilization Loop Flow</p>
              <div className="flex items-center justify-center flex-wrap gap-2 text-sm">
                {["📚 Knowledge", "🤝 Trust", "💰 Capital", "⚡ Execution", "📜 Policy"].map((item, i, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{item}</Badge>
                    {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-primary" />}
                  </span>
                ))}
                <ArrowRight className="h-3 w-3 text-primary" />
                <Badge variant="outline" className="text-xs">📚 Knowledge</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">Self-reinforcing closed-loop economy</p>
            </Card>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Compute a cycle first to see loop analysis</p>
        )}
      </TabsContent>

      {/* SHOCK TEST TAB */}
      <TabsContent value="shock" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Simulate Ecosystem Shock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={shockType} onValueChange={setShockType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SHOCK_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Magnitude: {(shockMagnitude[0] * 100).toFixed(0)}%</p>
              <Slider value={shockMagnitude} onValueChange={setShockMagnitude} min={0.1} max={1.0} step={0.1} />
            </div>
            <Button onClick={() => simulateShock(shockType, shockMagnitude[0])} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
              Run Shock Simulation
            </Button>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {shocks.map(s => (
              <Card key={s.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="destructive">{s.shock_type.replace(/_/g, " ")}</Badge>
                  <span className="text-xs text-muted-foreground">{(s.shock_magnitude * 100).toFixed(0)}% magnitude</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div><p className="font-bold">{s.pre_shock_score?.toFixed(1)}</p><p className="text-muted-foreground">Pre-Shock</p></div>
                  <div><p className="font-bold text-destructive">{s.post_shock_score?.toFixed(1)}</p><p className="text-muted-foreground">Post-Shock</p></div>
                  <div><p className="font-bold">{s.resilience_index?.toFixed(0)}</p><p className="text-muted-foreground">Resilience</p></div>
                  <div><p className="font-bold">{s.recovery_timeline_days}d</p><p className="text-muted-foreground">Recovery</p></div>
                </div>
                {s.corrective_measures?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {s.corrective_measures.slice(0, 3).map((m, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground">• {m.action}</p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* HISTORY TAB */}
      <TabsContent value="history" className="space-y-4">
        {cycles.length > 1 && (
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">Score Trajectory</p>
            <div className="flex items-end gap-1 h-20">
              {[...cycles].reverse().map(c => (
                <div
                  key={c.id}
                  className="bg-primary/70 rounded-t flex-1 min-w-[12px] max-w-[32px]"
                  style={{ height: `${Math.max(4, (c.composite_civilization_score / 100) * 80)}px` }}
                  title={`v${c.cycle_version}: ${c.composite_civilization_score.toFixed(1)}`}
                />
              ))}
            </div>
          </Card>
        )}

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {cycles.map(c => (
              <Card key={c.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cycle v{c.cycle_version}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{c.composite_civilization_score.toFixed(1)}</p>
                    <p className="text-[10px] text-muted-foreground">CCS</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {Object.entries(DIMENSION_META).map(([key, { icon }]) => (
                    <div key={key} className="text-center">
                      <span className="text-xs">{icon}</span>
                      <p className="text-[10px] font-medium">{((c as any)[key] || 0).toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {cycles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No cycles computed yet</p>}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
