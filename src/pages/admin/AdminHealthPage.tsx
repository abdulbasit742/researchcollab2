import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductionBlockersPanel } from "@/components/admin/ProductionBlockersPanel";
import { RouteHealthPanel } from "@/components/admin/RouteHealthPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useObservability } from "@/hooks/useObservability";
import { Activity, AlertTriangle, CheckCircle, XCircle, Bell, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

type BuildCheckStatus = "pass" | "warning" | "blocker" | "manual";

type BuildCheck = {
  id: string;
  area: string;
  label: string;
  status: BuildCheckStatus;
  evidence: string;
  nextAction: string;
  command?: string;
};

const buildChecks: BuildCheck[] = [
  {
    id: "vite-scripts",
    area: "Build scripts",
    label: "Vite build scripts are present",
    status: "pass",
    evidence: "package.json defines dev, build, build:dev, lint, and preview scripts.",
    nextAction: "Run npm run build after every major feature pass.",
    command: "npm run build",
  },
  {
    id: "static-types",
    area: "Type safety",
    label: "Supabase Database type is a temporary fallback",
    status: "warning",
    evidence: "src/integrations/supabase/types.ts uses a broad fallback until generated types are restored.",
    nextAction: "Generate real Supabase types from staging before production.",
    command: "supabase gen types typescript --project-id <project-id>",
  },
  {
    id: "admin-route-protection",
    area: "Access control",
    label: "Admin pages are behind ProtectedRoute and AdminLayout",
    status: "warning",
    evidence: "Frontend checks exist, but backend RLS is still required for real enforcement.",
    nextAction: "Add role-aware ProtectedRoute and RLS policies for production.",
  },
  {
    id: "lovable-compatibility",
    area: "Lovable",
    label: "Lovable-compatible Vite setup detected",
    status: "pass",
    evidence: "vite.config.ts uses React SWC, lovable-tagger in development, and the @ alias.",
    nextAction: "Keep imports and routes compatible with Lovable auto-commits.",
  },
  {
    id: "seo-domain",
    area: "Release readiness",
    label: "Old Lovable domain cleanup is still required",
    status: "warning",
    evidence: "SEO/canonical/structured data can still reference the old Lovable preview domain.",
    nextAction: "Replace old preview-domain references with the final domain after confirmation.",
  },
  {
    id: "edge-functions-auth",
    area: "Security",
    label: "Edge function JWT review required",
    status: "blocker",
    evidence: "Several Supabase edge functions are configured for unauthenticated invocation.",
    nextAction: "Review verify_jwt=false functions before any production deployment.",
  },
  {
    id: "demo-finance-labels",
    area: "Trust & safety",
    label: "Finance and escrow flows must remain demo-only",
    status: "warning",
    evidence: "Funding, escrow, billing, wallet, payout, and refund experiences need consistent demo labels.",
    nextAction: "Add a shared DemoFinanceBadge and scan all finance-facing pages.",
  },
  {
    id: "ci-workflow",
    area: "Automation",
    label: "GitHub Actions build workflow not verified by this dashboard",
    status: "manual",
    evidence: "This dashboard is static and cannot read CI status yet.",
    nextAction: "Add a GitHub Actions workflow for npm ci, npm run build, and npm run lint.",
    command: "npm ci && npm run build && npm run lint",
  },
];

const getBuildStatusLabel = (status: BuildCheckStatus) => {
  switch (status) {
    case "pass":
      return "Pass";
    case "warning":
      return "Needs Review";
    case "blocker":
      return "Blocker";
    case "manual":
      return "Manual Check";
    default:
      return "Unknown";
  }
};

const getBuildStatusClass = (status: BuildCheckStatus) => {
  switch (status) {
    case "pass":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "warning":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "blocker":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "manual":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function AdminHealthPage() {
  const {
    healthStatus, alerts, events, integrityLogs, jobRuns, loading,
    overallHealth, unresolvedAlerts, criticalAlerts, recentErrors,
    acknowledgeAlert, resolveAlert, refetch
  } = useObservability();

  const buildPasses = buildChecks.filter((check) => check.status === "pass");
  const buildWarnings = buildChecks.filter((check) => check.status === "warning");
  const buildBlockers = buildChecks.filter((check) => check.status === "blocker");
  const manualChecks = buildChecks.filter((check) => check.status === "manual");
  const buildReadinessScore = Math.round(
    buildChecks.reduce((total, check) => {
      if (check.status === "pass") return total + 100;
      if (check.status === "warning") return total + 60;
      if (check.status === "manual") return total + 45;
      return total;
    }, 0) / buildChecks.length
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "unhealthy": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "error": return "bg-red-500/10 text-red-600 border-red-500/30";
      case "warn": return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      default: return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              Platform Health
            </h1>
            <p className="text-muted-foreground">Real-time observability, build readiness, route safety, production blockers, and integrity monitoring</p>
          </div>
          <Button onClick={refetch} disabled={loading}>Refresh</Button>
        </div>

        {/* Overall Status */}
        <Card className={overallHealth === "healthy" ? "border-green-500/30" : overallHealth === "degraded" ? "border-amber-500/30" : "border-red-500/30"}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              System Status: <span className="capitalize">{overallHealth}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {healthStatus.map(h => (
                <div key={h.id} className="flex items-center gap-2">
                  {getStatusIcon(h.status)}
                  <span className="text-sm capitalize">{h.component}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Build Readiness Snapshot */}
        <Card className={buildBlockers.length > 0 ? "border-red-500/40" : "border-green-500/30"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {buildBlockers.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
              Build Readiness Dashboard
            </CardTitle>
            <CardDescription>
              Static release-health view for build commands, type readiness, Lovable compatibility, security blockers, and demo safety.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Readiness Score</p>
                <p className="text-2xl font-bold">{buildReadinessScore}%</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{buildPasses.length}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold text-amber-600">{buildWarnings.length}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Blockers</p>
                <p className="text-2xl font-bold text-red-600">{buildBlockers.length}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Manual Checks</p>
                <p className="text-2xl font-bold text-blue-600">{manualChecks.length}</p>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              This dashboard does not replace a real CI build. Before launch, run <code className="rounded bg-background px-1 py-0.5">npm run build</code> and review Supabase/RLS/security blockers in staging.
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unresolved Alerts</CardDescription>
              <CardTitle className="text-2xl">{unresolvedAlerts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={criticalAlerts.length > 0 ? "border-red-500/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription>Critical Alerts</CardDescription>
              <CardTitle className="text-2xl text-red-500">{criticalAlerts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Errors (24h)</CardDescription>
              <CardTitle className="text-2xl">{recentErrors.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Integrity Issues</CardDescription>
              <CardTitle className="text-2xl">{integrityLogs.filter(l => l.requires_admin_action).length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="build">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="build"><AlertTriangle className="h-4 w-4 mr-1" />Build</TabsTrigger>
            <TabsTrigger value="blockers"><AlertTriangle className="h-4 w-4 mr-1" />Blockers</TabsTrigger>
            <TabsTrigger value="routes"><Shield className="h-4 w-4 mr-1" />Routes</TabsTrigger>
            <TabsTrigger value="alerts"><Bell className="h-4 w-4 mr-1" />Alerts</TabsTrigger>
            <TabsTrigger value="events"><Activity className="h-4 w-4 mr-1" />Events</TabsTrigger>
            <TabsTrigger value="integrity"><Shield className="h-4 w-4 mr-1" />Integrity</TabsTrigger>
            <TabsTrigger value="jobs"><Clock className="h-4 w-4 mr-1" />Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="build">
            <Card>
              <CardHeader>
                <CardTitle>Build Health Checks</CardTitle>
                <CardDescription>
                  Launch-readiness checks for compile stability, type safety, CI, Lovable compatibility, and release blockers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area</TableHead>
                        <TableHead>Check</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Evidence</TableHead>
                        <TableHead>Next Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buildChecks.map((check) => (
                        <TableRow key={check.id}>
                          <TableCell className="font-medium">{check.area}</TableCell>
                          <TableCell>{check.label}</TableCell>
                          <TableCell>
                            <Badge className={getBuildStatusClass(check.status)}>{getBuildStatusLabel(check.status)}</Badge>
                          </TableCell>
                          <TableCell className="max-w-sm text-sm text-muted-foreground">{check.evidence}</TableCell>
                          <TableCell className="max-w-sm text-sm">
                            <div>{check.nextAction}</div>
                            {check.command && (
                              <code className="mt-1 inline-block rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{check.command}</code>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blockers">
            <ProductionBlockersPanel />
          </TabsContent>

          <TabsContent value="routes">
            <RouteHealthPanel />
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader><CardTitle>Active Alerts</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.slice(0, 20).map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm">{format(new Date(a.created_at), "MMM d HH:mm")}</TableCell>
                          <TableCell><Badge variant="outline">{a.alert_type}</Badge></TableCell>
                          <TableCell><Badge className={getSeverityColor(a.severity)}>{a.severity}</Badge></TableCell>
                          <TableCell className="max-w-xs truncate">{a.message}</TableCell>
                          <TableCell className="space-x-1">
                            {!a.acknowledged_at && <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(a.id)}>Ack</Button>}
                            {!a.resolved_at && <Button size="sm" variant="outline" onClick={() => resolveAlert(a.id)}>Resolve</Button>}
                            {a.resolved_at && <Badge variant="secondary">Resolved</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader><CardTitle>Recent Events</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Entity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.slice(0, 30).map(e => (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm">{format(new Date(e.created_at), "MMM d HH:mm")}</TableCell>
                          <TableCell><Badge variant="outline">{e.event_type}</Badge></TableCell>
                          <TableCell><Badge className={getSeverityColor(e.severity)}>{e.severity}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{e.entity_type || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrity">
            <Card>
              <CardHeader><CardTitle>Integrity Issues</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Fixed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrityLogs.slice(0, 30).map(l => (
                        <TableRow key={l.id}>
                          <TableCell className="text-sm">{format(new Date(l.created_at), "MMM d HH:mm")}</TableCell>
                          <TableCell>{l.job_name}</TableCell>
                          <TableCell>{l.issue_type}</TableCell>
                          <TableCell><Badge className={getSeverityColor(l.severity)}>{l.severity}</Badge></TableCell>
                          <TableCell className="font-mono text-xs">{l.affected_table}</TableCell>
                          <TableCell>{l.auto_fixed ? <CheckCircle className="h-4 w-4 text-green-500" /> : l.requires_admin_action ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader><CardTitle>Job Runs</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Started</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Affected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobRuns.map(j => (
                        <TableRow key={j.id}>
                          <TableCell className="text-sm">{format(new Date(j.started_at), "MMM d HH:mm")}</TableCell>
                          <TableCell>{j.job_name}</TableCell>
                          <TableCell><Badge variant={j.status === "completed" ? "secondary" : j.status === "failed" ? "destructive" : "default"}>{j.status}</Badge></TableCell>
                          <TableCell>{j.records_processed}</TableCell>
                          <TableCell>{j.records_affected}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
