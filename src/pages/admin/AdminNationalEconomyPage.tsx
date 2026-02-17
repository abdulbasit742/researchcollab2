import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Users, Rocket, BarChart3, Globe, GraduationCap } from "lucide-react";

const AdminNationalEconomyPage = () => {
  const { data: impactLogs } = useQuery({
    queryKey: ["econ-impact"],
    queryFn: async () => {
      const { data } = await supabase.from("economic_impact_logs").select("*").order("created_at", { ascending: false }).limit(500);
      return data || [];
    },
  });

  const { data: lifecycles } = useQuery({
    queryKey: ["econ-lifecycle"],
    queryFn: async () => {
      const { data } = await supabase.from("lifecycle_progressions").select("*");
      return data || [];
    },
  });

  const { data: innovationIndex } = useQuery({
    queryKey: ["econ-index"],
    queryFn: async () => {
      const { data } = await supabase.from("national_innovation_index").select("*").order("computed_at", { ascending: false });
      return data || [];
    },
  });

  const totalCapital = (impactLogs || []).filter(l => l.event_type === "funding" || l.event_type === "capital_allocation").reduce((s, l) => s + Number(l.amount || 0), 0);
  const totalEarnings = (impactLogs || []).filter(l => l.event_type === "escrow_release").reduce((s, l) => s + Number(l.amount || 0), 0);
  const totalHires = (impactLogs || []).filter(l => l.event_type === "employment_hire").length;
  const totalSpinoffs = (impactLogs || []).filter(l => l.event_type === "spinoff_created").length;

  const stages = ["student", "project_contributor", "project_lead", "hired_professional", "founder", "employer", "sponsor", "capital_contributor"];

  // Sector breakdown
  const sectorMap = new Map<string, number>();
  (impactLogs || []).forEach(l => {
    const sector = l.sector || "Unknown";
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + Number(l.amount || 0));
  });
  const topSectors = Array.from(sectorMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">National Economy Dashboard</h1>
          <p className="text-muted-foreground mt-1">Education-to-Economy operating system analytics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Capital Deployed", value: `PKR ${(totalCapital / 1000000).toFixed(1)}M` },
            { icon: TrendingUp, label: "Student Earnings", value: `PKR ${(totalEarnings / 1000000).toFixed(1)}M` },
            { icon: Users, label: "Jobs Created", value: totalHires },
            { icon: Rocket, label: "Startups Created", value: totalSpinoffs },
          ].map((kpi, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="lifecycle">
          <TabsList>
            <TabsTrigger value="lifecycle">Lifecycle Mobility</TabsTrigger>
            <TabsTrigger value="sectors">Sector Intelligence</TabsTrigger>
            <TabsTrigger value="innovation">Innovation Index</TabsTrigger>
            <TabsTrigger value="impact">Impact Ledger</TabsTrigger>
          </TabsList>

          <TabsContent value="lifecycle" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Economic Lifecycle Progression</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {stages.map(stage => {
                    const count = (lifecycles || []).filter(l => l.current_stage === stage).length;
                    return (
                      <div key={stage} className="flex-1 text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xl font-bold text-foreground">{count}</p>
                        <p className="text-[10px] text-muted-foreground capitalize leading-tight">{stage.replace(/_/g, " ")}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Avg Mobility Score: <span className="font-semibold text-foreground">{(lifecycles || []).length > 0 ? ((lifecycles || []).reduce((s, l) => s + Number(l.mobility_score || 0), 0) / (lifecycles || []).length).toFixed(1) : "N/A"}</span></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Sector Intelligence</CardTitle></CardHeader>
              <CardContent>
                {topSectors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No sector data available.</p>
                ) : (
                  <div className="space-y-3">
                    {topSectors.map(([sector, amount], i) => (
                      <div key={sector} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                          <span className="text-sm font-medium text-foreground">{sector}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">PKR {(amount / 1000000).toFixed(2)}M</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="innovation" className="mt-4 space-y-4">
            {(innovationIndex || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No innovation index computed yet.</CardContent></Card>
            ) : (innovationIndex || []).map(idx => (
              <Card key={idx.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> National Innovation Index</h3>
                    <Badge variant="outline" className="text-lg font-bold">{Number(idx.composite_score || 0).toFixed(0)}</Badge>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                    {[
                      { label: "Funding", value: `PKR ${(Number(idx.total_funding || 0) / 1000000).toFixed(1)}M` },
                      { label: "Student Income", value: `PKR ${(Number(idx.student_income || 0) / 1000000).toFixed(1)}M` },
                      { label: "Hiring Rate", value: `${Number(idx.hiring_rate || 0).toFixed(0)}%` },
                      { label: "Startups", value: idx.startup_creation || 0 },
                      { label: "Diversification", value: `${Number(idx.sector_diversification || 0).toFixed(0)}%` },
                      { label: "Regional Balance", value: `${Number(idx.regional_balance || 0).toFixed(0)}%` },
                    ].map((m, i) => (
                      <div key={i} className="text-center p-2 rounded bg-muted/50">
                        <p className="font-semibold text-foreground">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Computed: {new Date(idx.computed_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="impact" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg">Economic Impact Ledger</CardTitle></CardHeader>
              <CardContent>
                {(impactLogs || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No impact events recorded.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(impactLogs || []).slice(0, 30).map(log => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{log.event_type.replace(/_/g, " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{log.entity_type}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">PKR {Number(log.amount || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminNationalEconomyPage;
