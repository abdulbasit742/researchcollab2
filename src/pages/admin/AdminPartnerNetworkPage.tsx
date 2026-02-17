import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Key, DollarSign, Shield, BarChart3 } from "lucide-react";

const accessLabels: Record<number, string> = { 1: "Read-Only", 2: "Operational", 3: "Financial", 4: "Strategic" };

const AdminPartnerNetworkPage = () => {
  const { data: partners } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: apiKeys } = useQuery({
    queryKey: ["admin-api-keys"],
    queryFn: async () => {
      const { data } = await supabase.from("partner_api_keys").select("*");
      return data || [];
    },
  });

  const { data: revenue } = useQuery({
    queryKey: ["admin-partner-revenue"],
    queryFn: async () => {
      const { data } = await supabase.from("partner_revenue_logs").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
  });

  const approved = (partners || []).filter(p => p.approval_status === "approved").length;
  const pending = (partners || []).filter(p => p.approval_status === "pending").length;
  const totalRevenue = (revenue || []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const activeKeys = (apiKeys || []).filter(k => k.status === "active").length;

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-destructive/10 text-destructive",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partner Network</h1>
          <p className="text-muted-foreground mt-1">Controlled integration ecosystem</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Handshake, label: "Approved Partners", value: approved },
            { icon: Shield, label: "Pending Review", value: pending },
            { icon: Key, label: "Active API Keys", value: activeKeys },
            { icon: DollarSign, label: "Partner Revenue", value: `PKR ${(totalRevenue / 1000).toFixed(0)}K` },
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

        <Tabs defaultValue="partners">
          <TabsList>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4 mt-4">
            {(partners || []).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No partners registered.</CardContent></Card>
            ) : (partners || []).map(partner => (
              <Card key={partner.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{partner.partner_name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{partner.partner_type} · Access Level {partner.access_level} ({accessLabels[partner.access_level] || "Unknown"})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[partner.approval_status] || ""}>{partner.approval_status}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm mt-2">
                    <div><p className="text-muted-foreground">Integration</p><p className="font-medium text-foreground text-xs">{partner.integration_scope || "N/A"}</p></div>
                    <div><p className="text-muted-foreground">Revenue Model</p><p className="font-medium text-foreground text-xs">{partner.revenue_share_model}</p></div>
                    <div><p className="text-muted-foreground">Compliance</p><p className="font-medium text-foreground text-xs">{Number(partner.compliance_score || 0).toFixed(0)}%</p></div>
                    <div><p className="text-muted-foreground">Performance</p><p className="font-medium text-foreground text-xs">{Number(partner.performance_score || 0).toFixed(0)}%</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="keys" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Key className="h-4 w-4" /> API Key Management</CardTitle></CardHeader>
              <CardContent>
                {(apiKeys || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No API keys issued.</p>
                ) : (
                  <div className="space-y-2">
                    {(apiKeys || []).map(key => (
                      <div key={key.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <p className="text-sm font-mono text-foreground">{key.api_key.substring(0, 12)}...{key.api_key.slice(-4)}</p>
                          <p className="text-xs text-muted-foreground">Rate limit: {key.rate_limit}/hr · Calls: {key.total_calls || 0}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={key.status === "active" ? "default" : "destructive"}>{key.status}</Badge>
                          {key.expiration_date && <p className="text-xs text-muted-foreground mt-1">Expires: {new Date(key.expiration_date).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Revenue Logs</CardTitle></CardHeader>
              <CardContent>
                {(revenue || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No revenue logged.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {(revenue || []).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <Badge variant="outline" className="text-xs">{r.revenue_type}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{r.period_start} – {r.period_end}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">PKR {Number(r.amount).toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">{r.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-4 w-4" /> Partner Compliance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(partners || []).filter(p => p.approval_status === "approved").map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.partner_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.partner_type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{Number(p.compliance_score || 0).toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">Compliance</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{Number(p.performance_score || 0).toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">Performance</p>
                        </div>
                        <Badge variant={p.compliance_status === "compliant" ? "default" : "destructive"}>{p.compliance_status}</Badge>
                      </div>
                    </div>
                  ))}
                  {(partners || []).filter(p => p.approval_status === "approved").length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No approved partners to monitor.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPartnerNetworkPage;
