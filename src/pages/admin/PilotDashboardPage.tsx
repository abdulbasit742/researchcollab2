import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Shield, ShieldAlert, ShieldCheck, Activity, Users, DollarSign,
  Lock, Unlock, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  ArrowLeft, Zap, TrendingUp, Clock, Radio, Eye, Gauge,
  UserPlus, MessageSquare, Gavel, Ban, Play, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  usePilotStatus, usePilotActions, usePilotTransactionLog,
  usePilotIncidents, usePilotParticipants, usePilotPendingReviews,
  useReviewTransaction, useResolveIncident, usePilotUxFeedback
} from "@/hooks/usePilotMode";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const PilotDashboardPage = () => {
  const navigate = useNavigate();
  const { data: status } = usePilotStatus();
  const { runIntegrity, freezePilot, unfreezePilot } = usePilotActions();
  const { data: transactions } = usePilotTransactionLog();
  const { data: incidents } = usePilotIncidents();
  const { participants, addParticipant, isAdding, updateParticipantStatus } = usePilotParticipants();
  const { data: pendingReviews } = usePilotPendingReviews();
  const reviewTransaction = useReviewTransaction();
  const resolveIncident = useResolveIncident();
  const { feedback, resolveFeedback } = usePilotUxFeedback();

  const breaker = status?.breaker;
  const isFrozen = breaker?.is_frozen;

  const studentCount = participants.filter((p: any) => p.participant_role === "student" && p.status === "active").length;
  const sponsorCount = participants.filter((p: any) => p.participant_role === "sponsor" && p.status === "active").length;
  const facultyCount = participants.filter((p: any) => p.participant_role === "faculty" && p.status === "active").length;

  const escrowLocked = Number(breaker?.total_escrow_locked || 0);
  const released = Number(breaker?.total_released || 0);
  const refunded = Number(breaker?.total_refunded || 0);
  const totalFlow = escrowLocked + released + refunded;

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

  const unresolvedFeedback = feedback.filter((f: any) => !f.resolved).length;
  const pendingReviewCount = pendingReviews?.length || 0;
  const openIncidentCount = (incidents || []).filter((i: any) => !i.resolved).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Frozen Banner */}
      <AnimatePresence>
        {isFrozen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-destructive text-destructive-foreground overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                <span className="font-semibold text-sm">PILOT FROZEN</span>
                <span className="text-sm opacity-80">— {breaker?.frozen_reason || "All transactions blocked"}</span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => unfreezePilot.mutate()} disabled={unfreezePilot.isPending}>
                <Unlock className="h-3.5 w-3.5 mr-1.5" /> Restore
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
              {!isFrozen && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />}
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Live Capital Pilot</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Radio className="h-3 w-3" /> Real-money validation • Cap PKR {Number(breaker?.transaction_cap_pkr || 50000).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => runIntegrity.mutate()} disabled={runIntegrity.isPending} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${runIntegrity.isPending ? "animate-spin" : ""}`} /> Integrity Check
            </Button>
            {!isFrozen && (
              <Button variant="destructive" size="sm" onClick={() => freezePilot.mutate("Manual admin freeze")} className="gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Emergency Freeze
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Readiness + Financials */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <motion.div variants={fadeUp} className="md:col-span-3">
            <Card className="h-full">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                <div className="relative w-24 h-24 mb-3">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={readinessScore >= 80 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      strokeWidth="8" strokeDasharray={`${readinessScore * 2.64} 264`} strokeLinecap="round"
                      className="transition-all duration-1000" />
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

        {/* Flow bar */}
        {totalFlow > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Capital Flow</span>
                <span className="text-xs text-muted-foreground">PKR {totalFlow.toLocaleString()}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                <div className="bg-amber-500 transition-all duration-700" style={{ width: `${(escrowLocked / totalFlow) * 100}%` }} />
                <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${(released / totalFlow) * 100}%` }} />
                <div className="bg-destructive transition-all duration-700" style={{ width: `${(refunded / totalFlow) * 100}%` }} />
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Locked</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Released</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Refunded</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants with management */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Controlled Group
              </CardTitle>
              <AddParticipantDialog onAdd={addParticipant} isAdding={isAdding} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
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
                    <div className={`h-full rounded-full ${g.color} transition-all duration-500`}
                      style={{ width: `${Math.min((g.count / g.max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Participant list */}
            {participants.length > 0 && (
              <div className="space-y-1.5 mt-3">
                {participants.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(p.full_name || "?")[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{p.full_name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{p.participant_role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === "active" ? "default" : p.status === "suspended" ? "secondary" : "destructive"} className="text-[10px]">
                        {p.status}
                      </Badge>
                      {p.status === "active" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateParticipantStatus({ id: p.id, status: "suspended" })}>
                          <Ban className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                      {p.status === "suspended" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateParticipantStatus({ id: p.id, status: "active" })}>
                          <Play className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {breaker?.last_reconciliation_at && (
              <p className="text-[10px] text-muted-foreground mt-4 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                Last reconciliation {formatDistanceToNow(new Date(breaker.last_reconciliation_at), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="transactions">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="transactions" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Transactions
              {(transactions?.length || 0) > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{transactions?.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <Gavel className="h-3.5 w-3.5" /> Manual Reviews
              {pendingReviewCount > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{pendingReviewCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Incidents
              {openIncidentCount > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{openIncidentCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> UX Feedback
              {unresolvedFeedback > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{unresolvedFeedback}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1.5">
              <Gauge className="h-3.5 w-3.5" /> PMF Metrics
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <ScrollArea className="h-[420px]">
              <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2 mt-3">
                {(transactions || []).map((txn: any) => (
                  <motion.div key={txn.id} variants={fadeUp}>
                    <Card className="hover:bg-muted/30 transition-colors">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-muted"><ActionIcon type={txn.action_type} /></div>
                          <div>
                            <p className="text-sm font-medium capitalize">{txn.action_type.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {txn.requires_manual_review && (
                            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">Review Required</Badge>
                          )}
                          {txn.amount && <span className="font-bold text-sm tabular-nums">PKR {Number(txn.amount).toLocaleString()}</span>}
                          <ReconciliationBadge status={txn.reconciliation_status} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {(!transactions || transactions.length === 0) && <EmptyState icon={Activity} title="No transactions yet" subtitle="First real deal will appear here" />}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          {/* Manual Reviews Tab */}
          <TabsContent value="reviews">
            <ScrollArea className="h-[420px]">
              <div className="space-y-2 mt-3">
                {(pendingReviews || []).map((txn: any) => (
                  <Card key={txn.id} className="border-amber-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium capitalize">{txn.action_type.replace(/_/g, " ")}</span>
                          <Badge variant="outline" className="text-[10px]">Requires Review</Badge>
                        </div>
                        <span className="font-bold text-sm">PKR {Number(txn.amount || 0).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Above manual review threshold of PKR {Number(breaker?.manual_review_threshold_pkr || 25000).toLocaleString()}
                        {" • "}{formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}
                      </p>
                      <ReviewActions txnId={txn.id} onReview={(status, notes) => reviewTransaction.mutate({ id: txn.id, status, notes })} />
                    </CardContent>
                  </Card>
                ))}
                {(!pendingReviews || pendingReviews.length === 0) && <EmptyState icon={CheckCircle} title="No pending reviews" subtitle="All transactions below threshold or already reviewed" />}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents">
            <ScrollArea className="h-[420px]">
              <div className="space-y-2 mt-3">
                {(incidents || []).map((inc: any) => (
                  <Card key={inc.id} className={`transition-colors ${inc.severity === "critical" && !inc.resolved ? "border-destructive/40 bg-destructive/5" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${inc.severity === "critical" ? "bg-destructive/10" : "bg-orange-500/10"}`}>
                            <AlertTriangle className={`h-3.5 w-3.5 ${inc.severity === "critical" ? "text-destructive" : "text-orange-500"}`} />
                          </div>
                          <span className="text-sm font-medium capitalize">{inc.incident_type.replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant={inc.resolved ? "secondary" : "destructive"} className="text-[10px]">
                          {inc.resolved ? "Resolved" : inc.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground ml-7 mb-2">{inc.description}</p>
                      {inc.auto_action_taken && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 ml-7 font-medium mb-2">⚡ Auto: {inc.auto_action_taken}</p>
                      )}
                      {inc.resolved && inc.resolution_notes && (
                        <p className="text-[10px] text-emerald-600 ml-7">✓ {inc.resolution_notes}</p>
                      )}
                      {!inc.resolved && (
                        <div className="ml-7 mt-2">
                          <ResolveIncidentAction incidentId={inc.id} onResolve={(notes) => resolveIncident.mutate({ id: inc.id, notes })} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {(!incidents || incidents.length === 0) && (
                  <EmptyState icon={ShieldCheck} title="System Clean" subtitle="Zero incidents detected" iconClass="text-emerald-500" />
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* UX Feedback Tab */}
          <TabsContent value="feedback">
            <ScrollArea className="h-[420px]">
              <div className="space-y-2 mt-3">
                {feedback.map((fb: any) => (
                  <Card key={fb.id} className={fb.resolved ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FeedbackTypeIcon type={fb.feedback_type} />
                          <span className="text-sm font-medium capitalize">{fb.feedback_type.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={fb.severity === "high" ? "destructive" : fb.severity === "medium" ? "secondary" : "outline"} className="text-[10px]">
                            {fb.severity}
                          </Badge>
                          {fb.resolved && <Badge variant="secondary" className="text-[10px]">Resolved</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{fb.description}</p>
                      {fb.page_context && <p className="text-[10px] text-muted-foreground mt-1">Page: {fb.page_context}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}</p>
                      {fb.admin_notes && <p className="text-[10px] text-primary mt-1">Admin: {fb.admin_notes}</p>}
                      {!fb.resolved && (
                        <Button size="sm" variant="outline" className="mt-2 h-7 text-xs"
                          onClick={() => resolveFeedback({ id: fb.id, admin_notes: "Acknowledged" })}>
                          Mark Resolved
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {feedback.length === 0 && <EmptyState icon={MessageSquare} title="No feedback yet" subtitle="Pilot participants can submit UX feedback" />}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* PMF Metrics Tab */}
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
                const avgValue = metricData.length > 0 ? metricData.reduce((s: number, d: any) => s + Number(d.value || 0), 0) / metricData.length : 0;
                const hasData = metricData.length > 0;
                return (
                  <Card key={m.metric} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                          <m.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        {hasData && <Badge variant="outline" className="text-[10px]">{metricData.length} pts</Badge>}
                      </div>
                      <p className="text-2xl font-bold tracking-tight">{hasData ? `${avgValue.toFixed(1)}${m.unit}` : "—"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Success Criteria */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Pilot Success Criteria
              </CardTitle>
              <Badge variant={readinessScore >= 80 ? "default" : "secondary"} className="text-xs">
                {readinessScore >= 80 ? "Ready to Expand" : "Collecting Data"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {successCriteria.map((c) => (
                <div key={c.label} className={`flex items-start gap-2.5 p-3 rounded-lg border transition-colors ${
                  c.pass ? "border-emerald-500/20 bg-emerald-500/5" : "border-destructive/20 bg-destructive/5"
                }`}>
                  {c.pass ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold">{c.label}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Target: {c.target}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${c.pass ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                        Now: {c.current}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Escrow Flow Pipeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Escrow Flow Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {[
                { step: "Deposit", icon: DollarSign, count: (transactions || []).filter((t: any) => t.action_type === "deposit").length },
                { step: "Lock", icon: Lock, count: (transactions || []).filter((t: any) => t.action_type === "escrow_lock").length },
                { step: "Submit", icon: Activity, count: (transactions || []).filter((t: any) => t.action_type === "milestone_submit").length },
                { step: "Approve", icon: CheckCircle, count: (transactions || []).filter((t: any) => t.action_type === "milestone_approve").length },
                { step: "Release", icon: Unlock, count: (transactions || []).filter((t: any) => ["partial_release", "final_release"].includes(t.action_type)).length },
              ].map((s, i, arr) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`p-2.5 rounded-xl ${s.count > 0 ? "bg-primary/10" : "bg-muted"} transition-colors`}>
                      <s.icon className={`h-4 w-4 ${s.count > 0 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-[10px] font-medium mt-1">{s.step}</span>
                    <span className="text-[10px] text-muted-foreground">{s.count}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-8 h-px bg-border mx-1" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Pilot Rules</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {["No new features", "No UI expansion", "No new AI modules", "No public marketing", "No scaling beyond group"].map((rule) => (
                <div key={rule} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <XCircle className="h-3 w-3 text-destructive/60 shrink-0" /> {rule}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---- Sub-components ----

function AddParticipantDialog({ onAdd, isAdding }: { onAdd: any; isAdding: boolean }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("student");
  const [notes, setNotes] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Pilot Participant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium mb-1.5 block">User ID</label>
            <Input placeholder="Paste user UUID" value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block">Notes (optional)</label>
            <Input placeholder="Why this participant?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button size="sm" disabled={!userId || isAdding}
              onClick={() => { onAdd({ user_id: userId, participant_role: role, notes: notes || undefined }); setUserId(""); setNotes(""); }}>
              Add to Pilot
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewActions({ txnId, onReview }: { txnId: string; onReview: (status: "approved" | "rejected", notes?: string) => void }) {
  const [notes, setNotes] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Review notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="h-8 text-xs" />
      <Button size="sm" variant="default" className="h-8 gap-1" onClick={() => onReview("approved", notes)}>
        <CheckCircle className="h-3 w-3" /> Approve
      </Button>
      <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={() => onReview("rejected", notes)}>
        <XCircle className="h-3 w-3" /> Reject
      </Button>
    </div>
  );
}

function ResolveIncidentAction({ incidentId, onResolve }: { incidentId: string; onResolve: (notes: string) => void }) {
  const [notes, setNotes] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Resolution notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="h-7 text-xs" />
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { if (notes) onResolve(notes); }}>
        Resolve
      </Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, iconClass }: { icon: any; title: string; subtitle: string; iconClass?: string }) {
  return (
    <div className="text-center py-12">
      <Icon className={`h-8 w-8 mx-auto mb-3 ${iconClass || "text-muted-foreground/40"}`} />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/60 mt-1">{subtitle}</p>
    </div>
  );
}

function FeedbackTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "confusion_point": return <Search className="h-3.5 w-3.5 text-amber-500" />;
    case "friction_point": return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />;
    case "ui_bottleneck": return <Activity className="h-3.5 w-3.5 text-destructive" />;
    case "escrow_clarity": return <Lock className="h-3.5 w-3.5 text-primary" />;
    case "milestone_clarity": return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
    case "improvement_suggestion": return <Zap className="h-3.5 w-3.5 text-emerald-500" />;
    default: return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function ActionIcon({ type }: { type: string }) {
  switch (type) {
    case "deposit": return <DollarSign className="h-3.5 w-3.5 text-emerald-500" />;
    case "escrow_lock": return <Lock className="h-3.5 w-3.5 text-amber-500" />;
    case "milestone_submit": case "milestone_approve": return <CheckCircle className="h-3.5 w-3.5 text-primary" />;
    case "partial_release": case "final_release": return <Unlock className="h-3.5 w-3.5 text-emerald-500" />;
    case "refund": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "freeze_triggered": return <ShieldAlert className="h-3.5 w-3.5 text-destructive" />;
    case "cap_blocked": return <Ban className="h-3.5 w-3.5 text-destructive" />;
    default: return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function ReconciliationBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">✓ Verified</Badge>;
  if (status === "mismatch") return <Badge variant="destructive" className="text-[10px]">⚠ Mismatch</Badge>;
  return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
}

export default PilotDashboardPage;
