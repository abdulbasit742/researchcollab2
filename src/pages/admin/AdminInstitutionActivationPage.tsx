import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, Users, Zap, AlertTriangle, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const AdminInstitutionActivationPage = () => {
  const { data: scores = [] } = useQuery({
    queryKey: ["admin-inst-scores"],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_economic_scores")
        .select("*")
        .order("economic_output_score", { ascending: false });
      return data || [];
    },
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ["admin-inst-orgs"],
    queryFn: async () => {
      const { data } = await supabase.from("organizations").select("id, name");
      return data || [];
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["admin-inst-enrollments"],
    queryFn: async () => {
      const { data } = await supabase.from("institutional_enrollment_records").select("institution_id, enrollment_status, activation_score, first_bid_at, first_deal_at");
      return data || [];
    },
  });

  const { data: interventionCount = 0 } = useQuery({
    queryKey: ["admin-inst-interventions-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("institutional_interventions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      return count || 0;
    },
  });

  const orgMap = new Map(orgs.map((o: any) => [o.id, o.name]));

  // Aggregate per institution
  const instStats = new Map<string, { total: number; active: number; bids: number; deals: number; avgScore: number }>();
  enrollments.forEach((e: any) => {
    const s = instStats.get(e.institution_id) || { total: 0, active: 0, bids: 0, deals: 0, avgScore: 0 };
    s.total++;
    if (e.enrollment_status === "active") s.active++;
    if (e.first_bid_at) s.bids++;
    if (e.first_deal_at) s.deals++;
    s.avgScore += (e.activation_score || 0);
    instStats.set(e.institution_id, s);
  });

  const heatmapData = Array.from(instStats.entries()).map(([id, s]) => ({
    name: (orgMap.get(id) || "Unknown").substring(0, 15),
    activation: s.total > 0 ? Math.round((s.active / s.total) * 100) : 0,
    bidRate: s.total > 0 ? Math.round((s.bids / s.total) * 100) : 0,
    dealRate: s.total > 0 ? Math.round((s.deals / s.total) * 100) : 0,
  }));

  const totalInst = scores.length;
  const totalMembers = enrollments.length;
  const avgTrust = scores.length
    ? Math.round(scores.reduce((s: number, e: any) => s + Number(e.trust_score_average || 0), 0) / scores.length)
    : 0;

  const getColor = (val: number) => val >= 70 ? "hsl(var(--chart-2))" : val >= 40 ? "hsl(var(--chart-4))" : "hsl(var(--destructive))";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Institution Activation</h1>
            <p className="text-muted-foreground">Activation rate, revenue, retention, and risk per institution</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{totalInst}</p>
              <p className="text-xs text-muted-foreground">Institutions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{totalMembers}</p>
              <p className="text-xs text-muted-foreground">Total Enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{avgTrust}</p>
              <p className="text-xs text-muted-foreground">Avg Trust</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">
                {scores.reduce((s: number, e: any) => s + Number(e.total_deals || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold text-destructive">{interventionCount}</p>
              <p className="text-xs text-muted-foreground">Pending Alerts</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="heatmap">
          <TabsList>
            <TabsTrigger value="heatmap">Performance Heatmap</TabsTrigger>
            <TabsTrigger value="detail">Institution Detail</TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap">
            <Card>
              <CardHeader><CardTitle>Activation Rate by Institution</CardTitle></CardHeader>
              <CardContent>
                {heatmapData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No enrollment data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={heatmapData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="activation" name="Activation %">
                        {heatmapData.map((entry, i) => (
                          <Cell key={i} fill={getColor(entry.activation)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail">
            <div className="space-y-4">
              {scores.map((s: any) => {
                const stats = instStats.get(s.institution_id);
                const activationRate = stats && stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
                return (
                  <Card key={s.institution_id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{orgMap.get(s.institution_id) || "Unknown"}</h3>
                        <Badge variant={activationRate >= 70 ? "default" : activationRate >= 40 ? "secondary" : "destructive"}>
                          {activationRate}% Activated
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Economic Score</p>
                          <p className="font-bold text-lg">{Math.round(Number(s.economic_output_score))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Trust Avg</p>
                          <p className="font-bold text-lg">{Math.round(Number(s.trust_score_average))}</p>
                          <Progress value={Number(s.trust_score_average)} className="h-1 mt-1" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Deal Completion</p>
                          <p className="font-bold text-lg">{Math.round(Number(s.deal_completion_rate))}%</p>
                          <Progress value={Number(s.deal_completion_rate)} className="h-1 mt-1" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Members / Deals</p>
                          <p className="font-bold text-lg">{s.active_members} / {s.total_deals}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {scores.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No institutions with economic scores yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminInstitutionActivationPage;
