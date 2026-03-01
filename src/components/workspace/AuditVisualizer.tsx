import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusChip } from "@/components/ui/status-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  GitBranch, Clock, AlertTriangle, CheckCircle, XCircle,
  Shield, Eye, ArrowRight, Zap, RotateCcw, User,
} from "lucide-react";
import { formatDistanceToNow, differenceInHours, differenceInMinutes, format } from "date-fns";

// ============= Types =============

interface TransitionEvent {
  id: string;
  entity_id: string;
  entity_type: string;
  from_state: string;
  to_state: string;
  triggered_by: string | null;
  trigger_reason: string | null;
  created_at: string;
  metadata: any;
}

interface AnomalyFlag {
  type: "fast_approval" | "long_dispute" | "repeated_revision" | "sla_breach" | "long_escrow";
  severity: "low" | "medium" | "high";
  message: string;
  timestamp: string;
  entityId?: string;
}

// ============= Data Hooks =============

function useTransitionLogs(projectId: string, milestoneIds: string[]) {
  return useQuery({
    queryKey: ["audit-transitions", projectId, milestoneIds],
    queryFn: async () => {
      if (!milestoneIds.length) return [];
      const { data } = await supabase
        .from("state_transition_logs")
        .select("*")
        .in("entity_id", milestoneIds.slice(0, 50))
        .order("created_at", { ascending: true });
      return (data || []) as TransitionEvent[];
    },
    enabled: milestoneIds.length > 0,
    staleTime: 60_000,
  });
}

function useEscrowData(milestoneIds: string[]) {
  return useQuery({
    queryKey: ["audit-escrow", milestoneIds],
    queryFn: async () => {
      if (!milestoneIds.length) return [];
      const { data } = await (supabase as any)
        .from("escrow_transactions")
        .select("id, milestone_id, status, created_at, released_at, refunded_at, locked_at")
        .in("milestone_id", milestoneIds.slice(0, 50))
        .order("created_at");
      return (data || []) as any[];
    },
    enabled: milestoneIds.length > 0,
    staleTime: 60_000,
  });
}

function useReviewData(projectId: string) {
  return useQuery({
    queryKey: ["audit-reviews", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("review_requests")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      return (data || []) as any[];
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

// ============= Anomaly Detection =============

function detectAnomalies(transitions: TransitionEvent[], reviews: any[], escrows: any[]): AnomalyFlag[] {
  const anomalies: AnomalyFlag[] = [];

  // Fast approvals: submitted → approved in < 2 minutes
  for (let i = 1; i < transitions.length; i++) {
    const prev = transitions[i - 1];
    const curr = transitions[i];
    if (prev.to_state === "submitted" && curr.to_state === "approved" && prev.entity_id === curr.entity_id) {
      const mins = differenceInMinutes(new Date(curr.created_at), new Date(prev.created_at));
      if (mins < 2) {
        anomalies.push({
          type: "fast_approval",
          severity: "high",
          message: `Approval completed in ${mins} minute${mins !== 1 ? "s" : ""} — review thoroughness advisory`,
          timestamp: curr.created_at,
          entityId: curr.entity_id,
        });
      }
    }
  }

  // Long disputes: disputed state held > 72 hours
  const disputed = transitions.filter(t => t.to_state === "disputed");
  disputed.forEach(d => {
    const resolution = transitions.find(
      t => t.entity_id === d.entity_id && t.from_state === "disputed" && new Date(t.created_at) > new Date(d.created_at)
    );
    if (resolution) {
      const hours = differenceInHours(new Date(resolution.created_at), new Date(d.created_at));
      if (hours > 72) {
        anomalies.push({
          type: "long_dispute",
          severity: "medium",
          message: `Dispute duration: ${hours}h (exceeds 72h threshold)`,
          timestamp: d.created_at,
          entityId: d.entity_id,
        });
      }
    }
  });

  // Repeated revisions: same milestone submitted > 3 times
  const submissionCounts: Record<string, number> = {};
  transitions.filter(t => t.to_state === "submitted").forEach(t => {
    submissionCounts[t.entity_id] = (submissionCounts[t.entity_id] || 0) + 1;
  });
  Object.entries(submissionCounts).forEach(([id, count]) => {
    if (count > 3) {
      anomalies.push({
        type: "repeated_revision",
        severity: "medium",
        message: `${count} submission cycles detected — quality advisory`,
        timestamp: new Date().toISOString(),
        entityId: id,
      });
    }
  });

  return anomalies;
}

// ============= Flow Graph Component =============

interface FlowNodeProps {
  state: string;
  timestamp: string;
  actor?: string | null;
  durationFromPrev?: string;
  isActive?: boolean;
  hasAnomaly?: boolean;
  anomalyMessage?: string;
}

function FlowNode({ state, timestamp, actor, durationFromPrev, isActive, hasAnomaly, anomalyMessage }: FlowNodeProps) {
  const stateColors: Record<string, string> = {
    draft: "border-muted-foreground/30 bg-muted/50",
    funded: "border-primary/30 bg-primary/5",
    submitted: "border-chart-2/30 bg-chart-2/5",
    under_review: "border-chart-3/30 bg-chart-3/5",
    reviewed: "border-chart-3/30 bg-chart-3/5",
    approved: "border-success/30 bg-success/5",
    released: "border-success/30 bg-success/5",
    disputed: "border-destructive/30 bg-destructive/5",
    resolved: "border-warning/30 bg-warning/5",
    cancelled: "border-muted-foreground/30 bg-muted/20",
  };

  const nodeClass = stateColors[state] ?? "border-muted bg-card";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative flex flex-col items-center`}>
            {durationFromPrev && (
              <div className="text-[9px] text-muted-foreground mb-1 font-mono">{durationFromPrev}</div>
            )}
            <div className={`
              rounded-lg border-2 px-4 py-2.5 min-w-[100px] text-center transition-all cursor-pointer
              ${nodeClass}
              ${isActive ? "ring-2 ring-primary/40 shadow-sm" : ""}
              ${hasAnomaly ? "ring-2 ring-destructive/40" : ""}
            `}>
              <p className="text-xs font-semibold capitalize">{state.replace(/_/g, " ")}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {format(new Date(timestamp), "MMM d, HH:mm")}
              </p>
              {hasAnomaly && (
                <AlertTriangle className="h-3 w-3 text-destructive absolute -top-1.5 -right-1.5" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p><strong>State:</strong> {state}</p>
            <p><strong>Time:</strong> {format(new Date(timestamp), "PPpp")}</p>
            {actor && <p><strong>Actor:</strong> {actor.slice(0, 8)}…</p>}
            {hasAnomaly && <p className="text-destructive"><strong>Anomaly:</strong> {anomalyMessage}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FlowConnector() {
  return (
    <div className="flex items-center justify-center py-0.5">
      <div className="w-0.5 h-6 bg-border" />
    </div>
  );
}

// ============= Lifecycle Flow Graph =============

function LifecycleFlowGraph({ transitions, anomalies, milestoneId }: {
  transitions: TransitionEvent[];
  anomalies: AnomalyFlag[];
  milestoneId: string;
}) {
  const milestoneTransitions = transitions.filter(t => t.entity_id === milestoneId);

  if (!milestoneTransitions.length) {
    return <EmptyState icon={GitBranch} title="No lifecycle data" description="State transitions will appear as the milestone progresses." />;
  }

  // Build unique states in order
  const nodes: { state: string; timestamp: string; actor: string | null; durationFromPrev?: string }[] = [];
  
  // Add initial state
  nodes.push({ state: milestoneTransitions[0].from_state, timestamp: milestoneTransitions[0].created_at, actor: null });

  milestoneTransitions.forEach((t, i) => {
    const prevTs = i === 0 ? t.created_at : milestoneTransitions[i - 1].created_at;
    const hrs = differenceInHours(new Date(t.created_at), new Date(prevTs));
    const mins = differenceInMinutes(new Date(t.created_at), new Date(prevTs));
    const duration = hrs > 0 ? `${hrs}h` : `${mins}m`;
    nodes.push({ state: t.to_state, timestamp: t.created_at, actor: t.triggered_by, durationFromPrev: duration });
  });

  return (
    <div className="flex flex-col items-center py-4">
      {nodes.map((node, i) => {
        const nodeAnomaly = anomalies.find(a => a.entityId === milestoneId && 
          Math.abs(new Date(a.timestamp).getTime() - new Date(node.timestamp).getTime()) < 120_000
        );
        return (
          <div key={`${node.state}-${i}`}>
            {i > 0 && <FlowConnector />}
            <FlowNode
              state={node.state}
              timestamp={node.timestamp}
              actor={node.actor}
              durationFromPrev={i > 0 ? node.durationFromPrev : undefined}
              isActive={i === nodes.length - 1}
              hasAnomaly={!!nodeAnomaly}
              anomalyMessage={nodeAnomaly?.message}
            />
          </div>
        );
      })}
    </div>
  );
}

// ============= Escrow Timeline =============

function EscrowTimeline({ escrows }: { escrows: any[] }) {
  if (!escrows.length) {
    return <EmptyState icon={Shield} title="No escrow data" description="Escrow timeline will appear when funds are locked." />;
  }

  return (
    <div className="space-y-2">
      {escrows.map((e: any) => {
        const lockDuration = e.locked_at && e.released_at
          ? differenceInHours(new Date(e.released_at), new Date(e.locked_at))
          : e.locked_at
            ? differenceInHours(new Date(), new Date(e.locked_at))
            : null;

        return (
          <Card key={e.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium">Escrow {e.id.slice(0, 8)}</span>
                    <StatusChip status={e.status || "active"} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {format(new Date(e.created_at), "MMM d, HH:mm")}
                    </div>
                    {e.locked_at && (
                      <div>
                        <span className="font-medium">Locked:</span>{" "}
                        {format(new Date(e.locked_at), "MMM d, HH:mm")}
                      </div>
                    )}
                    {e.released_at && (
                      <div>
                        <span className="font-medium">Released:</span>{" "}
                        {format(new Date(e.released_at), "MMM d, HH:mm")}
                      </div>
                    )}
                    {e.refunded_at && (
                      <div>
                        <span className="font-medium">Refunded:</span>{" "}
                        {format(new Date(e.refunded_at), "MMM d, HH:mm")}
                      </div>
                    )}
                  </div>
                  {lockDuration !== null && (
                    <div className="text-[10px]">
                      <Clock className="h-3 w-3 inline mr-1 text-muted-foreground" />
                      Lock duration: <span className="font-semibold">{lockDuration}h</span>
                      {!e.released_at && <span className="text-muted-foreground"> (ongoing)</span>}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============= Review Path =============

function ReviewPath({ reviews }: { reviews: any[] }) {
  if (!reviews.length) {
    return <EmptyState icon={Eye} title="No review data" description="Review path will appear when reviews are requested." />;
  }

  const revisionCount = reviews.filter((r: any) => r.status === "revision_requested" || r.status === "rejected").length;
  const avgResponseHours = reviews.length > 1
    ? Math.round(reviews.reduce((s: number, r: any, i: number) => {
        if (i === 0) return 0;
        return s + differenceInHours(new Date(r.created_at), new Date(reviews[i - 1].created_at));
      }, 0) / (reviews.length - 1))
    : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-lg font-bold">{reviews.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Reviews</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-lg font-bold">{revisionCount}</p>
          <p className="text-[10px] text-muted-foreground">Revision Cycles</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-lg font-bold">{avgResponseHours}h</p>
          <p className="text-[10px] text-muted-foreground">Avg Response Time</p>
        </CardContent></Card>
      </div>

      <div className="space-y-1.5">
        {reviews.map((r: any, i: number) => (
          <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[10px] font-bold">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{r.instructions || "Review request"}</p>
              <p className="text-[9px] text-muted-foreground">{format(new Date(r.created_at), "MMM d, HH:mm")}</p>
            </div>
            <StatusChip status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= Audit Timeline =============

function AuditTimeline({ transitions, reviews, escrows, anomalies, filterType, filterActor }: {
  transitions: TransitionEvent[];
  reviews: any[];
  escrows: any[];
  anomalies: AnomalyFlag[];
  filterType: string;
  filterActor: string;
}) {
  const allEvents = useMemo(() => {
    const events: { type: string; timestamp: string; title: string; detail: string; actor?: string; hasAnomaly?: boolean; anomalyMsg?: string }[] = [];

    transitions.forEach(t => {
      events.push({
        type: "transition",
        timestamp: t.created_at,
        title: `${t.from_state} → ${t.to_state}`,
        detail: t.trigger_reason || "State transition",
        actor: t.triggered_by || undefined,
      });
    });

    reviews.forEach(r => {
      events.push({
        type: "review",
        timestamp: r.created_at,
        title: `Review: ${r.status}`,
        detail: r.instructions || "Review action",
        actor: r.reviewer_id || undefined,
      });
    });

    escrows.forEach(e => {
      events.push({
        type: "escrow",
        timestamp: e.created_at,
        title: `Escrow: ${e.status}`,
        detail: "Escrow state change",
      });
    });

    // Attach anomaly flags
    anomalies.forEach(a => {
      const closest = events.find(e =>
        Math.abs(new Date(e.timestamp).getTime() - new Date(a.timestamp).getTime()) < 300_000
      );
      if (closest) {
        closest.hasAnomaly = true;
        closest.anomalyMsg = a.message;
      }
    });

    return events
      .filter(e => filterType === "all" || e.type === filterType)
      .filter(e => !filterActor || e.actor === filterActor)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transitions, reviews, escrows, anomalies, filterType, filterActor]);

  if (!allEvents.length) {
    return <EmptyState icon={Clock} title="No audit events" description="Events will appear as the project progresses." />;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1">
        {allEvents.slice(0, 100).map((event, i) => (
          <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${event.hasAnomaly ? "border-destructive/30 bg-destructive/5" : "bg-card"}`}>
            <div className="mt-0.5">
              {event.type === "transition" ? <GitBranch className="h-3.5 w-3.5 text-primary" /> :
               event.type === "review" ? <Eye className="h-3.5 w-3.5 text-chart-3" /> :
               <Shield className="h-3.5 w-3.5 text-chart-2" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium">{event.title}</p>
                {event.hasAnomaly && <AlertTriangle className="h-3 w-3 text-destructive" />}
              </div>
              <p className="text-[9px] text-muted-foreground">{event.detail}</p>
              {event.hasAnomaly && <p className="text-[9px] text-destructive mt-0.5">{event.anomalyMsg}</p>}
            </div>
            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ============= Anomaly Panel =============

function AnomalyPanel({ anomalies }: { anomalies: AnomalyFlag[] }) {
  if (!anomalies.length) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <div>
            <p className="text-sm font-medium">No Anomalies Detected</p>
            <p className="text-[10px] text-muted-foreground">All lifecycle patterns within expected parameters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Anomalies Detected ({anomalies.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {anomalies.map((a, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-destructive/5 border border-destructive/10">
            <Zap className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
              a.severity === "high" ? "text-destructive" : a.severity === "medium" ? "text-warning" : "text-muted-foreground"
            }`} />
            <div>
              <p className="text-xs font-medium">{a.message}</p>
              <p className="text-[9px] text-muted-foreground capitalize">{a.type.replace(/_/g, " ")} · {a.severity} severity</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============= Main Export =============

interface AuditVisualizerProps {
  projectId: string;
  milestones: any[];
  milestoneIds: string[];
}

export function AuditVisualizer({ projectId, milestones, milestoneIds }: AuditVisualizerProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string>("");
  const [filterType, setFilterType] = useState("all");
  const [filterActor, setFilterActor] = useState("");
  const [subTab, setSubTab] = useState("flow");

  const transitions = useTransitionLogs(projectId, milestoneIds);
  const escrows = useEscrowData(milestoneIds);
  const reviews = useReviewData(projectId);

  const anomalies = useMemo(() => {
    if (!transitions.data) return [];
    return detectAnomalies(transitions.data, reviews.data || [], escrows.data || []);
  }, [transitions.data, reviews.data, escrows.data]);

  const activeMilestoneId = selectedMilestone || milestoneIds[0] || "";

  const isLoading = transitions.isLoading || escrows.isLoading || reviews.isLoading;

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Milestone selector + anomaly summary */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={activeMilestoneId} onValueChange={setSelectedMilestone}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select milestone" />
          </SelectTrigger>
          <SelectContent>
            {milestones.map((m: any) => (
              <SelectItem key={m.id} value={m.id}>
                {m.title || `Milestone ${m.id.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          {anomalies.length > 0 && (
            <Badge variant="destructive" className="text-[9px] gap-1">
              <AlertTriangle className="h-3 w-3" /> {anomalies.length} anomal{anomalies.length === 1 ? "y" : "ies"}
            </Badge>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="flow" className="text-xs gap-1"><GitBranch className="h-3 w-3" /> Lifecycle</TabsTrigger>
          <TabsTrigger value="escrow" className="text-xs gap-1"><Shield className="h-3 w-3" /> Escrow</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs gap-1"><Eye className="h-3 w-3" /> Reviews</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs gap-1"><Clock className="h-3 w-3" /> Timeline</TabsTrigger>
          <TabsTrigger value="anomalies" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Anomalies</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="flow">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Milestone Lifecycle Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <LifecycleFlowGraph
                  transitions={transitions.data || []}
                  anomalies={anomalies}
                  milestoneId={activeMilestoneId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escrow">
            <EscrowTimeline escrows={(escrows.data || []).filter((e: any) => !activeMilestoneId || e.milestone_id === activeMilestoneId)} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewPath reviews={reviews.data || []} />
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-sm">Audit Timeline</CardTitle>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="transition">Transitions</SelectItem>
                      <SelectItem value="review">Reviews</SelectItem>
                      <SelectItem value="escrow">Escrow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <AuditTimeline
                  transitions={transitions.data || []}
                  reviews={reviews.data || []}
                  escrows={escrows.data || []}
                  anomalies={anomalies}
                  filterType={filterType}
                  filterActor={filterActor}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies">
            <AnomalyPanel anomalies={anomalies} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
