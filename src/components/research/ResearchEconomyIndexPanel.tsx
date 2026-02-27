import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Shield, AlertTriangle, Globe, Loader2, Activity } from "lucide-react";
import { useResearchEconomyIndex } from "@/hooks/useResearchEconomyIndex";

const SCORE_LABELS: Record<string, { label: string; color: string }> = {
  knowledge_output_score: { label: "Knowledge Output", color: "bg-blue-500" },
  claim_influence_score: { label: "Claim Influence", color: "bg-indigo-500" },
  funding_efficiency_score: { label: "Funding Efficiency", color: "bg-green-500" },
  execution_reliability_score: { label: "Execution Reliability", color: "bg-emerald-500" },
  policy_adoption_score: { label: "Policy Adoption", color: "bg-amber-500" },
  cross_border_diffusion_score: { label: "Cross-Border Diffusion", color: "bg-purple-500" },
  trust_density_score: { label: "Trust Density", color: "bg-cyan-500" },
  knowledge_stability_score: { label: "Knowledge Stability", color: "bg-teal-500" },
  innovation_velocity_score: { label: "Innovation Velocity", color: "bg-orange-500" },
};

export function ResearchEconomyIndexPanel() {
  const { entities, metrics, history, gamingFlags, loading, fetchEntities, fetchHistory, fetchGamingFlags, computeIndex } = useResearchEconomyIndex();
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("institution");
  const [entityId, setEntityId] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  useEffect(() => { fetchEntities(); fetchGamingFlags(); }, []);
  useEffect(() => { if (selectedEntity) fetchHistory(selectedEntity); }, [selectedEntity]);

  const handleCompute = async () => {
    if (!entityName || !entityId) return;
    await computeIndex(entityId, entityType, entityName);
    setEntityName(""); setEntityId("");
  };

  const selectedMetrics = selectedEntity ? metrics[selectedEntity] : null;

  return (
    <Tabs defaultValue="index" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="index"><BarChart3 className="h-3 w-3 mr-1" />Index</TabsTrigger>
        <TabsTrigger value="breakdown"><TrendingUp className="h-3 w-3 mr-1" />Breakdown</TabsTrigger>
        <TabsTrigger value="gaming"><Shield className="h-3 w-3 mr-1" />Anti-Gaming</TabsTrigger>
      </TabsList>

      {/* INDEX TAB */}
      <TabsContent value="index" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Compute Research Economy Index</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Entity name" value={entityName} onChange={e => setEntityName(e.target.value)} />
              <Input placeholder="Entity ID / code" value={entityId} onChange={e => setEntityId(e.target.value)} />
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="nation">Nation</SelectItem>
                  <SelectItem value="corridor">Corridor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCompute} disabled={loading || !entityName || !entityId} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
              Compute Index
            </Button>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {entities.map(entity => {
              const m = metrics[entity.id];
              return (
                <Card
                  key={entity.id}
                  className={`p-3 cursor-pointer transition-colors ${selectedEntity === entity.id ? "border-primary" : "hover:bg-accent/30"}`}
                  onClick={() => setSelectedEntity(entity.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{entity.entity_name}</p>
                        <p className="text-xs text-muted-foreground">{entity.entity_type} · {entity.entity_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {m ? (
                        <>
                          <p className="text-lg font-bold">{m.composite_index_score.toFixed(1)}</p>
                          <p className="text-[10px] text-muted-foreground">REI Score</p>
                        </>
                      ) : (
                        <Badge variant="secondary">Not computed</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
            {entities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No entities indexed yet</p>}
          </div>
        </ScrollArea>
      </TabsContent>

      {/* BREAKDOWN TAB */}
      <TabsContent value="breakdown" className="space-y-4">
        {selectedMetrics ? (
          <>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Composite Research Economy Index</p>
              <p className="text-3xl font-bold text-primary">{selectedMetrics.composite_index_score.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">Computed: {new Date(selectedMetrics.computed_at).toLocaleString()}</p>
            </Card>

            <div className="space-y-2">
              {Object.entries(SCORE_LABELS).map(([key, { label }]) => {
                const val = (selectedMetrics as any)[key] || 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{label}</span>
                      <span className="font-medium">{val.toFixed(1)}</span>
                    </div>
                    <Progress value={val} className="h-2" />
                  </div>
                );
              })}
            </div>

            {selectedMetrics.formula_explanation && (
              <Card className="p-3">
                <p className="text-xs font-medium mb-1">Scoring Methodology</p>
                <p className="text-xs text-muted-foreground">{selectedMetrics.formula_explanation}</p>
              </Card>
            )}

            {selectedMetrics.weights_used && (
              <Card className="p-3">
                <p className="text-xs font-medium mb-2">Weight Distribution</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(selectedMetrics.weights_used).map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-[10px]">{k}: {((v as number) * 100).toFixed(0)}%</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* History trend */}
            {history.length > 0 && (
              <Card className="p-3">
                <p className="text-xs font-medium mb-2">Score History</p>
                <div className="flex items-end gap-1 h-16">
                  {history.map((h, i) => (
                    <div
                      key={h.id}
                      className="bg-primary/70 rounded-t flex-1 min-w-[8px] max-w-[24px]"
                      style={{ height: `${Math.max(4, (h.composite_score_at_snapshot / 100) * 64)}px` }}
                      title={`${h.composite_score_at_snapshot.toFixed(1)} — ${new Date(h.created_at).toLocaleDateString()}`}
                    />
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Select an entity from the Index tab to view breakdown</p>
        )}
      </TabsContent>

      {/* ANTI-GAMING TAB */}
      <TabsContent value="gaming" className="space-y-4">
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2">
            {gamingFlags.map(flag => (
              <Card key={flag.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${flag.severity === "critical" || flag.severity === "high" ? "text-destructive" : "text-amber-500"}`} />
                    <div>
                      <p className="text-sm font-medium">{flag.flag_type}</p>
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                    </div>
                  </div>
                  <Badge variant={flag.severity === "critical" ? "destructive" : flag.severity === "high" ? "destructive" : "secondary"}>
                    {flag.severity}
                  </Badge>
                </div>
              </Card>
            ))}
            {gamingFlags.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">No gaming flags detected</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
