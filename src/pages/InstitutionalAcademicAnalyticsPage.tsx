import { MainLayout } from "@/components/layout/MainLayout";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap, TrendingUp, AlertTriangle, DollarSign, Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function InstitutionalAcademicAnalyticsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: riskFlags, isLoading: loadingRisks } = useQuery({
    queryKey: ["inst-risk-flags", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("fyp_risk_flags").select("*").limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["inst-tasks", id],
    queryFn: async () => {
      let query = supabase.from("micro_academic_tasks").select("*");
      if (id) query = query.eq("institution_id", id);
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: reviews, isLoading: loadingReviews } = useQuery({
    queryKey: ["inst-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("supervisor_reviews").select("*").limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingRisks || loadingTasks || loadingReviews;

  // Compute skill demand from tasks
  const taskTypeCounts = (tasks || []).reduce((acc: Record<string, number>, t) => {
    acc[t.task_type || "other"] = (acc[t.task_type || "other"] || 0) + 1;
    return acc;
  }, {});
  const skillDemandData = Object.entries(taskTypeCounts).map(([name, value]) => ({ name: name.replace("_", " "), value }));

  // Risk severity distribution
  const riskSeverityCounts = (riskFlags || []).reduce((acc: Record<string, number>, f) => {
    acc[f.severity || "low"] = (acc[f.severity || "low"] || 0) + 1;
    return acc;
  }, {});
  const riskData = Object.entries(riskSeverityCounts).map(([name, value]) => ({ name, value }));

  // Faculty workload
  const reviewerCounts = (reviews || []).reduce((acc: Record<string, number>, r) => {
    const rid = r.reviewer_id?.slice(0, 8) || "unknown";
    acc[rid] = (acc[rid] || 0) + 1;
    return acc;
  }, {});
  const workloadData = Object.entries(reviewerCounts).map(([name, reviews]) => ({ name, reviews })).slice(0, 10);

  if (isLoading) return <MainLayout><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"><Building2 className="h-8 w-8 text-primary" /> Institutional Academic Analytics</h1>
          <p className="text-muted-foreground mt-1">Boardroom-ready academic performance overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{tasks?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{Object.keys(reviewerCounts).length}</p>
            <p className="text-sm text-muted-foreground">Active Supervisors</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{riskFlags?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Risk Flags</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{reviews?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Reviews Conducted</p>
          </CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Skill Demand Heatmap</CardTitle></CardHeader>
            <CardContent>
              {skillDemandData.length === 0 ? <p className="text-center text-muted-foreground py-8">No task data</p> : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={skillDemandData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {skillDemandData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Faculty Workload Balance</CardTitle></CardHeader>
            <CardContent>
              {workloadData.length === 0 ? <p className="text-center text-muted-foreground py-8">No review data</p> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reviews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Risk Severity Distribution</CardTitle></CardHeader>
            <CardContent>
              {riskData.length === 0 ? <p className="text-center text-muted-foreground py-8">No risk flags detected</p> : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
