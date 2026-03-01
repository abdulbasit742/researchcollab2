import { useTenantAnalytics } from "@/hooks/useTenantAnalytics";
import { useComplianceHealth } from "@/hooks/useComplianceHealth";
import { useGovernanceStability, useExecutiveCapital, useExecutivePredictions, useDepartmentPerformance } from "@/hooks/useExecutiveMetrics";
import { useComplianceFlags } from "@/hooks/useComplianceFlags";
import { useBoardReportExports } from "@/hooks/useBoardReportExports";
import { useInstitutionEngagement } from "@/hooks/useInstitutionEngagement";
import { useInstitutionalMetrics } from "@/hooks/useInstitutionalMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3, TrendingUp, Shield, AlertTriangle, CheckCircle2,
  Download, Activity, Target, Clock, Users, Zap, FileText, Info,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, BarChart, Bar,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const INST_ID = "00000000-0000-0000-0000-000000000001";

const BOARD_REPORT_TYPES = [
  { type: "executive_summary", label: "Executive Summary" },
  { type: "kpi_snapshot", label: "KPI Snapshot" },
  { type: "governance_report", label: "Governance Report" },
  { type: "compliance_summary", label: "Compliance Summary" },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-destructive";
}

function trafficLight(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-destructive";
}

function KpiCard({ icon: Icon, label, value, subtitle, tooltip }: {
  icon: React.ElementType; label: string; value: string | number; subtitle?: string; tooltip?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
                </div>
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        {tooltip && <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ExecutiveOverviewPage() {
  const { user } = useAuth();
  const { data: analytics } = useTenantAnalytics(INST_ID);
  const { data: compliance } = useComplianceHealth(INST_ID);
  const { data: governance } = useGovernanceStability(INST_ID);
  const { data: capital } = useExecutiveCapital(INST_ID);
  const { data: predictions } = useExecutivePredictions(INST_ID);
  const { data: departments = [] } = useDepartmentPerformance(INST_ID);
  const { data: flags = [] } = useComplianceFlags(INST_ID);
  const { data: engagement } = useInstitutionEngagement(INST_ID);
  const { data: instMetrics = [] } = useInstitutionalMetrics(INST_ID);
  const { exports: boardExports, requestExport } = useBoardReportExports(INST_ID);

  // Audit executive dashboard access
  useEffect(() => {
    if (user?.id) {
      supabase.from("compliance_audit_log").insert({
        actor_id: user.id,
        action_type: "executive_dashboard_access",
        entity_type: "executive_dashboard",
        institution_id: INST_ID,
      });
    }
  }, [user?.id]);

  const criticalFlags = flags.filter((f) => f.severity === "critical" || f.severity === "high");

  // Trend data from institutional metrics
  const trendData = instMetrics
    .slice(0, 8)
    .reverse()
    .map((m: any) => ({
      period: m.period_start?.slice(0, 7) ?? "—",
      completion: m.completion_rate ?? 0,
      disputes: m.dispute_count ?? 0,
      engagement: m.engagement_index ?? 0,
    }));

  const handleExport = (type: string) => {
    requestExport(type);
    toast.success("Board report requested");
  };

  const stabilityScore = governance?.overall_stability_score ?? 0;
  const complianceScore = compliance?.overall_compliance_score ?? 0;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Executive Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Board-level institutional intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          {BOARD_REPORT_TYPES.slice(0, 2).map((r) => (
            <Button key={r.type} variant="outline" size="sm" onClick={() => handleExport(r.type)}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Target} label="Active Projects" value={analytics?.activeProjects ?? 0} tooltip="Projects with activity in the last 30 days" />
        <KpiCard icon={CheckCircle2} label="Completion Rate" value={`${analytics?.completionRate ?? 0}%`} tooltip="Percentage of milestones completed on time" />
        <KpiCard icon={Clock} label="Review Turnaround" value={`${(analytics?.reviewTurnaround ?? 0).toFixed(1)}d`} subtitle="Average days" tooltip="Mean time from submission to review completion" />
        <KpiCard icon={AlertTriangle} label="Dispute Ratio" value={`${((analytics?.disputeRatio ?? 0) * 100).toFixed(1)}%`} tooltip="Percentage of projects with active disputes" />
        <KpiCard icon={Users} label="Active Users (7d)" value={analytics?.activeUsers7d ?? 0} tooltip="Unique users with platform activity in last 7 days" />
        <KpiCard icon={Activity} label="Engagement Index" value={engagement?.active_users_7d ?? 0} subtitle="Weekly active" tooltip="Engagement velocity across the institution" />
        <KpiCard
          icon={Shield}
          label="Governance Stability"
          value={`${stabilityScore.toFixed(0)}/100`}
          tooltip="Composite governance health: dispute speed, review accountability, role integrity, anomaly rate"
        />
        <KpiCard
          icon={Zap}
          label="Compliance Health"
          value={`${complianceScore.toFixed(0)}/100`}
          tooltip="Overall compliance score: audit completeness, transparency, traceability"
        />
      </div>

      {/* Strategic Trends + Governance */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Strategic Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="period" className="text-[10px]" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-[10px]" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <RechartsTooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="completion" name="Completion %" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="engagement" name="Engagement" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">No trend data available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Governance Stability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Governance Stability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${trafficLight(stabilityScore)}`} />
                <span className={`text-3xl font-bold ${scoreColor(stabilityScore)}`}>
                  {stabilityScore.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stabilityScore >= 80 ? "Stable" : stabilityScore >= 50 ? "Needs Attention" : "At Risk"}
              </p>
            </div>
            <Separator />
            {governance ? (
              <div className="space-y-2.5">
                {[
                  { label: "Dispute Resolution Speed", value: governance.dispute_resolution_speed },
                  { label: "Review Accountability", value: governance.review_accountability_score },
                  { label: "Role Integrity", value: governance.role_integrity_score },
                  { label: "Audit Completeness", value: governance.audit_log_completeness },
                  { label: "Anomaly Rate", value: 100 - governance.anomaly_rate },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`font-medium ${scoreColor(item.value)}`}>{item.value.toFixed(0)}%</span>
                    </div>
                    <Progress value={item.value} className="h-1" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">No governance data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Capital Oversight + Risk Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Capital Oversight */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Capital Oversight</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">Aggregated funding metrics. No individual wallet or escrow data exposed.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {capital ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Milestones Funded", value: capital.total_milestones_funded },
                  { label: "Milestones Completed", value: capital.total_milestones_completed },
                  { label: "Funding Velocity", value: `${capital.funding_velocity_index.toFixed(1)}x` },
                  { label: "Release Efficiency", value: `${capital.release_efficiency_ratio.toFixed(0)}%` },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No capital data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Risk Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Risk Summary
              {criticalFlags.length > 0 && (
                <Badge variant="destructive" className="text-[10px]">{criticalFlags.length} critical</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalFlags.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No critical risks detected</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {criticalFlags.map((f) => (
                  <div key={f.id} className="flex items-start justify-between p-2.5 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{f.flag_type.replace(/_/g, " ")}</p>
                      {f.description && <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>}
                    </div>
                    <Badge
                      variant="outline"
                      className={f.severity === "critical" ? "border-destructive/40 text-destructive" : "border-amber-500/40 text-amber-600"}
                    >
                      {f.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Predictions + Department Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Predictive Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Predictive Insights</CardTitle>
              <Badge variant="secondary" className="text-[9px]">Advisory</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {predictions ? (
              <div className="space-y-4">
                {[
                  { label: "Completion Rate (Next Quarter)", value: predictions.predicted_completion_rate_next_quarter },
                  { label: "Dispute Risk", value: predictions.predicted_dispute_risk },
                  { label: "Engagement Trend", value: predictions.predicted_engagement_trend },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{p.label}</span>
                      <span className={`font-semibold ${scoreColor(p.value ?? 50)}`}>
                        {p.value != null ? `${p.value.toFixed(0)}%` : "—"}
                      </span>
                    </div>
                    <Progress value={p.value ?? 0} className="h-1.5" />
                  </div>
                ))}
                {predictions.confidence_score != null && (
                  <p className="text-[10px] text-muted-foreground text-right">
                    Confidence: {predictions.confidence_score.toFixed(0)}% · Advisory projection only
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No predictions available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Department Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Department Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departments.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={departments.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="department_name" className="text-[10px]" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-[10px]" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <RechartsTooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="completion_rate" name="Completion %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engagement_score" name="Engagement" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No department data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Board Report Exports */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Board Report Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {BOARD_REPORT_TYPES.map((r) => (
              <Button key={r.type} variant="outline" size="sm" onClick={() => handleExport(r.type)}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {r.label}
              </Button>
            ))}
          </div>
          {boardExports.length > 0 && (
            <>
              <Separator className="mb-3" />
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {boardExports.slice(0, 8).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-xs p-1.5">
                    <span className="text-foreground font-medium">{e.report_type.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={e.status === "completed" ? "border-emerald-500/30 text-emerald-600" : ""}>
                        {e.status}
                      </Badge>
                      <span className="text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
