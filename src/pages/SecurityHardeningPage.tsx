import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Key, Eye, AlertTriangle, Users,
  Server, Brain, Gavel, FileWarning, Activity, CheckCircle2, XCircle,
  Clock, Fingerprint, Database, Globe, Bug, BookOpen, TrendingUp, Zap
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell,
} from "recharts";

// ── Section Data ──

const securitySections = [
  { id: 1, title: "Zero Trust Architecture", icon: Shield, status: "partial", score: 62 },
  { id: 2, title: "Identity & Auth Hardening", icon: Fingerprint, status: "partial", score: 55 },
  { id: 3, title: "Role-Based Access Control", icon: Users, status: "implemented", score: 78 },
  { id: 4, title: "Escrow Security Layer", icon: Lock, status: "implemented", score: 82 },
  { id: 5, title: "Encryption & Key Management", icon: Key, status: "partial", score: 48 },
  { id: 6, title: "Database Security", icon: Database, status: "implemented", score: 75 },
  { id: 7, title: "AI Model Protection", icon: Brain, status: "planned", score: 30 },
  { id: 8, title: "Fraud Detection Engine", icon: AlertTriangle, status: "partial", score: 58 },
  { id: 9, title: "Dispute & Arbitration Security", icon: Gavel, status: "partial", score: 45 },
  { id: 10, title: "Internal Security Controls", icon: Eye, status: "partial", score: 52 },
  { id: 11, title: "Security Monitoring", icon: Activity, status: "active", score: 65 },
  { id: 12, title: "Incident Response Plan", icon: FileWarning, status: "partial", score: 40 },
  { id: 13, title: "Regulatory Compliance", icon: Globe, status: "planned", score: 25 },
  { id: 14, title: "Business Continuity", icon: Server, status: "partial", score: 50 },
  { id: 15, title: "Penetration Testing", icon: Bug, status: "planned", score: 15 },
  { id: 16, title: "User Education", icon: BookOpen, status: "planned", score: 20 },
  { id: 17, title: "Security Maturity (3-Year)", icon: TrendingUp, status: "planned", score: 10 },
];

const overallScore = Math.round(securitySections.reduce((s, x) => s + x.score, 0) / securitySections.length);

const radarData = [
  { axis: "Auth", v: 55 }, { axis: "RBAC", v: 78 }, { axis: "Escrow", v: 82 },
  { axis: "Encryption", v: 48 }, { axis: "DB Security", v: 75 }, { axis: "AI Protect", v: 30 },
  { axis: "Fraud", v: 58 }, { axis: "Compliance", v: 25 },
];

const threatMonitor = [
  { type: "Failed Logins", count: 142, severity: "medium", trend: "↓ 12%" },
  { type: "Suspicious IPs", count: 8, severity: "high", trend: "↑ 3" },
  { type: "Escrow Anomalies", count: 0, severity: "clear", trend: "Stable" },
  { type: "Fraud Alerts", count: 3, severity: "medium", trend: "↓ 1" },
  { type: "Dispute Tampering", count: 0, severity: "clear", trend: "None" },
  { type: "AI Misuse", count: 1, severity: "low", trend: "New" },
  { type: "Admin Privilege Use", count: 24, severity: "info", trend: "Normal" },
  { type: "Data Exports", count: 7, severity: "info", trend: "Logged" },
];

const incidentTimeline = [
  { month: "Sep", incidents: 2, resolved: 2 },
  { month: "Oct", incidents: 1, resolved: 1 },
  { month: "Nov", incidents: 3, resolved: 3 },
  { month: "Dec", incidents: 0, resolved: 0 },
  { month: "Jan", incidents: 1, resolved: 1 },
  { month: "Feb", incidents: 1, resolved: 0 },
];

const rbacRoles = [
  { role: "Student", read: true, write: "own", financial: false, admin: false },
  { role: "Sponsor", read: true, write: "own", financial: "scoped", admin: false },
  { role: "Corporate Admin", read: true, write: "org", financial: "org", admin: false },
  { role: "University Admin", read: true, write: "org", financial: "view", admin: false },
  { role: "Faculty", read: true, write: "dept", financial: false, admin: false },
  { role: "Arbitration Panel", read: "dispute", write: "verdict", financial: false, admin: false },
  { role: "Internal Staff", read: true, write: "scoped", financial: "view", admin: "scoped" },
  { role: "AI Governance Auditor", read: "ai", write: false, financial: false, admin: false },
  { role: "Compliance Officer", read: true, write: "audit", financial: "view", admin: false },
  { role: "Founder", read: true, write: true, financial: true, admin: true },
  { role: "Board Observer", read: "reports", write: false, financial: "summary", admin: false },
];

const escrowChecks = [
  { check: "Multi-step authorization (large amounts)", status: "active" },
  { check: "Immutable transaction logs", status: "active" },
  { check: "Ledger reconciliation verification", status: "active" },
  { check: "Real-time anomaly detection", status: "partial" },
  { check: "Threshold-based manual review", status: "active" },
  { check: "Ledger/UI segregation", status: "active" },
  { check: "Anti double-spend logic", status: "active" },
  { check: "Escrow audit report generation", status: "partial" },
];

const fraudSignals = [
  { signal: "Fake milestone submissions", detection: "Pattern matching", risk: "high" },
  { signal: "Sponsor collusion", detection: "Network analysis", risk: "medium" },
  { signal: "Self-funding manipulation", detection: "Wallet graph", risk: "high" },
  { signal: "Trust score gaming", detection: "Velocity limits", risk: "medium" },
  { signal: "Repeated dispute abuse", detection: "Frequency tracking", risk: "low" },
  { signal: "Multi-account creation", detection: "Device fingerprint", risk: "high" },
  { signal: "IP mismatch fraud", detection: "Geo-velocity", risk: "medium" },
];

const complianceReadiness = [
  { standard: "GDPR-style Data Protection", ready: 60 },
  { standard: "Data Residency Compliance", ready: 35 },
  { standard: "AML/KYC Readiness", ready: 20 },
  { standard: "Corporate Audit", ready: 55 },
  { standard: "University Audit", ready: 50 },
  { standard: "Government Audit", ready: 25 },
  { standard: "Financial Compliance", ready: 45 },
  { standard: "SOC 2 Readiness", ready: 15 },
];

const incidentResponseSteps = [
  "Detect", "Contain", "Investigate", "Remediate", "Communicate", "Post-mortem", "System Patch", "Governance Review"
];

const maturityTargets = [
  { year: "Year 1", targets: ["SOC 2 gap analysis", "Internal controls documented", "Quarterly security reviews", "Escrow financial audit capability"] },
  { year: "Year 2", targets: ["External security audit", "Institutional-grade compliance", "Board-level security oversight", "Bug bounty program launch"] },
  { year: "Year 3", targets: ["SOC 2 certification", "AI governance transparency report", "Multi-region compliance", "Vulnerability disclosure program"] },
];

const COLORS = ["hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--primary))", "hsl(var(--destructive))"];

const severityBadge = (s: string) =>
  s === "high" ? "bg-destructive/20 text-destructive" :
  s === "medium" ? "bg-chart-4/20 text-chart-4" :
  s === "low" ? "bg-chart-2/20 text-chart-2" :
  s === "clear" ? "bg-chart-2/20 text-chart-2" :
  "bg-muted text-muted-foreground";

const statusBadge = (s: string) =>
  s === "implemented" || s === "active" ? "default" as const :
  s === "partial" ? "secondary" as const : "outline" as const;

const SecurityHardeningPage = () => {
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  const pieData = [
    { name: "Implemented", value: securitySections.filter(s => s.status === "implemented" || s.status === "active").length },
    { name: "Partial", value: securitySections.filter(s => s.status === "partial").length },
    { name: "Planned", value: securitySections.filter(s => s.status === "planned").length },
  ];

  return (
    <>
      <Helmet><title>Security Hardening | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">INTERNAL</Badge>
              <Badge className="bg-destructive/20 text-destructive text-xs">SECURITY CRITICAL</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Full-Spectrum Security Hardening
            </h1>
            <p className="text-muted-foreground mt-1">
              Enterprise-grade, government-ready, capital-safe infrastructure
            </p>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-primary">
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-primary">{overallScore}%</p>
                <p className="text-sm text-muted-foreground">Overall Security Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-chart-2">{securitySections.filter(s => s.status === "implemented" || s.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Sections Implemented</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-chart-4">{securitySections.filter(s => s.status === "partial").length}</p>
                <p className="text-sm text-muted-foreground">Partially Complete</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-4xl font-bold text-muted-foreground">{securitySections.filter(s => s.status === "planned").length}</p>
                <p className="text-sm text-muted-foreground">Planned</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full max-w-4xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="threats">Threat Monitor</TabsTrigger>
              <TabsTrigger value="rbac">RBAC</TabsTrigger>
              <TabsTrigger value="escrow">Escrow & Fraud</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="maturity">Maturity</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Security Posture Radar</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <Radar dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Implementation Status</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* All 17 Sections */}
              <Card>
                <CardHeader><CardTitle>17 Security Sections</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {securitySections.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedSection(selectedSection === s.id ? null : s.id)}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground text-sm">§{s.id} — {s.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24">
                            <Progress value={s.score} className="h-2" />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{s.score}%</span>
                          <Badge variant={statusBadge(s.status)}>
                            {s.status === "implemented" ? "DONE" : s.status === "active" ? "ACTIVE" : s.status === "partial" ? "PARTIAL" : "PLANNED"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* THREAT MONITOR */}
            <TabsContent value="threats" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Live Threat Monitor</CardTitle>
                  <p className="text-sm text-muted-foreground">Security must be observable</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {threatMonitor.map((t) => (
                      <div key={t.type} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">{t.type}</p>
                          <p className="text-2xl font-bold text-foreground">{t.count}</p>
                          <p className="text-xs text-muted-foreground">{t.trend}</p>
                        </div>
                        <Badge className={severityBadge(t.severity)}>
                          {t.severity.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Incident Timeline (6 Months)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={incidentTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="incidents" name="Incidents" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" name="Resolved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Incident Response */}
              <Card>
                <CardHeader><CardTitle>Incident Response Protocol</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {incidentResponseSteps.map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div className="px-3 py-2 rounded-lg border border-border bg-muted/30">
                          <p className="text-xs text-muted-foreground">Step {i + 1}</p>
                          <p className="font-medium text-foreground text-sm">{step}</p>
                        </div>
                        {i < incidentResponseSteps.length - 1 && <span className="text-muted-foreground">→</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RBAC */}
            <TabsContent value="rbac" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Role-Based Access Matrix</CardTitle>
                  <p className="text-sm text-muted-foreground">Each role has defined read/write permissions with no privilege creep</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-foreground font-medium">Role</th>
                          <th className="text-center py-3 px-2 text-foreground font-medium">Read</th>
                          <th className="text-center py-3 px-2 text-foreground font-medium">Write</th>
                          <th className="text-center py-3 px-2 text-foreground font-medium">Financial</th>
                          <th className="text-center py-3 px-2 text-foreground font-medium">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rbacRoles.map((r) => (
                          <tr key={r.role} className="border-b border-border/50">
                            <td className="py-3 px-2 font-medium text-foreground">{r.role}</td>
                            {[r.read, r.write, r.financial, r.admin].map((v, i) => (
                              <td key={i} className="text-center py-3 px-2">
                                {v === true ? <CheckCircle2 className="h-4 w-4 text-chart-2 mx-auto" /> :
                                 v === false ? <XCircle className="h-4 w-4 text-muted-foreground mx-auto" /> :
                                 <Badge variant="outline" className="text-xs">{String(v)}</Badge>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">All role changes are logged. No privilege creep permitted.</p>
                </CardContent>
              </Card>

              {/* Zero Trust Principles */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Zero Trust Principles</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "Never trust internal requests by default", active: true },
                      { label: "Verify every access request", active: true },
                      { label: "Enforce least-privilege access", active: true },
                      { label: "Time-bound privilege escalation", active: false },
                      { label: "Mandatory logging for sensitive access", active: true },
                      { label: "All API calls authenticated & authorized", active: true },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        {p.active ? <CheckCircle2 className="h-4 w-4 text-chart-2 shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <p className="text-sm text-foreground">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ESCROW & FRAUD */}
            <TabsContent value="escrow" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Escrow Security Checks</CardTitle>
                    <p className="text-sm text-muted-foreground">Escrow is highest-risk zone — integrity must be verifiable</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {escrowChecks.map((c) => (
                      <div key={c.check} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                          {c.status === "active" ? <CheckCircle2 className="h-4 w-4 text-chart-2" /> : <Clock className="h-4 w-4 text-chart-4" />}
                          <p className="text-sm text-foreground">{c.check}</p>
                        </div>
                        <Badge variant={c.status === "active" ? "default" : "secondary"}>
                          {c.status === "active" ? "ACTIVE" : "PARTIAL"}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Fraud Detection Signals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fraudSignals.map((f) => (
                      <div key={f.signal} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{f.signal}</p>
                          <p className="text-xs text-muted-foreground">{f.detection}</p>
                        </div>
                        <Badge className={severityBadge(f.risk)}>{f.risk.toUpperCase()}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Arbitration Security */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5" /> Dispute & Arbitration Security</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Blind review mode", done: false },
                      { label: "Decision timestamp hashing", done: true },
                      { label: "Arbitration log immutability", done: true },
                      { label: "No unilateral override", done: true },
                      { label: "Appeal audit trail", done: false },
                      { label: "Conflict-of-interest declaration", done: false },
                    ].map((a) => (
                      <div key={a.label} className="flex items-center gap-2 p-3 rounded-lg border border-border">
                        {a.done ? <CheckCircle2 className="h-4 w-4 text-chart-2" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                        <p className="text-sm text-foreground">{a.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* COMPLIANCE */}
            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Regulatory Compliance Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {complianceReadiness.map((c) => (
                    <div key={c.standard} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">{c.standard}</span>
                        <span className="text-muted-foreground">{c.ready}%</span>
                      </div>
                      <Progress value={c.ready} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Business Continuity */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Business Continuity</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Redundant infrastructure", done: true },
                      { label: "Failover environment", done: false },
                      { label: "Automated backup restoration test", done: false },
                      { label: "99.9% uptime target", done: true },
                      { label: "Escrow recovery plan", done: true },
                      { label: "Disaster simulation testing", done: false },
                    ].map((b) => (
                      <div key={b.label} className="flex items-center gap-2 p-3 rounded-lg border border-border">
                        {b.done ? <CheckCircle2 className="h-4 w-4 text-chart-2" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                        <p className="text-sm text-foreground">{b.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MATURITY */}
            <TabsContent value="maturity" className="space-y-6">
              {maturityTargets.map((m) => (
                <Card key={m.year}>
                  <CardHeader>
                    <CardTitle>{m.year} Security Targets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {m.targets.map((t) => (
                        <div key={t} className="flex items-center gap-2 p-3 rounded-lg border border-border">
                          <Zap className="h-4 w-4 text-primary shrink-0" />
                          <p className="text-sm text-foreground">{t}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Strategic Result */}
              <Card className="border-primary">
                <CardHeader><CardTitle>Strategic Result</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {["Capital-safe", "Identity-protected", "Fraud-resistant", "Escrow-secure", "AI-protected", "Audit-ready", "University-trustworthy", "Corporate-compliant", "Government-safe"].map((r) => (
                      <div key={r} className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-center">
                        <p className="text-sm font-medium text-foreground">{r}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-lg font-bold text-foreground">Security becomes competitive advantage.</p>
                    <p className="text-sm text-muted-foreground">Not feature. Not checkbox. Infrastructure.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SecurityHardeningPage;
