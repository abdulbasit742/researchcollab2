import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, TrendingUp, RotateCcw, AlertTriangle, Star } from "lucide-react";

const metrics = {
  student_completion_rate: 87,
  avg_trust_growth: 22,
  revision_ratio: 18,
  dispute_rate: 3,
  institutional_rating: 4.5,
  total_students: 12,
};

const students = [
  { name: "Fatima Ali", project: "AI-Powered Academic Integrity", progress: 60, trust: 45, risk: false },
  { name: "Hassan Raza", project: "Blockchain Credential Verification", progress: 20, trust: 32, risk: true },
  { name: "Aisha Noor", project: "IoT Smart Campus Monitor", progress: 100, trust: 68, risk: false },
  { name: "Omar Farooq", project: "NLP for Urdu Sentiment Analysis", progress: 45, trust: 38, risk: false },
];

export default function SupervisorPerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><Star className="h-8 w-8 text-primary" /> Supervisor Performance</h1>
          <p className="text-muted-foreground mt-1">Faculty-level accountability and impact metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: CheckCircle2, label: "Completion Rate", value: `${metrics.student_completion_rate}%`, color: "text-green-500" },
            { icon: TrendingUp, label: "Avg Trust Growth", value: `+${metrics.avg_trust_growth}`, color: "text-blue-500" },
            { icon: RotateCcw, label: "Revision Ratio", value: `${metrics.revision_ratio}%`, color: "text-orange-500" },
            { icon: AlertTriangle, label: "Dispute Rate", value: `${metrics.dispute_rate}%`, color: "text-red-500" },
            { icon: Star, label: "Institutional Rating", value: `${metrics.institutional_rating}/5`, color: "text-yellow-500" },
            { icon: Users, label: "Total Students", value: metrics.total_students, color: "text-primary" },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-6 w-6 ${s.color}`} />
                <div><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Student Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {students.map(s => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{s.name}</p>
                    {s.risk && <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">At Risk</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.project}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Trust: {s.trust}</p>
                    <Progress value={s.progress} className="w-24 mt-1" />
                  </div>
                  <Badge variant="outline">{s.progress}%</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
