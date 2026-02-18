import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Flame, BarChart3, Target, Trophy, Shield, Users, GraduationCap, Briefcase, TrendingUp, AlertTriangle, DollarSign, CheckCircle2 } from "lucide-react";

// ── Section 4: Live Traction Metrics ──
const TRACTION_METRICS = [
  { label: "Universities Contacted", current: 8, icon: GraduationCap },
  { label: "Universities Onboarded", current: 3, icon: CheckCircle2 },
  { label: "Corporate Meetings Booked", current: 14, icon: Briefcase },
  { label: "Corporate Sponsors Active", current: 6, icon: Users },
  { label: "FYPs Created", current: 72, icon: Target },
  { label: "FYPs Funded", current: 34, icon: DollarSign },
  { label: "Escrow Volume (PKR)", current: 1750000, icon: Shield, format: "currency" },
  { label: "Milestones Completed", current: 48, icon: CheckCircle2 },
  { label: "Disputes", current: 2, icon: AlertTriangle },
  { label: "Revenue (PKR)", current: 140000, icon: TrendingUp, format: "currency" },
];

// ── Section 5: First 100 Campaign ──
const FUNDED_FYP_TARGET = 100;
const FUNDED_FYP_CURRENT = 34;

const TOP_SPONSORS = [
  { name: "TechCorp Pakistan", funded: 8, amount: 400000 },
  { name: "InnovatePK", funded: 6, amount: 300000 },
  { name: "DigitalBridge Labs", funded: 5, amount: 250000 },
  { name: "FutureWorks", funded: 4, amount: 200000 },
  { name: "CodeCraft Solutions", funded: 3, amount: 150000 },
];

const TOP_STUDENTS = [
  { name: "Ahmed K.", score: 92, projects: 3 },
  { name: "Sara M.", score: 89, projects: 2 },
  { name: "Ali R.", score: 87, projects: 2 },
  { name: "Fatima Z.", score: 85, projects: 2 },
  { name: "Usman T.", score: 83, projects: 1 },
];

const fmt = (v: number, f?: string) =>
  f === "currency" ? `PKR ${(v / 1000).toFixed(0)}K` : v.toLocaleString();

export default function TractionDashboardPage() {
  const [tab, setTab] = useState("traction");
  const [pilotMode, setPilotMode] = useState(true);
  const campaignPct = Math.min(100, (FUNDED_FYP_CURRENT / FUNDED_FYP_TARGET) * 100);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary" />
              Traction Mode
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sales & adoption engine — close real deals, show real proof
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Section 3: Pilot Mode Toggle */}
            <div className="flex items-center gap-2 p-2 px-3 rounded-lg border bg-muted/30">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Pilot Mode</span>
              <Switch checked={pilotMode} onCheckedChange={setPilotMode} />
            </div>
            {pilotMode && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                60-Day Free Pilot Active
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid">
            <TabsTrigger value="traction" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Live Traction</TabsTrigger>
            <TabsTrigger value="campaign" className="gap-1"><Trophy className="h-3.5 w-3.5" /> First 100 FYPs</TabsTrigger>
            <TabsTrigger value="escrow" className="gap-1"><Shield className="h-3.5 w-3.5" /> Escrow Trust</TabsTrigger>
          </TabsList>

          {/* Section 4: Live Traction */}
          <TabsContent value="traction" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TRACTION_METRICS.map((m) => {
                const Icon = m.icon;
                return (
                  <Card key={m.label}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{fmt(m.current, (m as any).format)}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 60-Day Targets */}
            <Card className="mt-6 bg-muted/30 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">60-Day Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Universities Onboarded", current: 3, target: 3 },
                    { label: "Active Sponsors", current: 6, target: 10 },
                    { label: "Funded FYPs", current: 34, target: 100 },
                    { label: "Hiring Cases", current: 2, target: 5 },
                  ].map((t) => {
                    const pct = Math.min(100, (t.current / t.target) * 100);
                    const met = t.current >= t.target;
                    return (
                      <div key={t.label} className="p-3 rounded-lg border bg-background">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{t.label}</span>
                          {met && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        </div>
                        <p className="text-lg font-bold">{t.current}/{t.target}</p>
                        <Progress value={pct} className="h-1.5 mt-1" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section 5: First 100 FYP Campaign */}
          <TabsContent value="campaign" className="mt-6 space-y-4">
            {/* Progress */}
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    First 100 Funded FYPs Campaign
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-lg px-3 py-1">
                    {FUNDED_FYP_CURRENT}/{FUNDED_FYP_TARGET}
                  </Badge>
                </div>
                <Progress value={campaignPct} className="h-4 rounded-full" />
                <p className="text-xs text-muted-foreground mt-2">
                  {FUNDED_FYP_TARGET - FUNDED_FYP_CURRENT} more funded FYPs to reach the target
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sponsor Recognition */}
              <Card>
                <CardHeader><CardTitle className="text-base">🏆 Top Sponsors</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {TOP_SPONSORS.map((s, i) => (
                      <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary w-5">#{i + 1}</span>
                          <span className="text-sm font-medium">{s.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">{s.funded} FYPs · PKR {(s.amount / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student Leaderboard */}
              <Card>
                <CardHeader><CardTitle className="text-base">⭐ Top Students</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {TOP_STUDENTS.map((s, i) => (
                      <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary w-5">#{i + 1}</span>
                          <span className="text-sm font-medium">{s.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">Score: {s.score} · {s.projects} projects</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Section 7: Escrow Confidence */}
          <TabsContent value="escrow" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-emerald-500/20">
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-base px-4 py-1.5 mb-2">
                    Escrow Secured — Funds Locked
                  </Badge>
                  <p className="text-xs text-muted-foreground">All deposits protected by milestone-based release</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-primary">PKR 1.75M</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Escrow Processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-emerald-600">0</p>
                  <p className="text-sm text-muted-foreground mt-1">Escrow Errors (Zero-Error)</p>
                  <Badge variant="outline" className="mt-2">Avg Release: 2.3 days</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
