import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useSecurityAudit } from "@/hooks/useSecurityAudit";
import {
  Shield,
  AlertTriangle,
  Bug,
  Target,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  FileWarning,
  Lock,
} from "lucide-react";
import { format } from "date-fns";

const riskColors: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "destructive",
  in_progress: "secondary",
  resolved: "default",
  pass: "default",
  fail: "destructive",
  detected: "destructive",
  contained: "secondary",
  closed: "outline",
};

export default function AdminSecurityPage() {
  const {
    threatModels,
    attackSurfaces,
    testResults,
    vulnerabilities,
    incidents,
    loading,
    stats,
    refetch,
  } = useSecurityAudit();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Audit Center</h1>
            <p className="text-muted-foreground">
              Threat modeling, penetration testing, and incident response
            </p>
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Vulnerabilities</p>
                  <p className="text-2xl font-bold">{stats.openVulnerabilities}</p>
                  {stats.criticalVulnerabilities > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {stats.criticalVulnerabilities} Critical
                    </Badge>
                  )}
                </div>
                <Bug className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Incidents</p>
                  <p className="text-2xl font-bold">{stats.activeIncidents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Threat Models</p>
                  <p className="text-2xl font-bold">{stats.totalThreats}</p>
                  {stats.criticalThreats > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {stats.criticalThreats} Critical
                    </Badge>
                  )}
                </div>
                <Target className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attack Surfaces</p>
                  <p className="text-2xl font-bold">{stats.attackSurfacesCovered}</p>
                  {stats.highRiskSurfaces > 0 && (
                    <Badge variant="secondary" className="mt-1">
                      {stats.highRiskSurfaces} High Risk
                    </Badge>
                  )}
                </div>
                <Shield className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Posture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Threat Coverage</span>
                  <span className="text-sm font-medium">
                    {threatModels.filter(t => t.mitigation_status === "verified").length}/{threatModels.length}
                  </span>
                </div>
                <Progress
                  value={threatModels.length > 0
                    ? (threatModels.filter(t => t.mitigation_status === "verified").length / threatModels.length) * 100
                    : 0}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Vulnerability Resolution</span>
                  <span className="text-sm font-medium">
                    {vulnerabilities.filter(v => v.status === "resolved").length}/{vulnerabilities.length}
                  </span>
                </div>
                <Progress
                  value={vulnerabilities.length > 0
                    ? (vulnerabilities.filter(v => v.status === "resolved").length / vulnerabilities.length) * 100
                    : 0}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Test Pass Rate</span>
                  <span className="text-sm font-medium">
                    {testResults.filter(t => t.result === "pass").length}/{testResults.length}
                  </span>
                </div>
                <Progress
                  value={testResults.length > 0
                    ? (testResults.filter(t => t.result === "pass").length / testResults.length) * 100
                    : 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="threats" className="space-y-4">
          <TabsList>
            <TabsTrigger value="threats">Threat Models</TabsTrigger>
            <TabsTrigger value="surfaces">Attack Surfaces</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="threats">
            <Card>
              <CardHeader>
                <CardTitle>STRIDE Threat Models</CardTitle>
                <CardDescription>
                  Documented threats across all platform components
                </CardDescription>
              </CardHeader>
              <CardContent>
                {threatModels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No threat models documented yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {threatModels.map((threat) => (
                        <div
                          key={threat.id}
                          className="p-4 rounded-lg border flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{threat.component}</Badge>
                              <Badge variant="outline">{threat.threat_type}</Badge>
                              <div className={`w-2 h-2 rounded-full ${riskColors[threat.risk_level]}`} />
                              <span className="text-xs capitalize">{threat.risk_level}</span>
                            </div>
                            <h4 className="font-medium">{threat.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {threat.description}
                            </p>
                            {threat.mitigation && (
                              <p className="text-sm text-green-600 mt-2">
                                Mitigation: {threat.mitigation}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              threat.mitigation_status === "verified" ? "default" :
                              threat.mitigation_status === "implemented" ? "secondary" :
                              "outline"
                            }
                          >
                            {threat.mitigation_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surfaces">
            <Card>
              <CardHeader>
                <CardTitle>Attack Surface Map</CardTitle>
                <CardDescription>
                  Documented entry points and exposure levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attackSurfaces.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No attack surfaces documented yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="grid gap-3">
                      {attackSurfaces.map((surface) => (
                        <div
                          key={surface.id}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge>{surface.surface_type}</Badge>
                              <h4 className="font-medium">{surface.surface_name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Risk Score:</span>
                              <Badge
                                variant={
                                  surface.risk_score >= 70 ? "destructive" :
                                  surface.risk_score >= 40 ? "secondary" :
                                  "default"
                                }
                              >
                                {surface.risk_score}/100
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Component: {surface.component}</span>
                            <span>Auth: {surface.authentication_required ? "Required" : "None"}</span>
                            <span>Exposure: {surface.exposure_level}</span>
                            <span>Sensitivity: {surface.data_sensitivity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities">
            <Card>
              <CardHeader>
                <CardTitle>Security Vulnerabilities</CardTitle>
                <CardDescription>
                  Tracked vulnerabilities and remediation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vulnerabilities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bug className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No vulnerabilities tracked</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {vulnerabilities.map((vuln) => (
                        <div
                          key={vuln.id}
                          className={`p-4 rounded-lg border ${
                            vuln.status === "open" && vuln.severity === "critical"
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={statusColors[vuln.status]}>
                                  {vuln.status}
                                </Badge>
                                <Badge
                                  variant={
                                    vuln.severity === "critical" ? "destructive" :
                                    vuln.severity === "high" ? "destructive" :
                                    "secondary"
                                  }
                                >
                                  {vuln.severity}
                                </Badge>
                                {vuln.cvss_score && (
                                  <span className="text-xs">CVSS: {vuln.cvss_score}</span>
                                )}
                              </div>
                              <h4 className="font-medium">{vuln.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {vuln.description}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-muted-foreground">
                                {format(new Date(vuln.discovered_at), "PP")}
                              </p>
                              {vuln.remediation_deadline && (
                                <p className="text-orange-600">
                                  Due: {format(new Date(vuln.remediation_deadline), "PP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader>
                <CardTitle>Security Incidents</CardTitle>
                <CardDescription>
                  Active and historical security incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incidents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-500" />
                    <p>No security incidents recorded</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {incidents.map((incident) => (
                        <div
                          key={incident.id}
                          className={`p-4 rounded-lg border ${
                            incident.status !== "closed"
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{incident.incident_id}</Badge>
                                <Badge variant={statusColors[incident.status] || "secondary"}>
                                  {incident.status}
                                </Badge>
                                <Badge
                                  variant={
                                    incident.severity === "critical" ? "destructive" :
                                    incident.severity === "high" ? "destructive" :
                                    "secondary"
                                  }
                                >
                                  {incident.severity}
                                </Badge>
                              </div>
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {incident.description}
                              </p>
                              {incident.data_compromised && (
                                <Badge variant="destructive" className="mt-2">
                                  Data Compromised
                                </Badge>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>Detected: {format(new Date(incident.detected_at), "PPp")}</p>
                              {incident.closed_at && (
                                <p>Closed: {format(new Date(incident.closed_at), "PPp")}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Penetration Test Results</CardTitle>
                <CardDescription>
                  Recent security test executions and findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No test results yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {testResults.map((test) => (
                        <div
                          key={test.id}
                          className="p-3 rounded-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {test.result === "pass" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : test.result === "fail" ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                              <p className="font-medium">{test.test_name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">{test.component}</Badge>
                                <span>{test.test_type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusColors[test.result]}>
                              {test.result}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(test.tested_at), "PPp")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
