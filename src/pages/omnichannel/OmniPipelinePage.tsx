import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, Users, DollarSign, TrendingUp, ChevronRight } from "lucide-react";
import { getLeads, getLeadStats, PIPELINE_STAGES, updateLead } from "@/lib/omnichannel/leadService";
import { toast } from "sonner";

export default function OmniPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineType, setPipelineType] = useState("all");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [l, s] = await Promise.all([getLeads(), getLeadStats()]);
      setLeads(l);
      setStats(s);
    } catch { toast.error("Failed to load pipeline data"); }
    finally { setLoading(false); }
  }

  async function moveLead(id: string, newStage: string) {
    try {
      await updateLead(id, { pipeline_stage: newStage });
      toast.success(`Moved to ${newStage.replace("_", " ")}`);
      loadData();
    } catch { toast.error("Failed to move lead"); }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pipeline Management</h1>
            <p className="text-sm text-muted-foreground">Multi-pipeline lead tracking across all revenue streams</p>
          </div>
        </div>
        {stats && (
          <div className="flex gap-3">
            <Card className="px-3 py-2"><p className="text-lg font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Leads</p></Card>
            <Card className="px-3 py-2"><p className="text-lg font-bold text-green-600">${(stats.totalPipelineValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Pipeline Value</p></Card>
            <Card className="px-3 py-2"><p className="text-lg font-bold">{(stats.avgConversionProbability * 100).toFixed(0)}%</p><p className="text-xs text-muted-foreground">Avg Conversion</p></Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="kanban">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <Select value={pipelineType} onValueChange={setPipelineType}>
            <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pipelines</SelectItem>
              <SelectItem value="institution">Institution</SelectItem>
              <SelectItem value="sponsor">Sponsor</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="dataset">Dataset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="kanban">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = leads.filter(l => l.pipeline_stage === stage);
              return (
                <div key={stage} className="min-w-[220px] flex-shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xs font-semibold capitalize">{stage.replace(/_/g, " ")}</h3>
                    <Badge variant="outline" className="text-[9px]">{stageLeads.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {stageLeads.map(l => (
                      <Card key={l.id} className="cursor-pointer hover:shadow-md transition">
                        <CardContent className="pt-3 pb-2 space-y-1">
                          <p className="text-sm font-medium truncate">{l.omni_contacts?.display_name || "Unknown"}</p>
                          <div className="flex justify-between text-[10px]">
                            <Badge variant="outline">{l.channel_source}</Badge>
                            <span className="text-muted-foreground">{l.omni_contacts?.lead_score || 0}pts</span>
                          </div>
                          {l.interest_domain && <p className="text-[10px] text-muted-foreground">{l.interest_domain}</p>}
                          {l.estimated_contract_value > 0 && <p className="text-[10px] font-medium text-green-600">${l.estimated_contract_value.toLocaleString()}</p>}
                          <div className="flex gap-1 mt-1">
                            {stage !== "converted" && stage !== "lost" && (
                              <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1" onClick={() => {
                                const idx = PIPELINE_STAGES.indexOf(stage);
                                if (idx < PIPELINE_STAGES.length - 3) moveLead(l.id, PIPELINE_STAGES[idx + 1]);
                              }}>
                                <ChevronRight className="h-3 w-3" /> Advance
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {leads.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">{l.omni_contacts?.display_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{l.omni_contacts?.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{l.pipeline_stage?.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">{l.channel_source}</Badge>
                      {l.estimated_contract_value > 0 && <span className="text-xs font-medium text-green-600">${l.estimated_contract_value.toLocaleString()}</span>}
                      <span className="text-xs text-muted-foreground">{(l.conversion_probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && Object.entries(stats.byStage).map(([stage, count]) => (
              <Card key={stage}>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">{count as number}</p>
                  <p className="text-xs text-muted-foreground capitalize">{stage.replace(/_/g, " ")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {Object.entries(stats.byChannel).map(([ch, count]) => (
                <Card key={ch}>
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{count as number}</p>
                    <p className="text-xs text-muted-foreground">{ch}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
