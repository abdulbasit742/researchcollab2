import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, TrendingUp, AlertTriangle, BarChart3, Users, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FacultyMonitorPage = () => {
  const { id: orgId } = useParams<{ id: string }>();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["faculty-monitor", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_enrollment_records")
        .select("*")
        .eq("institution_id", orgId || "");

      if (!data?.length) return [];

      const userIds = data.map((e: any) => e.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, department")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      return data.map((e: any) => ({
        ...e,
        name: profileMap.get(e.user_id)?.full_name || "Unknown",
        department: profileMap.get(e.user_id)?.department || "—",
      }));
    },
    enabled: !!orgId,
  });

  const { data: interventions = [] } = useQuery({
    queryKey: ["faculty-interventions", orgId],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_interventions")
        .select("*")
        .eq("institution_id", orgId || "")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!orgId,
  });

  const activeCount = enrollments.filter((e: any) => e.enrollment_status === "active").length;
  const avgActivation = enrollments.length
    ? Math.round(enrollments.reduce((s: number, e: any) => s + (e.activation_score || 0), 0) / enrollments.length)
    : 0;
  const avgProfile = enrollments.length
    ? Math.round(enrollments.reduce((s: number, e: any) => s + (e.profile_completion_pct || 0), 0) / enrollments.length)
    : 0;
  const withBid = enrollments.filter((e: any) => e.first_bid_at).length;
  const withDeal = enrollments.filter((e: any) => e.first_deal_at).length;

  const riskStudents = enrollments.filter(
    (e: any) => e.enrollment_status === "active" && (e.activation_score || 0) < 30
  );

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Faculty Monitor</h1>
            <p className="text-muted-foreground">Student performance, trust, and risk tracking</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ShieldCheck className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{avgProfile}%</p>
              <p className="text-xs text-muted-foreground">Avg Profile</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{withBid}</p>
              <p className="text-xs text-muted-foreground">First Bid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold text-destructive">{riskStudents.length}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="risk">Risk Flags ({interventions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader><CardTitle>Student Progress</CardTitle></CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground py-8 text-center">Loading...</p>
                ) : enrollments.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">No enrolled students yet.</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((e: any) => (
                      <div key={e.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{e.name}</p>
                          <p className="text-xs text-muted-foreground">{e.department}</p>
                        </div>
                        <div className="w-24">
                          <p className="text-xs text-muted-foreground mb-1">Profile</p>
                          <Progress value={e.profile_completion_pct} className="h-1.5" />
                        </div>
                        <div className="w-16 text-center">
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="font-semibold">{e.activation_score}</p>
                        </div>
                        <Badge variant={
                          e.first_deal_at ? "default" :
                          e.first_bid_at ? "secondary" : "outline"
                        }>
                          {e.first_deal_at ? "Deal" : e.first_bid_at ? "Bid" : "Onboarding"}
                        </Badge>
                        <Badge variant={
                          e.enrollment_status === "active" ? "default" :
                          e.enrollment_status === "inactive" ? "destructive" : "secondary"
                        }>
                          {e.enrollment_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardHeader><CardTitle>Intervention Alerts</CardTitle></CardHeader>
              <CardContent>
                {interventions.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">No pending interventions.</p>
                ) : (
                  <div className="space-y-3">
                    {interventions.map((i: any) => (
                      <div key={i.id} className="flex items-center gap-4 p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{i.intervention_type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(i.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {i.ai_nudge_sent && <Badge variant="secondary">AI Nudge Sent</Badge>}
                          {i.faculty_notified && <Badge variant="secondary">Faculty Notified</Badge>}
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
    </MainLayout>
  );
};

export default FacultyMonitorPage;
