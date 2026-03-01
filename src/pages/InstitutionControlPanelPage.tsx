import { useTenantAnalytics } from "@/hooks/useTenantAnalytics";
import { useInstitutionSettings } from "@/hooks/useInstitutionSettings";
import { useTenantExports } from "@/hooks/useTenantExports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Users, Briefcase, CheckCircle2, Clock, AlertTriangle,
  Brain, Eye, BarChart3, Bell, Globe, Download, FileText, Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Placeholder — in production, derive from user's org membership
const DEMO_INSTITUTION_ID = "00000000-0000-0000-0000-000000000001";

const FEATURE_FLAGS = [
  { key: "ai_assistance", label: "AI Assistance", icon: Brain },
  { key: "public_profiles", label: "Public Profiles", icon: Eye },
  { key: "advanced_analytics", label: "Advanced Analytics", icon: BarChart3 },
  { key: "engagement_nudges", label: "Engagement Nudges", icon: Bell },
  { key: "public_discovery", label: "Public Discovery", icon: Globe },
  { key: "external_collaboration", label: "External Collaboration", icon: Users },
];

const EXPORT_TYPES = [
  { type: "project_summary", label: "Project Summary CSV" },
  { type: "milestone_performance", label: "Milestone Performance" },
  { type: "user_performance", label: "User Performance" },
  { type: "engagement_report", label: "Engagement Report" },
  { type: "audit_summary", label: "Audit Summary" },
];

export default function InstitutionControlPanelPage() {
  const institutionId = DEMO_INSTITUTION_ID;
  const { data: analytics, isLoading: analyticsLoading } = useTenantAnalytics(institutionId);
  const { settings, isLoading: settingsLoading, updateSettings, isFeatureEnabled } = useInstitutionSettings(institutionId);
  const { exports, requestExport } = useTenantExports(institutionId);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = (key: string, current: boolean) => {
    setToggling(key);
    const flags = { ...(settings?.feature_flags ?? {}), [key]: !current };
    updateSettings({ feature_flags: flags });
    toast.success(`${key.replace(/_/g, " ")} ${!current ? "enabled" : "disabled"}`);
    setTimeout(() => setToggling(null), 500);
  };

  const handleExport = (type: string) => {
    requestExport(type);
    toast.success("Export requested — processing");
  };

  const metricCards = [
    { icon: Users, label: "Active Users (7d)", value: analytics?.activeUsers7d ?? 0 },
    { icon: Users, label: "Active Users (30d)", value: analytics?.activeUsers30d ?? 0 },
    { icon: Briefcase, label: "Active Projects", value: analytics?.activeProjects ?? 0 },
    { icon: CheckCircle2, label: "Completion Rate", value: `${analytics?.completionRate ?? 0}%` },
    { icon: Clock, label: "Review Turnaround", value: `${analytics?.reviewTurnaround ?? 0}h` },
    { icon: AlertTriangle, label: "Dispute Ratio", value: `${((analytics?.disputeRatio ?? 0) * 100).toFixed(1)}%` },
  ];

  return (
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Institution Control Panel
        </h1>
        <p className="text-sm text-muted-foreground">Tenant-level analytics, configuration, and exports</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <m.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{analyticsLoading ? "—" : m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feature Flags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Feature Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEATURE_FLAGS.map((flag) => {
              const enabled = isFeatureEnabled(flag.key);
              return (
                <div key={flag.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <flag.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{flag.label}</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => handleToggle(flag.key, enabled)}
                    disabled={toggling === flag.key || settingsLoading}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Data Exports */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Data Exports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXPORT_TYPES.map((e) => (
              <div key={e.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{e.label}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport(e.type)}>
                  Request
                </Button>
              </div>
            ))}

            {exports.length > 0 && (
              <>
                <Separator className="my-3" />
                <p className="text-xs font-medium text-muted-foreground">Recent Exports</p>
                {exports.slice(0, 5).map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{ex.export_type.replace(/_/g, " ")}</span>
                    <Badge
                      variant="outline"
                      className={ex.status === "completed" ? "border-emerald-500/30 text-emerald-600" : ""}
                    >
                      {ex.status}
                    </Badge>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Branding Preview */}
      {settings && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {settings.branding_logo_url ? (
                <img src={settings.branding_logo_url} alt="Logo" className="h-12 w-12 rounded object-contain border border-border" />
              ) : (
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: settings.primary_color }} />
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: settings.secondary_color }} />
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
              </div>
              {settings.custom_domain && (
                <Badge variant="secondary" className="text-xs">{settings.custom_domain}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
