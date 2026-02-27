/**
 * PolicySimulationPanel — Multi-scenario policy simulation & impact modeling UI.
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
  Loader2, Plus, Play, BarChart3, Shield, AlertTriangle, TrendingUp, Globe, Layers,
} from "lucide-react";
import {
  usePolicyModels, useCreatePolicyModel, usePolicyAssumptions,
  usePolicyScenarios, useCreateScenario, useExtractAssumptions,
  useRunPolicySimulation,
} from "@/hooks/usePolicySimulation";

const POLICY_TYPES = ["economic", "education", "tech", "infrastructure", "health", "regulatory"];
const SCENARIO_PRESETS = ["optimistic", "baseline", "conservative", "stress_test"];

export function PolicySimulationPanel({ workspaceId }: { workspaceId: string }) {
  const { data: models = [], isLoading } = usePolicyModels(workspaceId);
  const createModel = useCreatePolicyModel();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("economic");
  const [newRegion, setNewRegion] = useState("");

  const selectedModel = models.find((m: any) => m.id === selectedModelId);

  return (
    <Tabs defaultValue="models" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="models">Models</TabsTrigger>
        <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
      </TabsList>

      <TabsContent value="models">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Policy Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Policy title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1" />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POLICY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Region" value={newRegion} onChange={e => setNewRegion(e.target.value)} className="w-28" />
              <Button size="sm" disabled={!newTitle.trim() || createModel.isPending}
                onClick={() => {
                  createModel.mutate({ workspace_id: workspaceId, title: newTitle, policy_type: newType, region_scope: newRegion || undefined });
                  setNewTitle(""); setNewRegion("");
                }}>
                {createModel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {models.map((m: any) => (
                    <div key={m.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedModelId === m.id ? "border-primary bg-primary/5" : "hover:bg-accent/30"}`}
                      onClick={() => setSelectedModelId(m.id)}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{m.title}</span>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-[10px]">{m.policy_type}</Badge>
                          <Badge variant={m.status === "simulated" ? "default" : "secondary"} className="text-[10px]">{m.status}</Badge>
                        </div>
                      </div>
                      {m.region_scope && <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Globe className="h-3 w-3" />{m.region_scope}</span>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assumptions">
        {selectedModelId ? <AssumptionsTab modelId={selectedModelId} workspaceId={workspaceId} /> : <EmptyState text="Select a policy model first" />}
      </TabsContent>

      <TabsContent value="scenarios">
        {selectedModelId ? <ScenariosTab modelId={selectedModelId} /> : <EmptyState text="Select a policy model first" />}
      </TabsContent>

      <TabsContent value="results">
        {selectedModelId ? <ResultsTab modelId={selectedModelId} modelTitle={selectedModel?.title} /> : <EmptyState text="Select a policy model first" />}
      </TabsContent>
    </Tabs>
  );
}

function AssumptionsTab({ modelId, workspaceId }: { modelId: string; workspaceId: string }) {
  const { data: assumptions = [], isLoading } = usePolicyAssumptions(modelId);
  const extract = useExtractAssumptions();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Assumptions</CardTitle>
          <Button size="sm" variant="outline" disabled={extract.isPending}
            onClick={() => extract.mutate({ policy_model_id: modelId, workspace_id: workspaceId })}>
            {extract.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
            Extract from Claims
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : assumptions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No assumptions yet. Extract from research claims.</p>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {assumptions.map((a: any) => (
                <div key={a.id} className="p-3 rounded-lg border space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{a.assumption_type}</Badge>
                    <span className="text-xs text-muted-foreground">Confidence: {((a.confidence_score || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-sm">{a.assumption_text}</p>
                  {a.parameter_key && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono bg-muted px-1 rounded">{a.parameter_key} = {a.parameter_value}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ScenariosTab({ modelId }: { modelId: string }) {
  const { data: scenarios = [], isLoading } = usePolicyScenarios(modelId);
  const createScenario = useCreateScenario();
  const runSim = useRunPolicySimulation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Scenarios</CardTitle>
          <div className="flex gap-2">
            {SCENARIO_PRESETS.filter(p => !scenarios.some((s: any) => s.scenario_name === p)).map(preset => (
              <Button key={preset} size="sm" variant="outline"
                onClick={() => createScenario.mutate({ policy_model_id: modelId, scenario_name: preset })}>
                <Plus className="h-3 w-3 mr-1" />{preset}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
          <>
            {scenarios.map((s: any) => (
              <div key={s.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm capitalize">{s.scenario_name}</span>
                  <Badge variant={s.policy_simulation_results?.length > 0 ? "default" : "secondary"} className="text-[10px]">
                    {s.policy_simulation_results?.length > 0 ? "Simulated" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
            {scenarios.length > 0 && (
              <Button className="w-full" disabled={runSim.isPending} onClick={() => runSim.mutate(modelId)}>
                {runSim.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Run All Scenarios
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ResultsTab({ modelId, modelTitle }: { modelId: string; modelTitle?: string }) {
  const { data: scenarios = [], isLoading } = usePolicyScenarios(modelId);
  const resultsExist = scenarios.some((s: any) => s.policy_simulation_results?.length > 0);

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin mx-auto mt-4" />;
  if (!resultsExist) return <EmptyState text="Run simulation first to see results" />;

  return (
    <div className="space-y-4">
      {scenarios.filter((s: any) => s.policy_simulation_results?.length > 0).map((s: any) => {
        const result = s.policy_simulation_results[s.policy_simulation_results.length - 1];
        const outcomes = result.projected_outcomes || {};
        const uncertainty = result.uncertainty_interval || {};
        const sensitivity = result.sensitivity_analysis || [];

        return (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />{s.scenario_name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">Feasibility: {result.feasibility_score}%</Badge>
                  {uncertainty.lower_bound_pct != null && (
                    <Badge variant="secondary" className="text-[10px]">
                      ±{Math.abs(uncertainty.lower_bound_pct)}–{uncertainty.upper_bound_pct}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={result.feasibility_score} className="h-2" />

              {/* Outcomes Grid */}
              {outcomes.economic_impact && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(outcomes.economic_impact).map(([k, v]) => (
                    <div key={k} className="p-2 rounded border text-center">
                      <span className="text-[10px] text-muted-foreground block">{k.replace(/_/g, " ")}</span>
                      <span className="text-sm font-bold">{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {outcomes.social_impact && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(outcomes.social_impact).map(([k, v]) => (
                    <div key={k} className="p-2 rounded border text-center">
                      <span className="text-[10px] text-muted-foreground block">{k.replace(/_/g, " ")}</span>
                      <span className="text-sm font-bold">{typeof v === 'number' ? v.toLocaleString() : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sensitivity */}
              {Array.isArray(sensitivity) && sensitivity.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Sensitivity Variables</h4>
                  <div className="space-y-1">
                    {sensitivity.map((sv: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded border">
                        <span>{sv.variable}</span>
                        <div className="flex gap-2">
                          <span className="text-primary">+10%: {sv.impact_if_plus_10}</span>
                          <span className="text-destructive">-10%: {sv.impact_if_minus_10}</span>
                          <Badge variant={sv.fragility === "high" ? "destructive" : "outline"} className="text-[10px]">{sv.fragility}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
        {text}
      </CardContent>
    </Card>
  );
}
