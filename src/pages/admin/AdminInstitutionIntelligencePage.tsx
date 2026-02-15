import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2, TrendingUp, Users, DollarSign, Shield, AlertTriangle,
  CheckCircle, Clock, Eye, XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface Application {
  id: string;
  institution_name: string;
  country: string;
  domain_focus: string;
  contact_email: string;
  estimated_members: number;
  status: string;
  created_at: string;
}

const AdminInstitutionIntelligencePage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, orgsRes, rewardsRes] = await Promise.all([
        supabase.from("institution_applications" as any).select("id, institution_name, country, domain_focus, contact_email, estimated_members, status, created_at").order("created_at", { ascending: false }),
        supabase.from("organizations").select("id, name, type, status, total_spent, member_limit, created_at").order("created_at", { ascending: false }),
        supabase.from("institution_rewards" as any).select("id, institution_id, reward_type, trigger_type, title, is_active, awarded_at").order("awarded_at", { ascending: false }).limit(50),
      ]);
      setApplications((appsRes.data || []) as unknown as Application[]);
      setOrganizations(orgsRes.data || []);
      setRewards((rewardsRes.data || []) as unknown as any[]);
    } catch (err) {
      console.error("Error fetching institution data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const updates: any = { status: action, reviewed_at: new Date().toISOString() };
      if (action === "approved") {
        updates.institution_code = `INST-${Date.now().toString(36).toUpperCase()}`;
      }
      const { error } = await supabase.from("institution_applications" as any).update(updates).eq("id", id);
      if (error) throw error;
      toast.success(`Application ${action}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const pendingApps = applications.filter(a => a.status === "pending");
  const approvedApps = applications.filter(a => a.status === "approved");
  const totalRevenue = organizations.reduce((s, o) => s + (o.total_spent || 0), 0);
  const activeOrgs = organizations.filter(o => o.status === "active").length;

  const countryDistribution = organizations.reduce((acc: Record<string, number>, o) => {
    const key = o.type || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = Object.entries(countryDistribution).map(([name, value]) => ({ name, value }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Institution Intelligence</h1>
          <p className="text-muted-foreground">Monitor institutional growth, revenue, and engagement</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs">Total Institutions</span>
              </div>
              <p className="text-2xl font-bold">{organizations.length}</p>
              <p className="text-xs text-muted-foreground">{activeOrgs} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold">PKR {totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Pending Applications</span>
              </div>
              <p className="text-2xl font-bold">{pendingApps.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Active Rewards</span>
              </div>
              <p className="text-2xl font-bold">{rewards.filter(r => r.is_active).length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications">
          <TabsList className="mb-6">
            <TabsTrigger value="applications">
              Applications {pendingApps.length > 0 && <Badge variant="destructive" className="ml-2">{pendingApps.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <div className="space-y-4">
              {pendingApps.length === 0 && (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No pending applications</CardContent></Card>
              )}
              {pendingApps.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{app.institution_name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span>{app.country}</span>
                          <span>•</span>
                          <span>{app.domain_focus}</span>
                          <span>•</span>
                          <span>{app.estimated_members} est. members</span>
                        </div>
                        <p className="text-sm mt-1">{app.contact_email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Button size="sm" variant="outline" onClick={() => handleApplicationAction(app.id, "rejected")}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApplicationAction(app.id, "approved")}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {approvedApps.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Recently Approved</h3>
                  {approvedApps.slice(0, 5).map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{app.institution_name}</p>
                          <p className="text-sm text-muted-foreground">{app.country} • {app.domain_focus}</p>
                        </div>
                        <Badge variant="default">Approved</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Institution Types</CardTitle></CardHeader>
                <CardContent>
                  {typeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {typeChartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No data yet</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Application Funnel</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Applications</span>
                        <span className="font-semibold">{applications.length}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Approved</span>
                        <span className="font-semibold">{approvedApps.length}</span>
                      </div>
                      <Progress value={applications.length ? (approvedApps.length / applications.length) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pending</span>
                        <span className="font-semibold">{pendingApps.length}</span>
                      </div>
                      <Progress value={applications.length ? (pendingApps.length / applications.length) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="space-y-4">
              {rewards.length === 0 && (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No rewards issued yet</CardContent></Card>
              )}
              {rewards.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline">{r.reward_type}</Badge>
                        <Badge variant="secondary">{r.trigger_type}</Badge>
                      </div>
                    </div>
                    <Badge variant={r.is_active ? "default" : "secondary"}>
                      {r.is_active ? "Active" : "Expired"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader><CardTitle>Campus Leaderboard</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Campus leaderboard data is computed from institutional member activity. 
                  As institutions onboard and members complete deals, rankings will populate here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminInstitutionIntelligencePage;
