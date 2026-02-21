import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/fyp/KPICard";
import { PlatformImpactIndex } from "@/components/impact/PlatformImpactIndex";
import { UniversityImpactReport } from "@/components/reports/UniversityImpactReport";
import { useProofOfValue } from "@/hooks/useProofOfValue";
import { useReportExport } from "@/hooks/useReportExport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, CheckCircle, Users, TrendingUp, Building2,
  GraduationCap, Printer, Target, Shield
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

export default function UniversityImpactDashboardPage() {
  const { data: metrics, isLoading } = useProofOfValue();
  const { exportToPDF } = useReportExport();
  const reportRef = useRef<HTMLDivElement>(null);

  if (isLoading || !metrics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Computing impact metrics...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>University Impact | RCollab</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              University Impact Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Institutional value from verified FYP execution data</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportToPDF("University Impact Report")} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard title="Total Funded FYPs" value={String(metrics.total_funded_fyps)} icon={GraduationCap} />
          <KPICard title="Escrow Volume" value={formatPKR(metrics.total_escrow_volume)} icon={DollarSign} />
          <KPICard title="Completion Rate" value={`${metrics.milestone_success_rate.toFixed(0)}%`} icon={CheckCircle} trend="up" />
          <KPICard title="Hiring Rate" value={`${metrics.hiring_conversion_rate.toFixed(0)}%`} icon={Users} />
          <KPICard title="Sponsor Satisfaction" value={`${metrics.sponsor_satisfaction_score.toFixed(0)}%`} icon={Target} />
          <KPICard title="Total Hires" value={String(metrics.total_hires)} icon={TrendingUp} />
        </div>

        {/* Platform Impact Index */}
        <PlatformImpactIndex
          index={metrics.platform_impact_index}
          breakdown={{
            escrowVolume: Math.min(100, (metrics.total_escrow_volume / 5000000) * 100),
            completionRate: metrics.milestone_success_rate,
            hiringConversion: metrics.hiring_conversion_rate,
            sponsorRetention: metrics.repeat_sponsor_rate,
            trustStability: Math.min(100, metrics.student_completion_rate),
          }}
        />

        {/* Key Metrics Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Detailed Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Avg Time to Funding", value: `${metrics.time_to_funding_days.toFixed(1)} days` },
                { label: "Avg Time to Completion", value: `${metrics.time_to_completion_days.toFixed(1)} days` },
                { label: "Escrow Accuracy", value: `${metrics.escrow_accuracy_rate.toFixed(1)}%` },
                { label: "Trust Delta Avg", value: metrics.trust_delta_avg > 0 ? `+${metrics.trust_delta_avg.toFixed(2)}` : metrics.trust_delta_avg.toFixed(2) },
                { label: "Repeat Sponsor Rate", value: `${metrics.repeat_sponsor_rate.toFixed(1)}%` },
                { label: "Student Completion", value: `${metrics.student_completion_rate.toFixed(1)}%` },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-bold font-mono">{m.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-only report */}
      <UniversityImpactReport ref={reportRef} institutionName="University" metrics={metrics} />
    </AdminLayout>
  );
}
