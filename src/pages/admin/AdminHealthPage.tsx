import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useObservability } from "@/hooks/useObservability";
import { Activity, AlertTriangle, CheckCircle, XCircle, Bell, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AdminHealthPage() {
  const {
    healthStatus, alerts, events, integrityLogs, jobRuns, loading,
    overallHealth, unresolvedAlerts, criticalAlerts, recentErrors,
    acknowledgeAlert, resolveAlert, refetch
  } = useObservability();

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              Platform Health
            </h1>
            <p className="text-muted-foreground">Real-time observability & integrity monitoring</p>
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
        <Tabs defaultValue="alerts">
          <TabsList>
            <TabsTrigger value="alerts"><Bell className="h-4 w-4 mr-1" />Alerts</TabsTrigger>
            <TabsTrigger value="events"><Activity className="h-4 w-4 mr-1" />Events</TabsTrigger>
            <TabsTrigger value="integrity"><Shield className="h-4 w-4 mr-1" />Integrity</TabsTrigger>
            <TabsTrigger value="jobs"><Clock className="h-4 w-4 mr-1" />Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <Card>
              <CardHeader><CardTitle>Active Alerts</CardTitle></CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader><CardTitle>Recent Events</CardTitle></CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrity">
            <Card>
              <CardHeader><CardTitle>Integrity Issues</CardTitle></CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader><CardTitle>Job Runs</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Started</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Found</TableHead>
                      <TableHead>Fixed</TableHead>
                      <TableHead>Flagged</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobRuns.map(j => (
                      <TableRow key={j.id}>
                        <TableCell className="text-sm">{format(new Date(j.started_at), "MMM d HH:mm")}</TableCell>
                        <TableCell>{j.job_name}</TableCell>
                        <TableCell><Badge variant={j.status === "completed" ? "secondary" : j.status === "failed" ? "destructive" : "default"}>{j.status}</Badge></TableCell>
                        <TableCell>{j.issues_found}</TableCell>
                        <TableCell>{j.issues_fixed}</TableCell>
                        <TableCell>{j.issues_flagged}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
