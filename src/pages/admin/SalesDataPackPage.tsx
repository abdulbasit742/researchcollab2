import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useProofOfValue } from "@/hooks/useProofOfValue";
import { useReportExport } from "@/hooks/useReportExport";
import { PlatformImpactIndex } from "@/components/impact/PlatformImpactIndex";
import { UniversityImpactReport } from "@/components/reports/UniversityImpactReport";
import { GovernmentBriefReport } from "@/components/reports/GovernmentBriefReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/fyp/KPICard";
import { Building2, FileText, Globe, Printer, DollarSign, Users, CheckCircle, TrendingUp } from "lucide-react";
import { formatPKR } from "@/lib/currency";

export default function SalesDataPackPage() {
  const { data: metrics, isLoading } = useProofOfValue();
  const { exportToPDF } = useReportExport();
  const [activeTab, setActiveTab] = useState("university");

  if (isLoading || !metrics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">Computing metrics...</div>
      </AdminLayout>
    );
  }

  const handleExport = () => {
    const titles: Record<string, string> = {
      university: "University Pitch Data Pack",
      sponsor: "Sponsor ROI Summary",
      government: "Government Innovation Brief",
    };
    exportToPDF(titles[activeTab] || "Sales Data Pack");
  };

  return (
    <AdminLayout>
      <Helmet><title>Sales Data Pack | RCollab</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Sales Data Pack
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Export-ready impact data for stakeholders</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" />Export Current View
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="print:hidden">
            <TabsTrigger value="university"><Building2 className="h-4 w-4 mr-1" />University Pitch</TabsTrigger>
            <TabsTrigger value="sponsor"><DollarSign className="h-4 w-4 mr-1" />Sponsor Summary</TabsTrigger>
            <TabsTrigger value="government"><Globe className="h-4 w-4 mr-1" />Gov Brief</TabsTrigger>
          </TabsList>

          <TabsContent value="university" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Funded FYPs" value={String(metrics.total_funded_fyps)} icon={CheckCircle} />
              <KPICard title="Completion Rate" value={`${metrics.milestone_success_rate.toFixed(0)}%`} icon={TrendingUp} />
              <KPICard title="Hiring Conversions" value={String(metrics.total_hires)} icon={Users} />
              <KPICard title="Escrow Volume" value={formatPKR(metrics.total_escrow_volume)} icon={DollarSign} />
            </div>
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
          </TabsContent>

          <TabsContent value="sponsor" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <KPICard title="Sponsor Satisfaction" value={`${metrics.sponsor_satisfaction_score.toFixed(0)}%`} icon={TrendingUp} />
              <KPICard title="Repeat Rate" value={`${metrics.repeat_sponsor_rate.toFixed(0)}%`} icon={Users} />
              <KPICard title="Escrow Accuracy" value={`${metrics.escrow_accuracy_rate.toFixed(0)}%`} icon={CheckCircle} />
            </div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">ROI Summary</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Platform-wide sponsor ROI shows {metrics.milestone_success_rate.toFixed(0)}% project completion,
                {metrics.hiring_conversion_rate.toFixed(0)}% hiring conversion, and {metrics.repeat_sponsor_rate.toFixed(0)}% sponsor retention.
                Total escrow volume of {formatPKR(metrics.total_escrow_volume)} with {metrics.escrow_accuracy_rate.toFixed(0)}% accuracy rate.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="government" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Economic Output" value={formatPKR(metrics.total_escrow_volume)} icon={DollarSign} />
              <KPICard title="Employment Generated" value={`${metrics.total_hires} hires`} icon={Users} />
              <KPICard title="Innovation Index" value={metrics.platform_impact_index.toFixed(1)} icon={TrendingUp} />
              <KPICard title="Projects Funded" value={String(metrics.total_funded_fyps)} icon={CheckCircle} />
            </div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Innovation Impact Narrative</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                RCollab has facilitated {metrics.total_hires} direct employment conversions from academic projects,
                with {formatPKR(metrics.total_escrow_volume)} in escrow-backed funding across {metrics.total_funded_fyps} projects.
                The platform maintains a {metrics.milestone_success_rate.toFixed(0)}% milestone success rate and
                {metrics.escrow_accuracy_rate.toFixed(0)}% financial accuracy, contributing to a Platform Impact Index of {metrics.platform_impact_index.toFixed(1)}.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print-only reports */}
      <UniversityImpactReport ref={useRef(null)} institutionName="University" metrics={metrics} />
      <GovernmentBriefReport ref={useRef(null)} metrics={metrics} />
    </AdminLayout>
  );
}
