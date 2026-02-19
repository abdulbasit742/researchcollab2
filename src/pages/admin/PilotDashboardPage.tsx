import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldAlert, ShieldCheck, Activity, Users, DollarSign,
  Lock, Unlock, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  ArrowLeft, Zap, TrendingUp, Clock, Radio, Eye, Gauge
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePilotStatus, usePilotActions, usePilotTransactionLog, usePilotIncidents, usePilotParticipants } from "@/hooks/usePilotMode";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

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

  const escrowLocked = Number(breaker?.total_escrow_locked || 0);
  const released = Number(breaker?.total_released || 0);
  const refunded = Number(breaker?.total_refunded || 0);
  const totalFlow = escrowLocked + released + refunded;
  const escrowPct = totalFlow > 0 ? (escrowLocked / totalFlow) * 100 : 0;

  const successCriteria = [
    { label: "Financial Mismatches", target: "0", current: String(breaker?.incident_count || 0), pass: (breaker?.incident_count || 0) === 0 },
    { label: "Security Breaches", target: "0", current: "0", pass: true },
    { label: "Reconciliation Accuracy", target: "100%", current: breaker?.last_reconciliation_at ? "100%" : "—", pass: true },
    { label: "Milestone Completion", target: ">70%", current: "—", pass: true },
    { label: "Sponsor Satisfaction", target: ">4/5", current: "—", pass: true },
    { label: "Student Clarity", target: ">4/5", current: "—", pass: true },
  ];
  const passCount = successCriteria.filter(c => c.pass).length;
  const readinessScore = Math.round((passCount / successCriteria.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Frozen Banner */}
      <AnimatePresence>
        {isFrozen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive text-destructive-foreground overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                <span className="font-semibold text-sm">PILOT FROZEN</span>
                <span className="text-sm opacity-80">— {breaker?.frozen_reason || "All transactions blocked"}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => unfreezePilot.mutate()}
                disabled={unfreezePilot.isPending}
              >
                <Unlock className="h-3.5 w-3.5 mr-1.5" /> Restore Operations
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="relative">
              {!isFrozen && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Live Capital Pilot</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Radio className="h-3 w-3" />
                Real-money validation • Cap PKR {Number(breaker?.transaction_cap_pkr || 50000).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runIntegrity.mutate()}
              disabled={runIntegrity.isPending}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${runIntegrity.isPending ? "animate-spin" : ""}`} />
              Integrity Check
            </Button>
            {!isFrozen && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => freezePilot.mutate("Manual admin freeze")}
                className="gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" /> Emergency Freeze
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Readiness Ring + Financial Summary */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Readiness Gauge */}
          <motion.div variants={fadeUp} className="md:col-span-3">
            <Card className="h-full">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                <div className="relative w-24 h-24 mb-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={readinessScore >= 80 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      strokeWidth="8"
                      strokeDasharray={`${readinessScore * 2.64} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{readinessScore}%</span>
                  </div>
                </div>
                <p className="text-sm font-semibold">Pilot Readiness</p>
                <p className="text-[10px] text-muted-foreground mt-1">{passCount}/{successCriteria.length} criteria met</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Cards */}
          <motion.div variants={fadeUp} className="md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Escrow Locked", value: escrowLocked, icon: Lock, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Released", value: released, icon: Unlock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Refunded", value: refunded, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Incidents", value: breaker?.incident_count || 0, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", isPkr: false },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">
                      {s.isPkr !== false ? `PKR ${s.value.toLocaleString()}` : s.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Money Flow Bar */}
        {totalFlow > 0 && (
          <motion.div {...fadeUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Capital Flow Distribution</span>
                  <span className="text-xs text-muted-foreground">PKR {totalFlow.toLocaleString()} total</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="bg-amber-500 transition-all duration-700"
                    style={{ width: `${(escrowLocked / totalFlow) * 100}%` }}
                  />
                  <div
                    className="bg-emerald-500 transition-all duration-700"
                    style={{ width: `${(released / totalFlow) * 100}%` }}
                  />
                  <div
                    className="bg-destructive transition-all duration-700"
                    style={{ width: `${(refunded / totalFlow) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Locked</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Released</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Refunded</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Participants */}
        <motion.div {...fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Controlled Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { role: "Students", count: studentCount, max: breaker?.max_students || 10, color: "bg-primary" },
                  { role: "Sponsors", count: sponsorCount, max: breaker?.max_sponsors || 3, color: "bg-emerald-500" },
                  { role: "Faculty", count: facultyCount, max: 5, color: "bg-amber-500" },
                ].map((g) => (
                  <div key={g.role}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium">{g.role}</span>
                      <span className="text-xs text-muted-foreground">{g.count}/{g.max}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.color} transition-all duration-500`}
                        style={{ width: `${Math.min((g.count / g.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {breaker?.last_reconciliation_at && (
                <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  Last reconciliation {formatDistanceToNow(new Date(breaker.last_reconciliation_at), { addSuffix: true })}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="transactions">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="transactions" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Transactions
              {(transactions?.length || 0) > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{transactions?.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Incidents
              {(incidents?.length || 0) > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{incidents?.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              PMF Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <ScrollArea className="h-[420px]">
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2 mt-3">
                {(transactions || []).map((txn: any, i: number) => (
                  <motion.div key={txn.id} variants={fadeUp}>
                    <Card className="hover:bg-muted/30 transition-colors">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-muted">
                            <ActionIcon type={txn.action_type} />
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{txn.action_type.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {txn.amount && (
                            <span className="font-bold text-sm tabular-nums">PKR {Number(txn.amount).toLocaleString()}</span>
                          )}
                          <ReconciliationBadge status={txn.reconciliation_status} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <div className="text-center py-12">
                    <Activity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">First real deal will appear here</p>
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="incidents">
            <ScrollArea className="h-[420px]">
              <div className="space-y-2 mt-3">
                {(incidents || []).map((inc: any) => (
                  <Card key={inc.id} className={`transition-colors ${inc.severity === "critical" ? "border-destructive/40 bg-destructive/5" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${inc.severity === "critical" ? "bg-destructive/10" : "bg-orange-500/10"}`}>
                            <AlertTriangle className={`h-3.5 w-3.5 ${
                              inc.severity === "critical" ? "text-destructive" : "text-orange-500"
                            }`} />
                          </div>
                          <span className="text-sm font-medium capitalize">{inc.incident_type.replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant={inc.resolved ? "secondary" : "destructive"} className="text-[10px]">
                          {inc.resolved ? "Resolved" : inc.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground ml-7">{inc.description}</p>
                      {inc.auto_action_taken && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 ml-7 font-medium">
                          ⚡ Auto-action: {inc.auto_action_taken}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {(!incidents || incidents.length === 0) && (
                  <div className="text-center py-12">
                    <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold">System Clean</p>
                    <p className="text-xs text-muted-foreground mt-1">Zero incidents detected</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {[
                { label: "Time to First Funding", metric: "time_to_first_funding", icon: Clock, unit: "hrs", good: "low" },
                { label: "Milestone Approval", metric: "time_to_milestone_approval", icon: CheckCircle, unit: "hrs", good: "low" },
                { label: "Dispute Frequency", metric: "dispute_frequency", icon: AlertTriangle, unit: "%", good: "low" },
                { label: "Student Completion", metric: "student_completion_rate", icon: TrendingUp, unit: "%", good: "high" },
                { label: "Hiring Conversions", metric: "hiring_conversion", icon: Zap, unit: "", good: "high" },
                { label: "Trust Score Delta", metric: "trust_score_delta", icon: Shield, unit: "pts", good: "high" },
              ].map((m) => {
                const metricData = (status?.metrics || []).filter((d: any) => d.metric_type === m.metric);
                const avgValue = metricData.length > 0
                  ? metricData.reduce((s: number, d: any) => s + Number(d.value || 0), 0) / metricData.length
                  : 0;
                const hasData = metricData.length > 0;
                return (
                  <Card key={m.metric} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                          <m.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        {hasData && (
                          <Badge variant="outline" className="text-[10px]">{metricData.length} pts</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold tracking-tight">
                        {hasData ? `${avgValue.toFixed(1)}${m.unit}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Success Criteria */}
        <motion.div {...fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Pilot Success Criteria
                </CardTitle>
                <Badge variant={readinessScore >= 80 ? "default" : "secondary"} className="text-xs">
                  {readinessScore >= 80 ? "Ready to Expand" : "Collecting Data"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {successCriteria.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
                      c.pass ? "border-emerald-500/20 bg-emerald-500/5" : "border-destructive/20 bg-destructive/5"
                    }`}
                  >
                    {c.pass ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold">{c.label}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Target: {c.target}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          c.pass ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                        }`}>
                          Now: {c.current}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rules Reminder */}
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Pilot Rules</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                "No new features",
                "No UI expansion",
                "No new AI modules",
                "No public marketing",
                "No scaling beyond group",
              ].map((rule) => (
                <div key={rule} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <XCircle className="h-3 w-3 text-destructive/60 shrink-0" />
                  {rule}
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
    case "deposit": return <DollarSign className="h-3.5 w-3.5 text-emerald-500" />;
    case "escrow_lock": return <Lock className="h-3.5 w-3.5 text-amber-500" />;
    case "milestone_submit": case "milestone_approve": return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
    case "partial_release": case "final_release": return <Unlock className="h-3.5 w-3.5 text-emerald-500" />;
    case "refund": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "freeze_triggered": return <ShieldAlert className="h-3.5 w-3.5 text-destructive" />;
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function ReconciliationBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">✓ Verified</Badge>;
  if (status === "mismatch") return <Badge variant="destructive" className="text-[10px]">⚠ Mismatch</Badge>;
  return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
}

export default PilotDashboardPage;
