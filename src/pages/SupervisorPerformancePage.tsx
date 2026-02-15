import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, TrendingUp, RotateCcw, AlertTriangle, Star, Loader2 } from "lucide-react";
import { useSupervisorMetrics } from "@/hooks/useAcademicData";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

export default function SupervisorPerformancePage() {
  const { user } = useAuth();
  const { data: dbMetrics, isLoading } = useSupervisorMetrics(user?.id);

  const metrics = dbMetrics ? {
    student_completion_rate: dbMetrics.student_completion_rate ?? 0,
    avg_trust_growth: dbMetrics.avg_trust_growth ?? 0,
    revision_ratio: dbMetrics.revision_ratio ?? 0,
    dispute_rate: dbMetrics.dispute_rate ?? 0,
    institutional_rating: dbMetrics.institutional_rating ?? 0,
  } : { student_completion_rate: 0, avg_trust_growth: 0, revision_ratio: 0, dispute_rate: 0, institutional_rating: 0 };

  if (isLoading) return <MainLayout><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"><Star className="h-8 w-8 text-primary" /> Supervisor Performance</h1>
          <p className="text-muted-foreground mt-1">Faculty-level accountability and impact metrics</p>
          {!dbMetrics && <p className="text-sm text-muted-foreground mt-2">No performance data found. Metrics will appear as you review student work.</p>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle2, label: "Completion Rate", value: `${metrics.student_completion_rate}%`, color: "text-green-500" },
            { icon: TrendingUp, label: "Avg Trust Growth", value: `+${metrics.avg_trust_growth}`, color: "text-blue-500" },
            { icon: RotateCcw, label: "Revision Ratio", value: `${metrics.revision_ratio}%`, color: "text-orange-500" },
            { icon: AlertTriangle, label: "Dispute Rate", value: `${metrics.dispute_rate}%`, color: "text-red-500" },
            { icon: Star, label: "Institutional Rating", value: `${metrics.institutional_rating}/5`, color: "text-yellow-500" },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-6 w-6 ${s.color}`} />
                <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
