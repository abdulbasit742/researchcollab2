import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StudentProject {
  name: string;
  project: string;
  progress: number;
  status: string;
  trust: number;
  velocity: string;
  risk: boolean;
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  on_track: { color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  slow: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  at_risk: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
  completed: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
};

function deriveStatus(progress: number, milestoneCount: number, completedMilestones: number): string {
  if (progress >= 100) return "completed";
  if (milestoneCount > 0 && completedMilestones === 0 && progress < 20) return "at_risk";
  if (progress < 30) return "slow";
  return "on_track";
}

function deriveVelocity(progress: number, daysSinceCreation: number): string {
  if (daysSinceCreation === 0) return "medium";
  const rate = progress / daysSinceCreation;
  if (rate > 2) return "high";
  if (rate > 0.8) return "medium";
  return "low";
}

export default function SupervisorDashboardPage() {
  const { user } = useAuth();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["supervisor-students", user?.id],
    queryFn: async (): Promise<StudentProject[]> => {
      if (!user?.id) return [];

      // Get deals where user is supervisor/seller
      const { data: deals } = await (supabase as any)
        .from("deal_rooms")
        .select("id, title, status, buyer_id, seller_id, created_at")
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!deals || deals.length === 0) return [];

      // Get profiles for the other party
      const userIds = [...new Set(deals.map((d: any) => d.buyer_id === user.id ? d.seller_id : d.buyer_id).filter(Boolean))];
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map<string, { id: string; full_name: string }>((profiles || []).map((p: any) => [p.id, p]));

      return deals.map((deal: any) => {
        const otherId = deal.buyer_id === user.id ? deal.seller_id : deal.buyer_id;
        const profile = profileMap.get(otherId);
        const progress = deal.status === "completed" ? 100 : deal.status === "in_progress" ? 50 : 20;
        const daysSince = Math.max(1, Math.floor((Date.now() - new Date(deal.created_at).getTime()) / 86400000));
        const status = deal.status === "completed" ? "completed" : deriveStatus(progress, 0, 0);
        const velocity = deriveVelocity(progress, daysSince);

        return {
          name: profile?.full_name || "Unknown",
          project: deal.title || "Untitled Project",
          progress,
          status,
          trust: 50,
          velocity,
          risk: status === "at_risk" || status === "slow",
        };
      });
    },
    enabled: !!user?.id,
  });

  const active = students.filter(s => s.status !== "completed").length;
  const atRisk = students.filter(s => s.risk).length;
  const avgTrust = students.length > 0 ? Math.round(students.reduce((s, st) => s + st.trust, 0) / students.length) : 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Supervisor Control Panel
          </h1>
          <p className="text-muted-foreground mt-1">Monitor student progress, risks, and trust growth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{students.length}</p><p className="text-sm text-muted-foreground">Total Students</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div><p className="text-2xl font-bold">{active}</p><p className="text-sm text-muted-foreground">Active Projects</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div><p className="text-2xl font-bold">{atRisk}</p><p className="text-sm text-muted-foreground">At Risk</p></div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div><p className="text-2xl font-bold">{avgTrust}</p><p className="text-sm text-muted-foreground">Avg Trust Score</p></div>
            </div>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Student Progress</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : students.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {students.map((student, i) => {
                  const cfg = statusConfig[student.status] || statusConfig.on_track;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{student.name}</p>
                          {student.risk && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{student.project}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-32">
                          <Progress value={student.progress} />
                          <p className="text-xs text-muted-foreground text-center mt-1">{student.progress}%</p>
                        </div>
                        <Badge variant="outline" className={cfg.color}>
                          <Icon className="h-3 w-3 mr-1" />{student.status.replace("_", " ")}
                        </Badge>
                        <div className="text-center w-16">
                          <p className="text-sm font-bold">{student.trust}</p>
                          <p className="text-xs text-muted-foreground">Trust</p>
                        </div>
                        <Badge variant="outline" className={
                          student.velocity === "high" ? "text-green-600" :
                          student.velocity === "medium" ? "text-yellow-600" : "text-red-600"
                        }>{student.velocity}</Badge>
                        <Button size="sm" variant="outline">Details</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
