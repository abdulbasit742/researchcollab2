import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { KPICard } from "@/components/fyp/KPICard";
import { CareerTrajectoryGraph } from "@/components/outcomes/CareerTrajectoryGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Briefcase, TrendingUp, Award, GraduationCap } from "lucide-react";
import { formatPKR } from "@/lib/currency";

export default function StudentOutcomePage() {
  const { user } = useAuth();

  const { data: impactMetrics } = useQuery({
    queryKey: ["student-impact", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("fyp_impact_metrics")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: hirings } = useQuery({
    queryKey: ["student-hirings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("hiring_conversions")
        .select("*")
        .eq("student_id", user!.id);
      return data ?? [];
    },
  });

  const { data: trustEvents } = useQuery({
    queryKey: ["student-trust-events", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("trust_events")
        .select("delta, created_at, reason")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(50);
      return data ?? [];
    },
  });

  const funded = impactMetrics?.funded_projects ?? 0;
  const completed = impactMetrics?.milestones_completed ?? 0;
  const earnings = impactMetrics?.total_earnings ?? 0;
  const onTime = impactMetrics?.on_time_pct ?? 0;
  const hiredRecord = (hirings ?? []).find((h: any) => h.hired);

  // Build trajectory data from trust events
  const trajectoryData = (trustEvents ?? []).map((e: any, i: number) => ({
    label: `M${i + 1}`,
    trustScore: (trustEvents ?? []).slice(0, i + 1).reduce((s: number, t: any) => s + Number(t.delta || 0), 50),
    earnings: Math.round((earnings / Math.max(1, trustEvents?.length ?? 1)) * (i + 1) / 1000),
    milestones: Math.min(completed, i + 1),
  }));

  return (
    <>
      <Helmet>
        <title>My Outcomes | RCollab</title>
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              My Outcomes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Your career trajectory powered by verified project data</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Funding Received" value={formatPKR(earnings)} icon={DollarSign} trend="up" trendValue={`${funded} projects`} />
            <KPICard title="Milestones Completed" value={String(completed)} icon={CheckCircle} trend="up" trendValue={`${onTime.toFixed(0)}% on-time`} />
            <KPICard title="Trust Growth" value={trustEvents && trustEvents.length > 0 ? `+${trustEvents.reduce((s: number, t: any) => s + Number(t.delta || 0), 0).toFixed(1)}` : "—"} icon={TrendingUp} />
            <KPICard title="Hiring Status" value={hiredRecord ? "✓ Hired" : "Seeking"} icon={Briefcase} trend={hiredRecord ? "up" : "neutral"} trendValue={hiredRecord?.role_title || ""} />
          </div>

          {/* Career Trajectory Graph */}
          <CareerTrajectoryGraph data={trajectoryData} />

          {/* Hiring Details */}
          {hirings && hirings.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Hiring Conversions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hirings.map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{h.role_title || "Role not specified"}</p>
                        <p className="text-xs text-muted-foreground">{h.salary_band || "Salary not disclosed"}</p>
                      </div>
                      <Badge variant={h.hired ? "default" : "outline"}>
                        {h.hired ? "Hired" : h.offer_made ? "Offer Made" : "In Process"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
