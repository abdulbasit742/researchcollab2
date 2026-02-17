import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, GraduationCap, Building2, Rocket, Users, TrendingUp, Shield } from "lucide-react";

const AdminCommandCenterPage = () => {
  const { data: countries } = useQuery({
    queryKey: ["cmd-countries"],
    queryFn: async () => {
      const { data } = await supabase.from("countries").select("*");
      return data || [];
    },
  });

  const { data: capitalPools } = useQuery({
    queryKey: ["cmd-capital-pools"],
    queryFn: async () => {
      const { data } = await supabase.from("capital_pools").select("*");
      return data || [];
    },
  });

  const { data: startups } = useQuery({
    queryKey: ["cmd-startups"],
    queryFn: async () => {
      const { data } = await supabase.from("startups").select("*");
      return data || [];
    },
  });

  const { data: corporates } = useQuery({
    queryKey: ["cmd-corporates"],
    queryFn: async () => {
      const { data } = await supabase.from("corporate_accounts").select("*");
      return data || [];
    },
  });

  const { data: partners } = useQuery({
    queryKey: ["cmd-partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("*");
      return data || [];
    },
  });

  const { data: innovationIndex } = useQuery({
    queryKey: ["cmd-innovation-index"],
    queryFn: async () => {
      const { data } = await supabase.from("national_innovation_index").select("*").order("computed_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: uniTiers } = useQuery({
    queryKey: ["cmd-uni-tiers"],
    queryFn: async () => {
      const { data } = await supabase.from("university_tiers").select("*");
      return data || [];
    },
  });

  const { data: impactLogs } = useQuery({
    queryKey: ["cmd-impact-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("economic_impact_logs").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const totalPoolCapital = (capitalPools || []).reduce((s, p) => s + Number(p.total_committed || 0), 0);
  const totalCorporateBudget = (corporates || []).reduce((s, c) => s + Number(c.annual_rnd_budget || 0), 0);
  const totalEconomicImpact = (impactLogs || []).reduce((s, l) => s + Number(l.amount || 0), 0);
  const tierACount = (uniTiers || []).filter(t => t.tier === "A").length;

  const kpis = [
    { icon: Activity, label: "Countries Active", value: (countries || []).length, color: "text-primary" },
    { icon: DollarSign, label: "Capital Pool Volume", value: `PKR ${(totalPoolCapital / 1000000).toFixed(1)}M`, color: "text-green-600" },
    { icon: Building2, label: "Corporate R&D Budget", value: `PKR ${(totalCorporateBudget / 1000000).toFixed(1)}M`, color: "text-blue-600" },
    { icon: Rocket, label: "Active Spin-Offs", value: (startups || []).length, color: "text-purple-600" },
    { icon: Users, label: "Partners", value: (partners || []).filter(p => p.approval_status === "approved").length, color: "text-amber-600" },
    { icon: GraduationCap, label: "Tier A Universities", value: tierACount, color: "text-emerald-600" },
    { icon: TrendingUp, label: "Economic Impact", value: `PKR ${(totalEconomicImpact / 1000000).toFixed(1)}M`, color: "text-rose-600" },
    { icon: Shield, label: "Innovation Index Avg", value: innovationIndex && innovationIndex.length > 0 ? Number(innovationIndex[0].composite_score || 0).toFixed(0) : "N/A", color: "text-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operational Command Center</h1>
            <p className="text-muted-foreground mt-1">Real-time national infrastructure overview</p>
          </div>
          <Badge variant="outline" className="text-xs">LIVE</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* University Tier Distribution */}
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg">University Tier Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {["A", "B", "C"].map(tier => {
                  const count = (uniTiers || []).filter(t => t.tier === tier).length;
                  return (
                    <div key={tier} className="flex-1 text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-foreground">{count}</p>
                      <p className="text-sm text-muted-foreground">Tier {tier}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Capital Pool Status */}
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg">Capital Pool Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {["raising", "active", "fully_allocated", "closed"].map(status => {
                  const count = (capitalPools || []).filter(p => p.lifecycle_status === status).length;
                  return (
                    <div key={status} className="flex-1 text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-foreground">{count}</p>
                      <p className="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Economic Events */}
          <Card className="border-border/50 md:col-span-2">
            <CardHeader><CardTitle className="text-lg">Recent Economic Impact Events</CardTitle></CardHeader>
            <CardContent>
              {(impactLogs || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No events logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(impactLogs || []).slice(0, 15).map(log => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{log.event_type.replace("_", " ")}</Badge>
                        <span className="text-sm text-muted-foreground">{log.sector || "General"}</span>
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
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenterPage;
