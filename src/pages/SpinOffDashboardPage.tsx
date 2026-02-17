import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, PieChart, Users, TrendingUp, Shield, DollarSign } from "lucide-react";

const stageOrder = ["idea", "prototype", "validated", "incorporated", "fundraising", "scaling", "exit"];
const stageColors: Record<string, string> = {
  idea: "bg-muted text-muted-foreground",
  prototype: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  validated: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  incorporated: "bg-primary/10 text-primary",
  fundraising: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  exit: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const SpinOffDashboardPage = () => {
  const { data: startups } = useQuery({
    queryKey: ["startups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("startups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: capTables } = useQuery({
    queryKey: ["cap-tables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cap_tables").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: investors } = useQuery({
    queryKey: ["investor-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investor_accounts").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["cap-table-audits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cap_table_audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const totalStartups = (startups || []).length;
  const totalFollowOn = (startups || []).reduce((s, st) => s + Number(st.follow_on_funding || 0), 0);
  const totalHires = (startups || []).reduce((s, st) => s + (st.hiring_count || 0), 0);
  const verifiedInvestors = (investors || []).filter(i => i.verified).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Spin-Off & Equity Engine</h1>
          <p className="text-muted-foreground mt-1">Startup origination infrastructure</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Rocket, label: "Total Spin-Offs", value: totalStartups },
            { icon: DollarSign, label: "Follow-On Funding", value: `PKR ${(totalFollowOn / 1000000).toFixed(1)}M` },
            { icon: Users, label: "Jobs Created", value: totalHires },
            { icon: Shield, label: "Verified Investors", value: verifiedInvestors },
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

        {/* Incubation Funnel */}
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Incubation Lifecycle</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {stageOrder.map(stage => {
                const count = (startups || []).filter(s => s.incubation_status === stage).length;
                return (
                  <div key={stage} className="flex-1 text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{stage}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="startups">
          <TabsList>
            <TabsTrigger value="startups">Startups</TabsTrigger>
            <TabsTrigger value="equity">Cap Tables</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="audit">Equity Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="startups" className="space-y-4 mt-4">
            {(startups || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No spin-offs created yet.</CardContent></Card>
            ) : (startups || []).map(startup => (
              <Card key={startup.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />{startup.name}
                    </h3>
                    <Badge className={stageColors[startup.incubation_status] || ""}>{startup.incubation_status}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm mt-3">
                    <div><p className="text-muted-foreground">Eligibility</p><p className="font-semibold text-foreground">{Number(startup.eligibility_score || 0).toFixed(0)}%</p></div>
                    <div><p className="text-muted-foreground">Revenue</p><p className="font-semibold text-foreground">PKR {Number(startup.revenue || 0).toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Follow-On</p><p className="font-semibold text-foreground">PKR {Number(startup.follow_on_funding || 0).toLocaleString()}</p></div>
                    <div><p className="text-muted-foreground">Hires</p><p className="font-semibold text-foreground">{startup.hiring_count || 0}</p></div>
                  </div>
                  {startup.platform_equity_pct > 0 && (
                    <p className="text-xs text-primary mt-2">Platform equity: {Number(startup.platform_equity_pct).toFixed(1)}%</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="equity" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChart className="h-4 w-4" /> Equity Distribution</CardTitle></CardHeader>
              <CardContent>
                {(capTables || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No cap table entries.</p>
                ) : (
                  <div className="space-y-2">
                    {(capTables || []).map(entry => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{entry.stakeholder_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground capitalize">{entry.stakeholder_role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{Number(entry.equity_percentage).toFixed(2)}%</p>
                          <Badge variant={entry.confirmed ? "default" : "outline"} className="text-xs">{entry.confirmed ? "Confirmed" : "Pending"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investors" className="space-y-4 mt-4">
            {(investors || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No investor accounts.</CardContent></Card>
            ) : (investors || []).map(inv => (
              <Card key={inv.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground capitalize">{inv.investor_type} Investor</p>
                      <p className="text-xs text-muted-foreground">Focus: {(inv.investment_focus || []).join(", ") || "General"}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={inv.verified ? "default" : "outline"}>{inv.verified ? "Verified" : "Pending"}</Badge>
                      <p className="text-sm font-semibold text-foreground mt-1">PKR {Number(inv.total_invested || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg">Equity Audit Trail</CardTitle></CardHeader>
              <CardContent>
                {(auditLogs || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No equity changes logged.</p>
                ) : (
                  <div className="space-y-2">
                    {(auditLogs || []).map(log => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.legal_reference || "No reference"}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {log.previous_equity != null && <span>{Number(log.previous_equity).toFixed(2)}% → {Number(log.new_equity).toFixed(2)}%</span>}
                          <p>{new Date(log.created_at).toLocaleDateString()}</p>
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

export default SpinOffDashboardPage;
