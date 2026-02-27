/**
 * KnowledgeMonitorPanel — Autonomous knowledge drift detection & alert dashboard.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Radar, Bell, AlertTriangle, TrendingUp, Eye, X, Play, Shield, Activity,
} from "lucide-react";
import {
  useMonitorProfile, useCreateMonitorProfile,
  useDriftEvents, useMonitorAlerts, useDismissAlert, useRunDriftScan,
} from "@/hooks/useKnowledgeMonitor";

const DRIFT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  consensus_shift: { label: "Consensus Shift", color: "bg-amber-500/10 text-amber-700" },
  contradiction_spike: { label: "Contradiction Spike", color: "bg-destructive/10 text-destructive" },
  citation_spike: { label: "Citation Spike", color: "bg-primary/10 text-primary" },
  emerging_topic: { label: "Emerging Topic", color: "bg-emerald-500/10 text-emerald-700" },
  claim_deprecation: { label: "Claim Deprecated", color: "bg-muted text-muted-foreground" },
};

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  critical: "destructive",
};

export function KnowledgeMonitorPanel({ workspaceId }: { workspaceId: string }) {
  const { data: profile, isLoading: profileLoading } = useMonitorProfile(workspaceId);
  const createProfile = useCreateMonitorProfile();
  const { data: driftEvents = [], isLoading: eventsLoading } = useDriftEvents(workspaceId);
  const { data: alerts = [] } = useMonitorAlerts();
  const dismissAlert = useDismissAlert();
  const runScan = useRunDriftScan();
  const [sensitivity, setSensitivity] = useState("medium");
  const [frequency, setFrequency] = useState("weekly");

  const workspaceAlerts = alerts.filter((a: any) => a.drift_events?.workspace_id === workspaceId);
  const newAlertCount = workspaceAlerts.filter((a: any) => a.alert_status === "new").length;

  return (
    <Tabs defaultValue="monitor" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="monitor" className="flex items-center gap-1">
          <Radar className="h-3 w-3" /> Monitor
        </TabsTrigger>
        <TabsTrigger value="drift" className="flex items-center gap-1">
          <Activity className="h-3 w-3" /> Drift Events
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-1">
          <Bell className="h-3 w-3" /> Alerts
          {newAlertCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1 py-0 ml-1">{newAlertCount}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Monitor Config */}
      <TabsContent value="monitor">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radar className="h-4 w-4 text-primary" /> Knowledge Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : !profile ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Set up autonomous monitoring for this workspace.</p>
                <div className="flex gap-2">
                  <Select value={sensitivity} onValueChange={setSensitivity}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Sensitivity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Frequency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={createProfile.isPending}
                    onClick={() => createProfile.mutate({ workspace_id: workspaceId, drift_sensitivity_level: sensitivity, frequency })}>
                    {createProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable Monitoring"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border text-center">
                    <span className="text-[10px] text-muted-foreground block">Sensitivity</span>
                    <span className="text-sm font-bold capitalize">{profile.drift_sensitivity_level}</span>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <span className="text-[10px] text-muted-foreground block">Frequency</span>
                    <span className="text-sm font-bold capitalize">{profile.frequency}</span>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <span className="text-[10px] text-muted-foreground block">Last Scan</span>
                    <span className="text-sm font-bold">{profile.last_scan_at ? new Date(profile.last_scan_at).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" disabled={runScan.isPending} onClick={() => runScan.mutate(workspaceId)}>
                    {runScan.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Run Drift Scan Now
                  </Button>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Activity className="h-3 w-3" /> Drift Events
                    </div>
                    <span className="text-xl font-bold">{driftEvents.length}</span>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Bell className="h-3 w-3" /> Active Alerts
                    </div>
                    <span className="text-xl font-bold">{newAlertCount}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Drift Events */}
      <TabsContent value="drift">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Drift Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : driftEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No drift events detected yet. Run a scan to begin.</p>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-3">
                  {driftEvents.map((evt: any) => {
                    const typeInfo = DRIFT_TYPE_LABELS[evt.drift_type] || { label: evt.drift_type, color: "bg-muted text-muted-foreground" };
                    return (
                      <div key={evt.id} className="p-3 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                            <Badge variant={SEVERITY_VARIANT[evt.severity] || "outline"} className="text-[10px]">{evt.severity}</Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(evt.detected_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{evt.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Impact: {evt.impact_score}</span>
                          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Confidence: {((evt.confidence_score || 0) * 100).toFixed(0)}%</span>
                          <span>{(evt.related_claim_ids || []).length} claims affected</span>
                        </div>
                        <Progress value={evt.impact_score} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Alerts */}
      <TabsContent value="alerts">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Monitor Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workspaceAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts yet.</p>
            ) : (
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {workspaceAlerts.map((alert: any) => {
                    const evt = alert.drift_events;
                    const typeInfo = DRIFT_TYPE_LABELS[evt?.drift_type] || { label: "Unknown", color: "bg-muted text-muted-foreground" };
                    return (
                      <div key={alert.id} className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${alert.alert_status === "new" ? "border-primary/30 bg-primary/5" : ""}`}>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                            {alert.alert_status === "new" && <Badge variant="default" className="text-[10px]">New</Badge>}
                          </div>
                          <p className="text-sm">{evt?.summary || "Drift detected"}</p>
                          <span className="text-[10px] text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1">
                          {alert.alert_status === "new" && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => dismissAlert.mutate(alert.id)}>
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
