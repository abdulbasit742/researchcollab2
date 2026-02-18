import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Briefcase, Shield, Users, TrendingUp, DollarSign, CheckCircle2, Star, FileText, Lock } from "lucide-react";
import { formatPKR } from "@/lib/currency";

const SAMPLE_FYPS = [
  { title: "AI-Powered Crop Disease Detection", dept: "Computer Science", sponsor: "AgriTech Solutions", budget: 75000, status: "funded", progress: 65, student: "Ahmed R.", supervisor: "Dr. Fatima K." },
  { title: "Smart Water Monitoring IoT System", dept: "Electrical Engineering", sponsor: "CityWater Corp", budget: 60000, status: "funded", progress: 40, student: "Sara M.", supervisor: "Dr. Usman A." },
  { title: "Blockchain Supply Chain Tracker", dept: "Software Engineering", sponsor: "LogiPak Ltd", budget: 80000, status: "milestone", progress: 80, student: "Hassan T.", supervisor: "Dr. Nadia S." },
  { title: "ML-Based Fraud Detection System", dept: "Data Science", sponsor: "SecureBank", budget: 90000, status: "completed", progress: 100, student: "Ayesha K.", supervisor: "Dr. Imran H." },
  { title: "Renewable Energy Dashboard", dept: "Electrical Engineering", sponsor: "GreenPower Inc", budget: 55000, status: "funded", progress: 20, student: "Bilal F.", supervisor: "Dr. Amna R." },
];

const SAMPLE_ESCROW = [
  { id: "ESC-001", project: "AI-Powered Crop Disease Detection", amount: 75000, status: "locked", date: "2026-01-15" },
  { id: "ESC-002", project: "Smart Water Monitoring IoT System", amount: 60000, status: "locked", date: "2026-01-18" },
  { id: "ESC-003", project: "Blockchain Supply Chain Tracker", amount: 40000, status: "released", date: "2026-02-01" },
  { id: "ESC-004", project: "ML-Based Fraud Detection System", amount: 90000, status: "released", date: "2026-02-10" },
];

const SAMPLE_HIRING = [
  { student: "Ayesha K.", company: "SecureBank", role: "Junior ML Engineer", salary: "PKR 120K/mo", outcome: "hired" },
  { student: "Hassan T.", company: "LogiPak Ltd", role: "Blockchain Developer", salary: "PKR 100K/mo", outcome: "interview" },
];

export default function UniversityDemoPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              University Demo Mode
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Live preview with sample data — use in meetings</p>
          </div>
          <Badge variant="warning">DEMO DATA</Badge>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active FYPs", value: "5", icon: FileText },
            { label: "Funded Projects", value: "4", icon: DollarSign },
            { label: "Escrow Volume", value: formatPKR(265000), icon: Lock },
            { label: "Hiring Cases", value: "2", icon: Users },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="fyps">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="fyps">FYPs</TabsTrigger>
            <TabsTrigger value="escrow">Escrow</TabsTrigger>
            <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
            <TabsTrigger value="trust">Trust Scores</TabsTrigger>
            <TabsTrigger value="hiring">Hiring</TabsTrigger>
          </TabsList>

          <TabsContent value="fyps" className="space-y-3 mt-4">
            {SAMPLE_FYPS.map((fyp) => (
              <Card key={fyp.title}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{fyp.title}</h3>
                      <p className="text-xs text-muted-foreground">{fyp.dept} · {fyp.student} · Supervisor: {fyp.supervisor}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={fyp.status === "completed" ? "success" : fyp.status === "milestone" ? "info" : "secondary"} className="text-[10px]">
                          {fyp.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-medium text-primary">{formatPKR(fyp.budget)}</span>
                        <span className="text-xs text-muted-foreground">by {fyp.sponsor}</span>
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <p className="text-xs text-muted-foreground mb-1">{fyp.progress}%</p>
                      <Progress value={fyp.progress} className="h-1.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="escrow" className="space-y-3 mt-4">
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-bold text-sm">Escrow Secured — Funds Locked</p>
                  <p className="text-xs text-muted-foreground">Total Processed: {formatPKR(265000)} · Zero Errors · Avg Release: 2.3 days</p>
                </div>
              </CardContent>
            </Card>
            {SAMPLE_ESCROW.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{e.id} — {e.project}</p>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatPKR(e.amount)}</p>
                    <Badge variant={e.status === "released" ? "success" : "info"} className="text-[10px]">{e.status.toUpperCase()}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="supervisor" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Supervisor Dashboard Preview</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {SAMPLE_FYPS.slice(0, 3).map((fyp) => (
                  <div key={fyp.title} className="p-3 rounded-lg border bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{fyp.title}</p>
                        <p className="text-xs text-muted-foreground">Student: {fyp.student}</p>
                      </div>
                      <Badge variant={fyp.progress >= 80 ? "success" : fyp.progress >= 40 ? "warning" : "secondary"} className="text-[10px]">
                        {fyp.progress >= 80 ? "On Track" : fyp.progress >= 40 ? "Needs Attention" : "Early Stage"}
                      </Badge>
                    </div>
                    <Progress value={fyp.progress} className="h-1.5 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">Milestone {Math.ceil(fyp.progress / 25)}/4 · Next review: Mar 2026</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Ahmed R.", score: 72, tier: "Verified", trend: "+5" },
                { name: "Sara M.", score: 65, tier: "Verified", trend: "+3" },
                { name: "Hassan T.", score: 88, tier: "Trusted", trend: "+12" },
                { name: "Ayesha K.", score: 94, tier: "Exemplary", trend: "+8" },
              ].map((s) => (
                <Card key={s.name}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{s.name}</p>
                        <Badge variant="outline" className="text-[10px]">{s.tier}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{s.score}</p>
                      <p className="text-xs text-emerald-600">↑ {s.trend}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hiring" className="space-y-3 mt-4">
            {SAMPLE_HIRING.map((h) => (
              <Card key={h.student}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">{h.student} → {h.company}</p>
                      <p className="text-xs text-muted-foreground">{h.role} · {h.salary}</p>
                    </div>
                  </div>
                  <Badge variant={h.outcome === "hired" ? "success" : "warning"}>{h.outcome.toUpperCase()}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
