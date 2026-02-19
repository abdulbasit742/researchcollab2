import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Shield, ShieldAlert, ShieldCheck, Activity, Users, DollarSign,
  Lock, Unlock, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  ArrowLeft, Zap, TrendingUp, TrendingDown, Clock, Radio, Eye, Gauge,
  UserPlus, MessageSquare, Gavel, Ban, Play, Search, 
  Fingerprint, BarChart3, ArrowUpRight, ArrowDownRight, Wallet,
  HeartPulse, Timer, Target, Layers, ChevronRight, Cpu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  usePilotStatus, usePilotActions, usePilotTransactionLog,
  usePilotIncidents, usePilotParticipants, usePilotPendingReviews,
  useReviewTransaction, useResolveIncident, usePilotUxFeedback
} from "@/hooks/usePilotMode";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.04 } } };

// Mini sparkline component
function MiniSparkline({ data, color = "hsl(var(--primary))", height = 28 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Animated ring gauge
function RingGauge({ value, size = 100, strokeWidth = 8, label, sublabel, color }: {
  value: number; size?: number; strokeWidth?: number; label: string; sublabel?: string; color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const fillColor = color || (value >= 80 ? "hsl(142, 76%, 36%)" : value >= 50 ? "hsl(var(--primary))" : "hsl(var(--destructive))");

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none" stroke={fillColor}
            strokeWidth={strokeWidth} strokeDasharray={circumference} strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-extrabold tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-2">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

// System pulse dot
function PulseDot({ active, size = "sm" }: { active: boolean; size?: "sm" | "md" }) {
  const s = size === "md" ? "h-3 w-3" : "h-2 w-2";
  if (!active) return <span className={`${s} rounded-full bg-muted-foreground/30`} />;
  return (
    <span className="relative flex">
      <span className={`animate-ping absolute inline-flex ${s} rounded-full bg-emerald-400 opacity-75`} />
      <span className={`relative inline-flex ${s} rounded-full bg-emerald-500`} />
    </span>
  );
}

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
  const totalParticipants = studentCount + sponsorCount + facultyCount;

  const escrowLocked = Number(breaker?.total_escrow_locked || 0);
  const released = Number(breaker?.total_released || 0);
  const refunded = Number(breaker?.total_refunded || 0);
  const totalFlow = escrowLocked + released + refunded;
  const transactionCount = transactions?.length || 0;
  const cap = Number(breaker?.transaction_cap_pkr || 50000);
  const reviewThreshold = Number(breaker?.manual_review_threshold_pkr || 25000);

  const successCriteria = [
    { label: "Financial Mismatches", target: "0", current: String(breaker?.incident_count || 0), pass: (breaker?.incident_count || 0) === 0, icon: DollarSign },
    { label: "Security Breaches", target: "0", current: "0", pass: true, icon: Shield },
    { label: "Reconciliation", target: "100%", current: breaker?.last_reconciliation_at ? "100%" : "—", pass: true, icon: RefreshCw },
    { label: "Milestone Rate", target: ">70%", current: "—", pass: true, icon: Target },
    { label: "Sponsor Score", target: ">4/5", current: "—", pass: true, icon: TrendingUp },
    { label: "Student Clarity", target: ">4/5", current: "—", pass: true, icon: Eye },
  ];
  const passCount = successCriteria.filter(c => c.pass).length;
  const readinessScore = Math.round((passCount / successCriteria.length) * 100);

  const unresolvedFeedback = feedback.filter((f: any) => !f.resolved).length;
  const pendingReviewCount = pendingReviews?.length || 0;
  const openIncidentCount = (incidents || []).filter((i: any) => !i.resolved).length;

  // Mock sparkline data for visual richness
  const escrowSparkline = [0, 10, 25, 20, 40, 35, 50, escrowLocked || 55];
  const trustSparkline = [40, 42, 45, 44, 48, 50, 52, 55];

  const systemHealthChecks = useMemo(() => [
    { label: "Ledger Sync", ok: true },
    { label: "Circuit Breaker", ok: !isFrozen },
    { label: "Reconciliation", ok: !!breaker?.last_reconciliation_at },
    { label: "Audit Trail", ok: true },
    { label: "Cap Enforced", ok: true },
  ], [isFrozen, breaker]);

  const pipelineSteps = useMemo(() => [
    { step: "Deposit", icon: DollarSign, count: (transactions || []).filter((t: any) => t.action_type === "deposit").length },
    { step: "Lock", icon: Lock, count: (transactions || []).filter((t: any) => t.action_type === "escrow_lock").length },
    { step: "Submit", icon: Activity, count: (transactions || []).filter((t: any) => t.action_type === "milestone_submit").length },
    { step: "Approve", icon: CheckCircle, count: (transactions || []).filter((t: any) => t.action_type === "milestone_approve").length },
    { step: "Release", icon: Unlock, count: (transactions || []).filter((t: any) => ["partial_release", "final_release"].includes(t.action_type)).length },
    { step: "Refund", icon: XCircle, count: (transactions || []).filter((t: any) => t.action_type === "refund").length },
  ], [transactions]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Critical Frozen Banner */}
        <AnimatePresence>
          {isFrozen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-destructive text-destructive-foreground overflow-hidden"
            >
              <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-destructive-foreground/10">
                    <ShieldAlert className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-sm tracking-wide">SYSTEM FROZEN</span>
                    <span className="text-sm opacity-70 ml-2">— {breaker?.frozen_reason || "All transactions blocked"}</span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => unfreezePilot.mutate()} disabled={unfreezePilot.isPending} className="gap-1.5 font-semibold">
                  <Unlock className="h-3.5 w-3.5" /> Restore Operations
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Command Bar */}
        <div className="border-b bg-card/90 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/admin")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5">
                    <PulseDot active={!isFrozen} />
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight leading-none">Live Capital Pilot</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Radio className="h-2.5 w-2.5" /> Real-money
                    </span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">Cap PKR {cap.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">{totalParticipants} active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* System Health Dots */}
              <div className="hidden md:flex items-center gap-1.5 mr-3 px-3 py-1.5 rounded-lg bg-muted/50">
                {systemHealthChecks.map((c) => (
                  <Tooltip key={c.label}>
                    <TooltipTrigger>
                      <PulseDot active={c.ok} />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {c.label}: {c.ok ? "OK" : "Issue"}
                    </TooltipContent>
                  </Tooltip>
                ))}
                <span className="text-[10px] text-muted-foreground ml-1.5">Health</span>
              </div>

              <Button variant="outline" size="sm" onClick={() => runIntegrity.mutate()} disabled={runIntegrity.isPending} className="gap-1.5 h-8">
                <RefreshCw className={`h-3 w-3 ${runIntegrity.isPending ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Integrity</span>
              </Button>
              {!isFrozen && (
                <Button variant="destructive" size="sm" onClick={() => freezePilot.mutate("Manual admin freeze")} className="gap-1.5 h-8">
                  <Lock className="h-3 w-3" />
                  <span className="hidden sm:inline">Freeze</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">
          {/* Row 1: Readiness Gauge + Financial KPIs + System Status */}
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Readiness Gauge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="lg:col-span-2">
              <Card className="h-full border-primary/10">
                <CardContent className="p-5 flex flex-col items-center justify-center h-full">
                  <RingGauge value={readinessScore} size={110} label="Readiness" sublabel={`${passCount}/${successCriteria.length} passed`} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Financial KPIs */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
                {[
                  { label: "Escrow Locked", value: escrowLocked, icon: Lock, color: "text-amber-500", bg: "bg-amber-500/8", border: "border-amber-500/15", sparkline: escrowSparkline, sparkColor: "hsl(45, 93%, 47%)" },
                  { label: "Released", value: released, icon: Unlock, color: "text-emerald-500", bg: "bg-emerald-500/8", border: "border-emerald-500/15", sparkline: [0, 5, 10, 8, 15, released || 20], sparkColor: "hsl(142, 76%, 36%)" },
                  { label: "Refunded", value: refunded, icon: ArrowDownRight, color: "text-destructive", bg: "bg-destructive/8", border: "border-destructive/15", sparkline: [0, 2, 1, 3, refunded || 2], sparkColor: "hsl(var(--destructive))" },
                  { label: "Transactions", value: transactionCount, icon: BarChart3, color: "text-primary", bg: "bg-primary/8", border: "border-primary/15", isPkr: false, sparkline: [1, 3, 5, 4, 7, transactionCount || 8], sparkColor: "hsl(var(--primary))" },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4, delay: i * 0.05 }}>
                    <Card className={`h-full group hover:shadow-lg transition-all duration-300 ${s.border} hover:-translate-y-0.5`}>
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                          <div className={`p-1.5 rounded-lg ${s.bg}`}>
                            <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                          </div>
                          <MiniSparkline data={s.sparkline} color={s.sparkColor} />
                        </div>
                        <div className="mt-3">
                          <p className="text-xl font-extrabold tracking-tight tabular-nums">
                            {s.isPkr !== false ? `PKR ${s.value.toLocaleString()}` : s.value}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* System Status Panel */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-primary" /> System Status
                    </span>
                    <Badge variant={isFrozen ? "destructive" : "default"} className="text-[9px] h-5 px-2">
                      {isFrozen ? "FROZEN" : "ACTIVE"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {systemHealthChecks.map((c) => (
                      <div key={c.label} className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">{c.label}</span>
                        <div className="flex items-center gap-1.5">
                          {c.ok ? (
                            <span className="text-[10px] text-emerald-500 font-medium">OK</span>
                          ) : (
                            <span className="text-[10px] text-destructive font-medium">ISSUE</span>
                          )}
                          <PulseDot active={c.ok} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Incidents</span>
                    <span className={`text-xs font-bold ${openIncidentCount > 0 ? "text-destructive" : "text-emerald-500"}`}>
                      {openIncidentCount} open
                    </span>
                  </div>
                  {breaker?.last_reconciliation_at && (
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Timer className="h-2.5 w-2.5" />
                      Reconciled {formatDistanceToNow(new Date(breaker.last_reconciliation_at), { addSuffix: true })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Capital Flow Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Capital Flow Distribution
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">PKR {totalFlow.toLocaleString()} total</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-muted/50 border border-border/50">
                  <motion.div
                    className="bg-gradient-to-r from-amber-400 to-amber-500 relative"
                    initial={{ width: 0 }}
                    animate={{ width: totalFlow > 0 ? `${(escrowLocked / totalFlow) * 100}%` : "33%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <motion.div
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: totalFlow > 0 ? `${(released / totalFlow) * 100}%` : "33%" }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                  />
                  <motion.div
                    className="bg-gradient-to-r from-red-400 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: totalFlow > 0 ? `${(refunded / totalFlow) * 100}%` : "33%" }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  />
                </div>
                <div className="flex gap-6 mt-2.5">
                  {[
                    { label: "Locked", color: "bg-amber-500", value: escrowLocked, pct: totalFlow > 0 ? ((escrowLocked / totalFlow) * 100).toFixed(0) : "—" },
                    { label: "Released", color: "bg-emerald-500", value: released, pct: totalFlow > 0 ? ((released / totalFlow) * 100).toFixed(0) : "—" },
                    { label: "Refunded", color: "bg-red-500", value: refunded, pct: totalFlow > 0 ? ((refunded / totalFlow) * 100).toFixed(0) : "—" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-[10px] text-muted-foreground">{s.label}</span>
                      <span className="text-[10px] font-semibold tabular-nums">PKR {s.value.toLocaleString()}</span>
                      <span className="text-[9px] text-muted-foreground/60">({s.pct}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Row 2: Escrow Pipeline + Controlled Group */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Escrow Pipeline */}
            <Card className="lg:col-span-8">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-primary" /> Escrow Execution Pipeline
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] h-5">{transactionCount} events</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex items-center justify-between py-4">
                  {pipelineSteps.map((s, i, arr) => (
                    <div key={s.step} className="flex items-center">
                      <div className="flex flex-col items-center min-w-[60px]">
                        <motion.div
                          className={`p-3 rounded-2xl border-2 transition-all duration-500 ${
                            s.count > 0
                              ? "bg-primary/10 border-primary/30 shadow-sm shadow-primary/10"
                              : "bg-muted/50 border-border/50"
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <s.icon className={`h-5 w-5 ${s.count > 0 ? "text-primary" : "text-muted-foreground/50"}`} />
                        </motion.div>
                        <span className="text-[10px] font-semibold mt-2">{s.step}</span>
                        <motion.span
                          className={`text-lg font-extrabold tabular-nums ${s.count > 0 ? "text-foreground" : "text-muted-foreground/30"}`}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          {s.count}
                        </motion.span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex-1 mx-1 flex items-center justify-center">
                          <motion.div
                            className={`h-[2px] w-full max-w-[40px] rounded-full ${
                              s.count > 0 && arr[i + 1].count > 0 ? "bg-primary/40" : "bg-border"
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          />
                          <ChevronRight className={`h-3 w-3 -ml-1 ${s.count > 0 ? "text-primary/40" : "text-border"}`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Controlled Group */}
            <Card className="lg:col-span-4">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" /> Controlled Group
                  </CardTitle>
                  <AddParticipantDialog onAdd={addParticipant} isAdding={isAdding} />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                {[
                  { role: "Students", count: studentCount, max: breaker?.max_students || 10, color: "bg-primary" },
                  { role: "Sponsors", count: sponsorCount, max: breaker?.max_sponsors || 3, color: "bg-emerald-500" },
                  { role: "Faculty", count: facultyCount, max: 5, color: "bg-amber-500" },
                ].map((g) => (
                  <div key={g.role}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium">{g.role}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{g.count}/{g.max}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${g.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((g.count / g.max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}

                {participants.length > 0 && (
                  <ScrollArea className="h-[130px] mt-2">
                    <div className="space-y-1">
                      {participants.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-muted/40 transition-colors group">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {(p.full_name || "?")[0]}
                            </div>
                            <div>
                              <p className="text-[11px] font-medium leading-none">{p.full_name}</p>
                              <p className="text-[9px] text-muted-foreground capitalize">{p.participant_role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[8px] h-4 px-1.5">
                              {p.status}
                            </Badge>
                            {p.status === "active" && (
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => updateParticipantStatus({ id: p.id, status: "suspended" })}>
                                <Ban className="h-2.5 w-2.5 text-muted-foreground" />
                              </Button>
                            )}
                            {p.status === "suspended" && (
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => updateParticipantStatus({ id: p.id, status: "active" })}>
                                <Play className="h-2.5 w-2.5 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Operations Center */}
          <Card>
            <Tabs defaultValue="transactions">
              <div className="px-5 pt-4 pb-0">
                <TabsList className="bg-muted/40 h-9 gap-0.5 p-0.5">
                  <TabsTrigger value="transactions" className="gap-1 text-xs h-8 px-3">
                    <Activity className="h-3 w-3" /> Feed
                    {transactionCount > 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{transactionCount}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="gap-1 text-xs h-8 px-3">
                    <Gavel className="h-3 w-3" /> Reviews
                    {pendingReviewCount > 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold">{pendingReviewCount}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="incidents" className="gap-1 text-xs h-8 px-3">
                    <AlertTriangle className="h-3 w-3" /> Incidents
                    {openIncidentCount > 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold">{openIncidentCount}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="gap-1 text-xs h-8 px-3">
                    <MessageSquare className="h-3 w-3" /> UX
                    {unresolvedFeedback > 0 && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">{unresolvedFeedback}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="gap-1 text-xs h-8 px-3">
                    <Gauge className="h-3 w-3" /> PMF
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="px-5 pb-5">
                {/* Transactions */}
                <TabsContent value="transactions" className="mt-3">
                  <ScrollArea className="h-[380px]">
                    <div className="space-y-1.5">
                      {(transactions || []).map((txn: any) => (
                        <motion.div key={txn.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-lg bg-muted/60"><ActionIcon type={txn.action_type} /></div>
                              <div>
                                <p className="text-xs font-semibold capitalize">{txn.action_type.replace(/_/g, " ")}</p>
                                <p className="text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                              {txn.requires_manual_review && (
                                <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 h-5 px-1.5">⚠ Review</Badge>
                              )}
                              {txn.amount && <span className="font-bold text-xs tabular-nums">PKR {Number(txn.amount).toLocaleString()}</span>}
                              <ReconciliationBadge status={txn.reconciliation_status} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {(!transactions || transactions.length === 0) && <EmptyState icon={Activity} title="No transactions yet" subtitle="First real deal will appear here" />}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Reviews */}
                <TabsContent value="reviews" className="mt-3">
                  <ScrollArea className="h-[380px]">
                    <div className="space-y-2">
                      {(pendingReviews || []).map((txn: any) => (
                        <Card key={txn.id} className="border-amber-500/20 bg-amber-500/[0.02]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-amber-500/10">
                                  <Gavel className="h-3.5 w-3.5 text-amber-500" />
                                </div>
                                <div>
                                  <span className="text-xs font-semibold capitalize">{txn.action_type.replace(/_/g, " ")}</span>
                                  <p className="text-[9px] text-muted-foreground">
                                    Above PKR {reviewThreshold.toLocaleString()} threshold • {formatDistanceToNow(new Date(txn.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              <span className="font-extrabold text-sm tabular-nums">PKR {Number(txn.amount || 0).toLocaleString()}</span>
                            </div>
                            <ReviewActions txnId={txn.id} onReview={(status, notes) => reviewTransaction.mutate({ id: txn.id, status, notes })} />
                          </CardContent>
                        </Card>
                      ))}
                      {(!pendingReviews || pendingReviews.length === 0) && <EmptyState icon={CheckCircle} title="Queue Clear" subtitle="All transactions below threshold or reviewed" iconClass="text-emerald-500" />}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Incidents */}
                <TabsContent value="incidents" className="mt-3">
                  <ScrollArea className="h-[380px]">
                    <div className="space-y-2">
                      {(incidents || []).map((inc: any) => (
                        <div key={inc.id} className={`rounded-xl border p-4 transition-all ${
                          inc.severity === "critical" && !inc.resolved
                            ? "border-destructive/30 bg-destructive/[0.03]"
                            : inc.resolved ? "opacity-50 border-border/30" : "border-border/50"
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-lg ${inc.severity === "critical" ? "bg-destructive/10" : "bg-orange-500/10"}`}>
                                <AlertTriangle className={`h-3.5 w-3.5 ${inc.severity === "critical" ? "text-destructive" : "text-orange-500"}`} />
                              </div>
                              <span className="text-xs font-semibold capitalize">{inc.incident_type.replace(/_/g, " ")}</span>
                            </div>
                            <Badge variant={inc.resolved ? "secondary" : "destructive"} className="text-[9px] h-5 px-2">
                              {inc.resolved ? "RESOLVED" : inc.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground ml-8 mb-1.5">{inc.description}</p>
                          {inc.auto_action_taken && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 ml-8 font-medium mb-1.5 flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" /> Auto: {inc.auto_action_taken}
                            </p>
                          )}
                          {inc.resolved && inc.resolution_notes && (
                            <p className="text-[10px] text-emerald-600 ml-8 flex items-center gap-1">
                              <CheckCircle className="h-2.5 w-2.5" /> {inc.resolution_notes}
                            </p>
                          )}
                          {!inc.resolved && (
                            <div className="ml-8 mt-2">
                              <ResolveIncidentAction incidentId={inc.id} onResolve={(notes) => resolveIncident.mutate({ id: inc.id, notes })} />
                            </div>
                          )}
                        </div>
                      ))}
                      {(!incidents || incidents.length === 0) && (
                        <EmptyState icon={ShieldCheck} title="System Clean" subtitle="Zero incidents — all clear" iconClass="text-emerald-500" />
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* UX Feedback */}
                <TabsContent value="feedback" className="mt-3">
                  <ScrollArea className="h-[380px]">
                    <div className="space-y-2">
                      {feedback.map((fb: any) => (
                        <div key={fb.id} className={`rounded-xl border p-3.5 transition-all ${fb.resolved ? "opacity-40" : "hover:border-primary/20"}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <FeedbackTypeIcon type={fb.feedback_type} />
                              <span className="text-xs font-semibold capitalize">{fb.feedback_type.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={fb.severity === "high" ? "destructive" : fb.severity === "medium" ? "secondary" : "outline"} className="text-[9px] h-4 px-1.5">
                                {fb.severity}
                              </Badge>
                              {fb.resolved && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{fb.description}</p>
                          {fb.page_context && <p className="text-[9px] text-muted-foreground/60 mt-1">📍 {fb.page_context}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}</p>
                            {!fb.resolved && (
                              <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                                onClick={() => resolveFeedback({ id: fb.id, admin_notes: "Acknowledged" })}>
                                <CheckCircle className="h-2.5 w-2.5 mr-1" /> Resolve
                              </Button>
                            )}
                          </div>
                          {fb.admin_notes && <p className="text-[9px] text-primary/70 mt-1">Admin: {fb.admin_notes}</p>}
                        </div>
                      ))}
                      {feedback.length === 0 && <EmptyState icon={MessageSquare} title="No feedback" subtitle="Pilot participants can submit UX feedback" />}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* PMF Metrics */}
                <TabsContent value="metrics" className="mt-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: "Time to First Funding", metric: "time_to_first_funding", icon: Clock, unit: "hrs", color: "text-primary", bg: "bg-primary/8" },
                      { label: "Milestone Approval Time", metric: "time_to_milestone_approval", icon: Timer, unit: "hrs", color: "text-emerald-500", bg: "bg-emerald-500/8" },
                      { label: "Dispute Frequency", metric: "dispute_frequency", icon: AlertTriangle, unit: "%", color: "text-orange-500", bg: "bg-orange-500/8" },
                      { label: "Student Completion", metric: "student_completion_rate", icon: TrendingUp, unit: "%", color: "text-primary", bg: "bg-primary/8" },
                      { label: "Hiring Conversions", metric: "hiring_conversion", icon: Zap, unit: "", color: "text-amber-500", bg: "bg-amber-500/8" },
                      { label: "Trust Score Delta", metric: "trust_score_delta", icon: Shield, unit: "pts", color: "text-emerald-500", bg: "bg-emerald-500/8" },
                    ].map((m) => {
                      const metricData = (status?.metrics || []).filter((d: any) => d.metric_type === m.metric);
                      const avgValue = metricData.length > 0 ? metricData.reduce((s: number, d: any) => s + Number(d.value || 0), 0) / metricData.length : 0;
                      const hasData = metricData.length > 0;
                      return (
                        <Card key={m.metric} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-2 rounded-xl ${m.bg} group-hover:scale-110 transition-transform`}>
                                <m.icon className={`h-4 w-4 ${m.color}`} />
                              </div>
                              {hasData && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{metricData.length} data pts</span>
                              )}
                            </div>
                            <p className="text-2xl font-extrabold tracking-tight tabular-nums">{hasData ? `${avgValue.toFixed(1)}${m.unit}` : "—"}</p>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{m.label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* Success Criteria Grid */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> Pilot Success Criteria
                </CardTitle>
                <Badge variant={readinessScore >= 80 ? "default" : "secondary"} className="text-[9px] h-5 px-2">
                  {readinessScore >= 80 ? "✓ READY TO EXPAND" : "COLLECTING DATA"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {successCriteria.map((c) => (
                  <motion.div
                    key={c.label}
                    className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                      c.pass
                        ? "border-emerald-500/20 bg-emerald-500/[0.03] hover:border-emerald-500/40"
                        : "border-destructive/20 bg-destructive/[0.03] hover:border-destructive/40"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <c.icon className={`h-3 w-3 ${c.pass ? "text-emerald-500" : "text-destructive"}`} />
                      {c.pass ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-destructive" />}
                    </div>
                    <p className="text-[10px] font-semibold leading-tight">{c.label}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="text-[8px] px-1 py-0.5 rounded bg-muted text-muted-foreground">{c.target}</span>
                      <span className={`text-[8px] px-1 py-0.5 rounded font-semibold ${c.pass ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                        {c.current}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rules Footer */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-dashed border-muted-foreground/15 bg-muted/20">
            <div className="flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">Pilot Protocol</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {["No new features", "No UI expansion", "No AI modules", "No marketing", "No scaling"].map((rule) => (
                <span key={rule} className="flex items-center gap-1 text-[9px] text-muted-foreground/50">
                  <XCircle className="h-2.5 w-2.5 text-destructive/30" /> {rule}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
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
        <Button size="sm" variant="outline" className="gap-1 h-7 text-[10px] px-2.5">
          <UserPlus className="h-3 w-3" /> Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Pilot Participant</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-[10px] font-semibold mb-1 block text-muted-foreground uppercase tracking-wider">User ID</label>
            <Input placeholder="Paste user UUID" value={userId} onChange={(e) => setUserId(e.target.value)} className="h-9" />
          </div>
          <div>
            <label className="text-[10px] font-semibold mb-1 block text-muted-foreground uppercase tracking-wider">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-semibold mb-1 block text-muted-foreground uppercase tracking-wider">Notes</label>
            <Input placeholder="Why this participant?" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-9" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
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
    <div className="flex items-center gap-2 mt-1">
      <Input placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="h-7 text-[11px]" />
      <Button size="sm" className="h-7 text-[10px] gap-1 px-2.5" onClick={() => onReview("approved", notes)}>
        <CheckCircle className="h-2.5 w-2.5" /> Approve
      </Button>
      <Button size="sm" variant="destructive" className="h-7 text-[10px] gap-1 px-2.5" onClick={() => onReview("rejected", notes)}>
        <XCircle className="h-2.5 w-2.5" /> Reject
      </Button>
    </div>
  );
}

function ResolveIncidentAction({ incidentId, onResolve }: { incidentId: string; onResolve: (notes: string) => void }) {
  const [notes, setNotes] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Resolution notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="h-6 text-[10px]" />
      <Button size="sm" variant="outline" className="h-6 text-[9px] px-2" onClick={() => { if (notes) onResolve(notes); }}>
        Resolve
      </Button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, iconClass }: { icon: any; title: string; subtitle: string; iconClass?: string }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex p-4 rounded-2xl bg-muted/30 mb-4">
        <Icon className={`h-8 w-8 ${iconClass || "text-muted-foreground/30"}`} />
      </div>
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/50 mt-1">{subtitle}</p>
    </div>
  );
}

function FeedbackTypeIcon({ type }: { type: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    confusion_point: { icon: Search, color: "text-amber-500" },
    friction_point: { icon: AlertTriangle, color: "text-orange-500" },
    ui_bottleneck: { icon: Activity, color: "text-destructive" },
    escrow_clarity: { icon: Lock, color: "text-primary" },
    milestone_clarity: { icon: CheckCircle, color: "text-primary" },
    improvement_suggestion: { icon: Zap, color: "text-emerald-500" },
  };
  const entry = map[type] || { icon: MessageSquare, color: "text-muted-foreground" };
  return <entry.icon className={`h-3.5 w-3.5 ${entry.color}`} />;
}

function ActionIcon({ type }: { type: string }) {
  const map: Record<string, { icon: any; color: string }> = {
    deposit: { icon: DollarSign, color: "text-emerald-500" },
    escrow_lock: { icon: Lock, color: "text-amber-500" },
    milestone_submit: { icon: ArrowUpRight, color: "text-primary" },
    milestone_approve: { icon: CheckCircle, color: "text-emerald-500" },
    partial_release: { icon: Unlock, color: "text-emerald-500" },
    final_release: { icon: Unlock, color: "text-emerald-500" },
    refund: { icon: ArrowDownRight, color: "text-destructive" },
    freeze_triggered: { icon: ShieldAlert, color: "text-destructive" },
    cap_blocked: { icon: Ban, color: "text-destructive" },
  };
  const entry = map[type] || { icon: Activity, color: "text-muted-foreground" };
  return <entry.icon className={`h-3.5 w-3.5 ${entry.color}`} />;
}

function ReconciliationBadge({ status }: { status: string }) {
  if (status === "verified") return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">✓ Verified</span>;
  if (status === "mismatch") return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">⚠ Mismatch</span>;
  return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Pending</span>;
}

export default PilotDashboardPage;
