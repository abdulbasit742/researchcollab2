import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

const mockStudents = [
  { name: "Fatima Ali", project: "AI-Powered Academic Integrity", progress: 60, status: "on_track", trust: 72, velocity: "high", risk: false },
  { name: "Hassan Raza", project: "Blockchain Credential Verification", progress: 15, status: "slow", trust: 45, velocity: "low", risk: true },
  { name: "Aisha Noor", project: "IoT Smart Campus Energy Monitor", progress: 100, status: "completed", trust: 88, velocity: "high", risk: false },
  { name: "Omar Farooq", project: "NLP-Based Student Feedback Analyzer", progress: 35, status: "on_track", trust: 60, velocity: "medium", risk: false },
  { name: "Zara Sheikh", project: "Cloud-Based Lab Booking System", progress: 20, status: "at_risk", trust: 38, velocity: "low", risk: true },
];

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  on_track: { color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2 },
  slow: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  at_risk: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle },
  completed: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
};

export default function SupervisorDashboardPage() {
  const active = mockStudents.filter(s => s.status !== "completed").length;
  const atRisk = mockStudents.filter(s => s.risk).length;
  const avgTrust = Math.round(mockStudents.reduce((s, st) => s + st.trust, 0) / mockStudents.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Supervisor Control Panel
          </h1>
          <p className="text-muted-foreground mt-1">Monitor student progress, risks, and trust growth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{mockStudents.length}</p><p className="text-sm text-muted-foreground">Total Students</p></div>
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
            <div className="space-y-4">
              {mockStudents.map((student, i) => {
                const cfg = statusConfig[student.status];
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
