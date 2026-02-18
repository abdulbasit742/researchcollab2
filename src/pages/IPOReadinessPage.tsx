import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/currency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend
} from "recharts";
import {
  Shield, TrendingUp, Users, FileCheck, AlertTriangle,
  DollarSign, Building2, Scale, Eye, Lock
} from "lucide-react";

function useFinancialReports() {
  return useQuery({
    queryKey: ["financial-reporting-periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_reporting_periods")
        .select("*")
        .order("start_date", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useBoardGovernance() {
  return useQuery({
    queryKey: ["board-governance-matrix"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("board_governance_matrix")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useAuditItems() {
  return useQuery({
    queryKey: ["audit-preparation-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_preparation_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useRiskDisclosures() {
  return useQuery({
    queryKey: ["risk-disclosures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_disclosures")
        .select("*")
        .order("severity_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useIPOKpis() {
  return useQuery({
    queryKey: ["ipo-kpi-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ipo_kpi_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: true })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
}

const RISK_CATEGORIES = [
  "Regulatory", "Political", "AI Model", "Data Breach", "Capital Concentration",
  "Market Adoption", "International Expansion", "Government Dependency",
  "Corporate Dependency", "Reputation"
];

const AUDIT_TYPES = [
  { key: "financial", label: "Financial Audit", icon: DollarSign },
  { key: "escrow", label: "Escrow Integrity", icon: Lock },
  { key: "arbitration", label: "Arbitration Fairness", icon: Scale },
  { key: "ai_bias", label: "AI Bias Audit", icon: Eye },
  { key: "data_privacy", label: "Data Privacy", icon: Shield },
  { key: "security", label: "Security Audit", icon: Shield },
];

const DISCLOSURE_PUBLIC = [
  "Revenue metrics", "High-level GMV", "Growth rates", "Node count",
  "Enterprise contracts (aggregated)", "Government partnerships (selective)"
];
const DISCLOSURE_PROTECTED = [
  "AI weighting models", "Capital allocation formulas", "Survival model internals",
  "Arbitration case records", "Sensitive cross-node data"
];

// Mock data for demo
const mockFinancials = [
  { period: "Q1 2026", revenue: 2400000, cogs: 960000, grossMargin: 60, opMargin: 25, ebitda: 720000 },
  { period: "Q2 2026", revenue: 3100000, cogs: 1178000, grossMargin: 62, opMargin: 28, ebitda: 992000 },
  { period: "Q3 2026", revenue: 4200000, cogs: 1512000, grossMargin: 64, opMargin: 31, ebitda: 1470000 },
  { period: "Q4 2026", revenue: 5500000, cogs: 1870000, grossMargin: 66, opMargin: 34, ebitda: 2090000 },
];

const mockRiskRadar = RISK_CATEGORIES.map((cat, i) => ({
  category: cat.split(" ")[0],
  severity: [6, 7, 5, 8, 4, 6, 7, 3, 5, 6][i],
  probability: [4, 5, 6, 3, 5, 7, 4, 6, 4, 5][i],
}));

const mockKpiTrend = [
  { month: "Jul", gmv: 12, arr: 1.2, takeRate: 7.5 },
  { month: "Aug", gmv: 15, arr: 1.4, takeRate: 7.8 },
  { month: "Sep", gmv: 18, arr: 1.7, takeRate: 8.0 },
  { month: "Oct", gmv: 22, arr: 2.1, takeRate: 8.2 },
  { month: "Nov", gmv: 28, arr: 2.6, takeRate: 8.5 },
  { month: "Dec", gmv: 35, arr: 3.2, takeRate: 8.7 },
];

export default function IPOReadinessPage() {
  const { data: reports } = useFinancialReports();
  const { data: board } = useBoardGovernance();
  const { data: auditItems } = useAuditItems();
  const { data: risks } = useRiskDisclosures();
  const { data: kpis } = useIPOKpis();

  const auditCompleted = auditItems?.filter(a => a.status === "completed").length ?? 0;
  const auditTotal = auditItems?.length || AUDIT_TYPES.length;
  const auditProgress = auditTotal > 0 ? (auditCompleted / auditTotal) * 100 : 0;

  const boardFilled = board?.length ?? 0;
  const boardTarget = 5;

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            IPO-Readiness Architecture
          </h1>
          <p className="text-muted-foreground mt-1">
            Governance hardening · Financial transparency · Public market discipline
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1 border-amber-500 text-amber-600">
          Structural Preparation Phase
        </Badge>
      </div>

      {/* Readiness Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><DollarSign className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Financial Reports</p>
                <p className="text-2xl font-bold">{reports?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Board Seats Filled</p>
                <p className="text-2xl font-bold">{boardFilled}/{boardTarget}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><FileCheck className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Audit Readiness</p>
                <p className="text-2xl font-bold">{Math.round(auditProgress)}%</p>
              </div>
            </div>
            <Progress value={auditProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Active Risks</p>
                <p className="text-2xl font-bold">{risks?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financials" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="financials">Financial Reporting</TabsTrigger>
          <TabsTrigger value="governance">Board Governance</TabsTrigger>
          <TabsTrigger value="audit">Audit Preparation</TabsTrigger>
          <TabsTrigger value="risk">Risk Disclosures</TabsTrigger>
          <TabsTrigger value="kpis">Public Market KPIs</TabsTrigger>
          <TabsTrigger value="disclosure">Disclosure Control</TabsTrigger>
          <TabsTrigger value="capital">Capital Protection</TabsTrigger>
        </TabsList>

        {/* FINANCIALS TAB */}
        <TabsContent value="financials" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Quarterly Revenue & EBITDA</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockFinancials}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis tickFormatter={v => `${(v/1e6).toFixed(1)}M`} className="text-xs" />
                    <Tooltip formatter={(v: number) => formatPKR(v)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    <Bar dataKey="ebitda" name="EBITDA" fill="hsl(var(--accent))" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Margin Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockFinancials}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis unit="%" className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="grossMargin" name="Gross Margin %" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="opMargin" name="Operating Margin %" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-lg">GAAP Compliance Checklist</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Revenue Recognition", "Escrow Liability Separation", "Deferred Revenue", "Multi-Currency Normalization",
                  "OpEx Categorization", "Segment P&L", "Cash Flow Statement", "Burn Multiple Tracking"].map(item => (
                  <div key={item} className="flex items-center gap-2 p-2 rounded border border-border">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GOVERNANCE TAB */}
        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Board Composition Target</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Founder-Chair", type: "founder", filled: true },
                  { title: "Independent Director (Finance)", type: "independent", filled: false },
                  { title: "Independent Director (Technology)", type: "independent", filled: false },
                  { title: "Independent Director (Regulatory)", type: "independent", filled: false },
                  { title: "Investor Representative", type: "investor", filled: false },
                ].map(seat => (
                  <div key={seat.title} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{seat.title}</span>
                    </div>
                    <Badge variant={seat.filled ? "default" : "outline"}>
                      {seat.filled ? "Filled" : "Open"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Committee Structure</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Audit Committee", "Compensation Committee", "Risk Committee"].map(c => (
                  <div key={c} className="p-4 rounded-lg border border-border text-center">
                    <p className="font-semibold">{c}</p>
                    <p className="text-xs text-muted-foreground mt-1">Requires 2+ independent directors</p>
                    <Badge variant="outline" className="mt-2">Pending Formation</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT TAB */}
        <TabsContent value="audit" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIT_TYPES.map(audit => {
              const Icon = audit.icon;
              return (
                <Card key={audit.key}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{audit.label}</span>
                    </div>
                    <Progress value={Math.random() * 60 + 20} className="h-1.5 mb-2" />
                    <p className="text-xs text-muted-foreground">Auto-generates logs, breakdowns, and version history</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* RISK TAB */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Risk Severity vs Probability</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={mockRiskRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar name="Severity" dataKey="severity" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
                  <Radar name="Probability" dataKey="probability" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPIs TAB */}
        <TabsContent value="kpis" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Public Market KPI Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockKpiTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gmv" name="GMV (M)" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="arr" name="Intelligence ARR (M)" stroke="hsl(var(--accent))" strokeWidth={2} />
                  <Line type="monotone" dataKey="takeRate" name="Take Rate %" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Net Revenue Retention", value: "118%" },
              { label: "Churn Rate", value: "3.2%" },
              { label: "CAC Payback", value: "6.4 mo" },
              { label: "LTV/CAC", value: "5.8x" },
              { label: "Dispute Rate", value: "2.1%" },
              { label: "Startup Survival", value: "72%" },
              { label: "Employment Conv.", value: "34%" },
              { label: "Data Moat Index", value: "847" },
            ].map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold mt-1">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* DISCLOSURE TAB */}
        <TabsContent value="disclosure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-4 w-4" /> Public Post-IPO</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DISCLOSURE_PUBLIC.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-4 w-4" /> Protected / Confidential</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DISCLOSURE_PROTECTED.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CAPITAL PROTECTION TAB */}
        <TabsContent value="capital" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Capital Structure Protection</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Dual-Class Share Structure", desc: "Super-voting founder shares preserve strategic control" },
                  { title: "Foundation Veto Power", desc: "Protocol amendments require Foundation approval" },
                  { title: "Escrow Independence", desc: "Escrow & arbitration logic cannot be overridden by investors" },
                  { title: "AI Governance Charter", desc: "AI governance remains independent of capital influence" },
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">IPO Path Decision Checkpoint</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {["IPO", "Direct Listing", "Infrastructure SPAC", "Sovereign Wealth", "Remain Private"].map(path => (
                  <div key={path} className="p-3 rounded-lg border border-border text-center">
                    <p className="text-sm font-medium">{path}</p>
                    <Badge variant="outline" className="mt-2 text-xs">Evaluate at 3+ yrs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
