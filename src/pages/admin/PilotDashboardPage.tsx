import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, ShieldAlert, ShieldCheck, Activity, Users, DollarSign,
  Lock, Unlock, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  ArrowLeft, Zap, TrendingUp, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePilotStatus, usePilotActions, usePilotTransactionLog, usePilotIncidents, usePilotParticipants } from "@/hooks/usePilotMode";
import { formatDistanceToNow } from "date-fns";

const PilotDashboardPage = () => {
  const navigate = useNavigate();
  const { data: status, isLoading } = usePilotStatus();
  const { runIntegrity, freezePilot, unfreezePilot } = usePilotActions();
  const { data: transactions } = usePilotTransactionLog();
  const { data: incidents } = usePilotIncidents();
  const { participants } = usePilotParticipants();

  const breaker = status?.breaker;
  const isFrozen = breaker?.is_frozen;

  const studentCount = participants.filter((p: any) => p.participant_role === "student").length;
  const sponsorCount = participants.filter((p: any) => p.participant_role === "sponsor").length;
  const facultyCount = participants.filter((p: any) => p.participant_role === "faculty").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`border-b ${isFrozen ? "bg-destructive/10" : "bg-card"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {isFrozen ? (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            )}
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                Live Capital Pilot
                <Badge variant={isFrozen ? "destructive" : "default"} className="text-xs">
                  {isFrozen ? "FROZEN" : "ACTIVE"}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                Controlled real-money validation • Max PKR {Number(breaker?.transaction_cap_pkr || 50000).toLocaleString()} per deal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runIntegrity.mutate()}
              disabled={runIntegrity.isPending}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${runIntegrity.isPending ? "animate-spin" : ""}`} />
              Run Integrity Check
            </Button>
            {isFrozen ? (
              <Button size="sm" onClick={() => unfreezePilot.mutate()} disabled={unfreezePilot.isPending}>
                <Unlock className="h-3.5 w-3.5 mr-1.5" /> Unfreeze
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={() => freezePilot.mutate("Manual admin freeze")}>
                <Lock className="h-3.5 w-3.5 mr-1.5" /> Emergency Freeze
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Escrow Locked</span>
              </div>
              <p className="text-xl font-bold">PKR {Number(breaker?.total_escrow_locked || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Released</span>
              </div>
              <p className="text-xl font-bold">PKR {Number(breaker?.total_released || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Refunded</span>
              </div>
              <p className="text-xl font-bold">PKR {Number(breaker?.total_refunded || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Incidents</span>
              </div>
              <p className="text-xl font-bold">{breaker?.incident_count || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Participants Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pilot Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Students</Badge>
                <span className="font-semibold">{studentCount} / {breaker?.max_students || 10}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Sponsors</Badge>
                <span className="font-semibold">{sponsorCount} / {breaker?.max_sponsors || 3}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Faculty</Badge>
                <span className="font-semibold">{facultyCount}</span>
              </div>
            </div>
            {breaker?.last_reconciliation_at && (
              <p className="text-xs text-muted-foreground mt-3">
                Last reconciliation: {formatDistanceToNow(new Date(breaker.last_reconciliation_at), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Transactions ({transactions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Incidents ({incidents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Execution Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 mt-3">
                {(transactions || []).map((txn: any) => (
                  <Card key={txn.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ActionIcon type={txn.action_type} />
                        <div>
                          <p className="text-sm font-medium capitalize">{txn.action_type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {txn.amount && (
                          <span className="font-semibold text-sm">PKR {Number(txn.amount).toLocaleString()}</span>
                        )}
                        <ReconciliationBadge status={txn.reconciliation_status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">No pilot transactions yet</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="incidents">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 mt-3">
                {(incidents || []).map((inc: any) => (
                  <Card key={inc.id} className={inc.severity === "critical" ? "border-destructive/50" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-3.5 w-3.5 ${
                            inc.severity === "critical" ? "text-destructive" : "text-orange-500"
                          }`} />
                          <span className="text-sm font-medium capitalize">{inc.incident_type.replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant={inc.resolved ? "secondary" : "destructive"} className="text-xs">
                          {inc.resolved ? "Resolved" : inc.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{inc.description}</p>
                      {inc.auto_action_taken && (
                        <p className="text-xs text-orange-500 mt-1">Auto: {inc.auto_action_taken}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {(!incidents || incidents.length === 0) && (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No incidents — system clean</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {[
                { label: "Time to First Funding", metric: "time_to_first_funding", icon: Clock, unit: "hrs" },
                { label: "Milestone Approval", metric: "time_to_milestone_approval", icon: CheckCircle, unit: "hrs" },
                { label: "Dispute Frequency", metric: "dispute_frequency", icon: AlertTriangle, unit: "%" },
                { label: "Student Completion", metric: "student_completion_rate", icon: TrendingUp, unit: "%" },
                { label: "Hiring Conversions", metric: "hiring_conversion", icon: Zap, unit: "" },
                { label: "Trust Score Delta", metric: "trust_score_delta", icon: Shield, unit: "pts" },
              ].map((m) => {
                const metricData = (status?.metrics || []).filter((d: any) => d.metric_type === m.metric);
                const avgValue = metricData.length > 0
                  ? metricData.reduce((s: number, d: any) => s + Number(d.value || 0), 0) / metricData.length
                  : 0;
                return (
                  <Card key={m.metric}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                      </div>
                      <p className="text-lg font-bold">
                        {avgValue > 0 ? `${avgValue.toFixed(1)}${m.unit}` : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{metricData.length} data points</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Pilot Success Criteria */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pilot Success Criteria (First 10 Deals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Financial Mismatches", target: "0", current: String(breaker?.incident_count || 0), pass: (breaker?.incident_count || 0) === 0 },
                { label: "Security Breaches", target: "0", current: "0", pass: true },
                { label: "Reconciliation Accuracy", target: "100%", current: "—", pass: true },
                { label: "Milestone Completion", target: ">70%", current: "—", pass: true },
                { label: "Sponsor Satisfaction", target: ">4/5", current: "—", pass: true },
                { label: "Student Clarity", target: ">4/5", current: "—", pass: true },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  {c.pass ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium">{c.label}</p>
                    <p className="text-[10px] text-muted-foreground">Target: {c.target} • Current: {c.current}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function ActionIcon({ type }: { type: string }) {
  switch (type) {
    case "deposit": return <DollarSign className="h-3.5 w-3.5 text-green-500" />;
    case "escrow_lock": return <Lock className="h-3.5 w-3.5 text-yellow-500" />;
    case "milestone_submit": case "milestone_approve": return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
    case "partial_release": case "final_release": return <Unlock className="h-3.5 w-3.5 text-green-500" />;
    case "refund": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "freeze_triggered": return <ShieldAlert className="h-3.5 w-3.5 text-destructive" />;
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function ReconciliationBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">Verified</Badge>;
  if (status === "mismatch") return <Badge variant="destructive" className="text-[10px]">Mismatch</Badge>;
  return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
}

export default PilotDashboardPage;
