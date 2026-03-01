import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusChip } from "@/components/ui/status-chip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectArtifacts, useActivityFeed, useProjectActivitySummary } from "@/hooks/useResearchWorkflow";
import {
  LayoutDashboard, Milestone as MilestoneIcon, CheckSquare, FileBox,
  ClipboardCheck, MessageSquare, Activity, BarChart3,
  ChevronRight, Clock, TrendingUp, ArrowLeft, FileText, Code, Database, File,
  CheckCircle, XCircle, AlertTriangle, Zap, Users, Shield, Eye,
  ArrowUpRight, ArrowDownRight, Minus, ListFilter, LayoutGrid, List,
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { AuditVisualizer } from "@/components/workspace/AuditVisualizer";

// ============= Shared Data Hooks =============

function useWorkspaceData(projectId: string) {
  const project = useQuery({
    queryKey: ["ecc-project", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").eq("id", projectId).maybeSingle();
      return data;
    },
    enabled: !!projectId,
  });

  const milestones = useQuery({
    queryKey: ["ecc-milestones", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("milestones").select("*").eq("offer_id", projectId).order("created_at");
      return data || [];
    },
    enabled: !!projectId,
  });

  const milestoneIds = useMemo(() => milestones.data?.map(m => m.id) || [], [milestones.data]);

  const tasks = useQuery({
    queryKey: ["ecc-tasks", projectId, milestoneIds],
    queryFn: async () => {
      if (!milestoneIds.length) return [];
      const { data } = await supabase.from("milestone_tasks").select("*").in("milestone_id", milestoneIds.slice(0, 50)).order("created_at");
      return data || [];
    },
    enabled: milestoneIds.length > 0,
  });

  const reviews = useQuery({
    queryKey: ["ecc-reviews", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("review_requests").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!projectId,
  });

  const summary = useProjectActivitySummary(projectId);
  const artifacts = useProjectArtifacts(projectId);
  const feed = useActivityFeed(projectId);

  return { project, milestones, tasks, reviews, summary, artifacts, feed, milestoneIds };
}

// ============= Execution Health Score =============

function computeExecutionHealth(milestones: any[], tasks: any[], reviews: any[], feed: any[]): number {
  if (!milestones.length) return 0;

  const total = milestones.length;
  const completed = milestones.filter(m => m.status === "approved" || m.status === "released").length;
  const disputed = milestones.filter(m => m.status === "disputed").length;
  const completionVelocity = total > 0 ? (completed / total) * 30 : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 20 : 10;

  const pendingReviews = reviews.filter(r => r.status === "pending").length;
  const totalReviews = reviews.length;
  const reviewScore = totalReviews > 0 ? Math.max(0, 20 - (pendingReviews / totalReviews) * 20) : 15;

  const disputeScore = Math.max(0, 15 - (disputed / total) * 15);

  const recentActivity = feed.filter(e => {
    const d = differenceInDays(new Date(), new Date(e.created_at));
    return d <= 7;
  }).length;
  const activityScore = Math.min(15, recentActivity * 1.5);

  return Math.round(Math.min(100, completionVelocity + taskScore + reviewScore + disputeScore + activityScore));
}

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-destructive";
  const bgColor = score >= 75 ? "stroke-success" : score >= 50 ? "stroke-warning" : "stroke-destructive";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" className="stroke-muted" />
        <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" className={bgColor}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-bold ${color}`}>{score}</span>
        <span className="text-[9px] text-muted-foreground">Health</span>
      </div>
    </div>
  );
}

// ============= Lifecycle Stepper =============

const LIFECYCLE_STATES = ["Draft", "Funded", "In Progress", "Submitted", "Approved", "Released"];

function LifecycleStepper({ currentStatus }: { currentStatus: string }) {
  const statusMap: Record<string, number> = {
    draft: 0, pending: 0, funded: 1, in_progress: 2, submitted: 3,
    under_review: 3, approved: 4, released: 5, completed: 5, disputed: 3,
  };
  const currentIdx = statusMap[currentStatus?.toLowerCase()] ?? 0;

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto">
      {LIFECYCLE_STATES.map((s, i) => {
        const isActive = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-0.5 shrink-0">
            <div className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
              isCurrent ? "bg-primary text-primary-foreground" :
              isActive ? "bg-primary/15 text-primary" :
              "bg-muted text-muted-foreground"
            }`}>{s}</div>
            {i < LIFECYCLE_STATES.length - 1 && (
              <ChevronRight className={`h-3 w-3 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============= Execution Overview Panel (Phase 1) =============

function ExecutionOverviewPanel({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const milestones = data.milestones.data || [];
  const tasks = data.tasks.data || [];
  const reviews = data.reviews.data || [];
  const feed = data.feed.data || [];
  const project = data.project.data;

  const health = useMemo(() => computeExecutionHealth(milestones, tasks, reviews, feed), [milestones, tasks, reviews, feed]);

  const total = milestones.length;
  const completed = milestones.filter(m => m.status === "approved" || m.status === "released").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgDays = useMemo(() => {
    const releasedMs = milestones.filter(m => m.status === "released" || m.status === "approved");
    if (!releasedMs.length) return null;
    const totalDays = releasedMs.reduce((sum, m) => sum + differenceInDays(new Date(m.updated_at), new Date(m.created_at)), 0);
    return Math.round(totalDays / releasedMs.length);
  }, [milestones]);

  const dominantStatus = useMemo(() => {
    if (!milestones.length) return "draft";
    const active = milestones.find(m => ["in_progress", "submitted", "funded"].includes(m.status));
    return active?.status || milestones[milestones.length - 1]?.status || "draft";
  }, [milestones]);

  if (data.project.isLoading) {
    return <div className="grid gap-4 md:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32 md:col-span-2" /><Skeleton className="h-32" /></div>;
  }

  if (!project) return <EmptyState icon={LayoutDashboard} title="Project not found" description="This project may not exist or you do not have access." />;

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold truncate">{project.title}</h2>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
        </div>
        <StatusChip status={project.status || "draft"} />
      </div>

      {/* Control Panel Grid */}
      <div className="grid gap-3 md:grid-cols-4">
        {/* Health Score */}
        <Card>
          <CardContent className="p-4 flex items-center justify-center">
            <HealthScoreRing score={health} />
          </CardContent>
        </Card>

        {/* Lifecycle + Capital Status */}
        <Card className="md:col-span-2">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Lifecycle</p>
              <LifecycleStepper currentStatus={dominantStatus} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold">{completed}/{total}</p>
                <p className="text-[10px] text-muted-foreground">Milestones Complete</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{pct}%</p>
                <p className="text-[10px] text-muted-foreground">Progress</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{avgDays !== null ? `${avgDays}d` : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Avg Release</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capital Velocity */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Capital Velocity</p>
            <div className="space-y-2">
              {[
                { label: "Funded", value: milestones.filter(m => m.status !== "draft" && m.status !== "pending").length, icon: Zap },
                { label: "Released", value: completed, icon: CheckCircle },
                { label: "Disputed", value: milestones.filter(m => m.status === "disputed").length, icon: AlertTriangle },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <item.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============= Milestone Control Matrix (Phase 2) =============

function MilestoneControlMatrix({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const [sortBy, setSortBy] = useState<string>("default");
  const milestones = data.milestones.data || [];
  const tasks = data.tasks.data || [];
  const reviews = data.reviews.data || [];

  const enriched = useMemo(() => milestones.map((m, idx) => {
    const mTasks = tasks.filter(t => t.milestone_id === m.id);
    const completedTasks = mTasks.filter(t => t.status === "completed").length;
    const taskPct = mTasks.length > 0 ? Math.round((completedTasks / mTasks.length) * 100) : 0;
    const mReviews = reviews.filter((r: any) => r.milestone_id === m.id);
    const pendingReview = mReviews.some((r: any) => r.status === "pending");
    const daysSinceUpdate = differenceInDays(new Date(), new Date(m.updated_at));
    const isIdle = daysSinceUpdate > 14 && !["approved", "released", "completed"].includes(m.status);
    const isOverdue = pendingReview && daysSinceUpdate > 7;
    const isDisputed = m.status === "disputed";
    const risk = isDisputed ? "high" : (isOverdue || isIdle) ? "medium" : "low";

    return { ...m, idx: idx + 1, taskPct, totalTasks: mTasks.length, completedTasks, pendingReview, isIdle, isOverdue, risk, daysSinceUpdate };
  }), [milestones, tasks, reviews]);

  const sorted = useMemo(() => {
    const copy = [...enriched];
    if (sortBy === "risk") copy.sort((a, b) => (a.risk === "high" ? -1 : a.risk === "medium" ? 0 : 1) - (b.risk === "high" ? -1 : b.risk === "medium" ? 0 : 1));
    if (sortBy === "progress") copy.sort((a, b) => a.taskPct - b.taskPct);
    if (sortBy === "status") copy.sort((a, b) => a.status.localeCompare(b.status));
    return copy;
  }, [enriched, sortBy]);

  if (data.milestones.isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (!milestones.length) return <EmptyState icon={MilestoneIcon} title="No milestones" description="Milestones will appear once the project structure is defined." />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{milestones.length} Milestones</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="risk">Risk Level</SelectItem>
            <SelectItem value="progress">Task Progress</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Header Row */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Milestone</div>
        <div className="col-span-1">State</div>
        <div className="col-span-2">Tasks</div>
        <div className="col-span-1">Review</div>
        <div className="col-span-2">Updated</div>
        <div className="col-span-1">Risk</div>
        <div className="col-span-1">Action</div>
      </div>

      <div className="space-y-1.5">
        {sorted.map(m => (
          <Card key={m.id} className={`transition-colors ${m.risk === "high" ? "border-destructive/30" : m.risk === "medium" ? "border-warning/30" : ""}`}>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="md:col-span-1">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-[10px] font-bold">{m.idx}</div>
                </div>
                <div className="md:col-span-3 min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  {m.description && <p className="text-[10px] text-muted-foreground truncate">{m.description}</p>}
                </div>
                <div className="md:col-span-1"><StatusChip status={m.status} /></div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.taskPct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{m.completedTasks}/{m.totalTasks}</span>
                  </div>
                </div>
                <div className="md:col-span-1">
                  {m.pendingReview ? (
                    <Tooltip><TooltipTrigger><Badge variant="warning" className="text-[9px]">Pending</Badge></TooltipTrigger>
                    <TooltipContent>Review overdue</TooltipContent></Tooltip>
                  ) : <span className="text-[10px] text-muted-foreground">—</span>}
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(m.updated_at), { addSuffix: true })}</span>
                </div>
                <div className="md:col-span-1">
                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    m.risk === "high" ? "bg-destructive/10 text-destructive" :
                    m.risk === "medium" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>
                    {m.risk === "high" ? <ArrowUpRight className="h-2.5 w-2.5" /> : m.risk === "medium" ? <Minus className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {m.risk}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <Link to={`/milestone/${m.id}/tasks`}>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 w-full"><Eye className="h-3 w-3" /></Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============= Task Board (Phase 3) =============

function TaskBoard({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const tasks = data.tasks.data || [];
  const milestones = data.milestones.data || [];
  const milestoneMap = useMemo(() => Object.fromEntries(milestones.map(m => [m.id, m.title])), [milestones]);

  if (data.tasks.isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  if (!tasks.length) return <EmptyState icon={CheckSquare} title="No tasks defined" description="Add tasks within milestones to track work breakdown." />;

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const columns = [
    { key: "pending", label: "Pending", items: tasks.filter(t => !t.status || t.status === "pending" || t.status === "todo") },
    { key: "in_progress", label: "In Progress", items: tasks.filter(t => t.status === "in_progress") },
    { key: "blocked", label: "Blocked", items: tasks.filter(t => t.status === "blocked") },
    { key: "completed", label: "Completed", items: tasks.filter(t => t.status === "completed") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">{completedCount}/{tasks.length} completed</Badge>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden w-32">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completedCount / tasks.length) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" className="h-7 rounded-none text-xs gap-1" onClick={() => setViewMode("list")}><List className="h-3 w-3" /></Button>
          <Button variant={viewMode === "board" ? "default" : "ghost"} size="sm" className="h-7 rounded-none text-xs gap-1" onClick={() => setViewMode("board")}><LayoutGrid className="h-3 w-3" /></Button>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {columns.map(col => (
            <div key={col.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{col.label}</p>
                <Badge variant="outline" className="text-[9px] h-4">{col.items.length}</Badge>
              </div>
              <div className="space-y-1.5 min-h-[80px]">
                {col.items.slice(0, 20).map(t => (
                  <Card key={t.id} className="bg-card">
                    <CardContent className="p-2.5">
                      <p className="text-xs font-medium line-clamp-2">{t.title}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 truncate">{milestoneMap[t.milestone_id] ?? ""}</p>
                    </CardContent>
                  </Card>
                ))}
                {col.items.length === 0 && <div className="border border-dashed rounded-lg p-4 text-center text-[10px] text-muted-foreground">No tasks</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {tasks.slice(0, 50).map(t => (
            <div key={t.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${t.status === "completed" ? "bg-muted/20" : "bg-card"}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                t.status === "completed" ? "bg-success" : t.status === "in_progress" ? "bg-primary" : t.status === "blocked" ? "bg-destructive" : "bg-muted-foreground"
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                <p className="text-[9px] text-muted-foreground">{milestoneMap[t.milestone_id] ?? ""}</p>
              </div>
              <StatusChip status={t.status || "pending"} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= Bottleneck Detection Panel (Phase 4) =============

function BottleneckPanel({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const milestones = data.milestones.data || [];
  const tasks = data.tasks.data || [];
  const reviews = data.reviews.data || [];

  const bottlenecks = useMemo(() => {
    const items: { severity: "high" | "medium" | "low"; title: string; description: string; responsible: string }[] = [];

    // Review overdue
    reviews.filter((r: any) => r.status === "pending").forEach((r: any) => {
      const days = differenceInDays(new Date(), new Date(r.created_at));
      if (days > 7) items.push({ severity: "high", title: "Review overdue", description: `Pending for ${days} days`, responsible: "Reviewer" });
      else if (days > 3) items.push({ severity: "medium", title: "Review approaching deadline", description: `Pending for ${days} days`, responsible: "Reviewer" });
    });

    // Idle milestones
    milestones.filter(m => !["approved", "released", "completed", "draft"].includes(m.status)).forEach(m => {
      const days = differenceInDays(new Date(), new Date(m.updated_at));
      if (days > 14) items.push({ severity: "high", title: `Milestone idle: ${m.title}`, description: `No activity for ${days} days`, responsible: "Assignee" });
      else if (days > 7) items.push({ severity: "medium", title: `Milestone slowing: ${m.title}`, description: `Last activity ${days} days ago`, responsible: "Assignee" });
    });

    // Disputed milestones
    milestones.filter(m => m.status === "disputed").forEach(m => {
      items.push({ severity: "high", title: `Dispute active: ${m.title}`, description: "Requires resolution to proceed", responsible: "Admin / Arbitrator" });
    });

    // Blocked tasks
    const blocked = tasks.filter(t => t.status === "blocked").length;
    if (blocked > 0) items.push({ severity: "medium", title: `${blocked} task(s) blocked`, description: "Blocked tasks impede milestone progress", responsible: "Assignee" });

    return items.sort((a, b) => (a.severity === "high" ? -1 : a.severity === "medium" ? 0 : 1) - (b.severity === "high" ? -1 : b.severity === "medium" ? 0 : 1));
  }, [milestones, tasks, reviews]);

  if (!bottlenecks.length) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="text-sm font-medium">No bottlenecks detected</p>
          <p className="text-[10px] text-muted-foreground">Execution is proceeding normally.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Execution Bottlenecks ({bottlenecks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {bottlenecks.slice(0, 8).map((b, i) => (
          <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${
            b.severity === "high" ? "border-destructive/30 bg-destructive/5" :
            b.severity === "medium" ? "border-warning/30 bg-warning/5" : "bg-card"
          }`}>
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
              b.severity === "high" ? "bg-destructive" : b.severity === "medium" ? "bg-warning" : "bg-success"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{b.title}</p>
              <p className="text-[10px] text-muted-foreground">{b.description}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">Responsible: {b.responsible}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============= Activity Intelligence Timeline (Phase 5) =============

function ActivityTimeline({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const [filter, setFilter] = useState<string>("all");
  const feed = data.feed.data || [];

  const filtered = useMemo(() => {
    if (filter === "all") return feed;
    return feed.filter((e: any) => e.entity_type === filter);
  }, [feed, filter]);

  if (data.feed.isLoading) return <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (!feed.length) return <EmptyState icon={Activity} title="No activity recorded" description="Project activity will appear as work progresses." />;

  const entityTypes = [...new Set(feed.map((e: any) => e.entity_type))];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" className="h-7 text-[10px]" onClick={() => setFilter("all")}>All</Button>
        {entityTypes.map(type => (
          <Button key={type} variant={filter === type ? "default" : "outline"} size="sm" className="h-7 text-[10px]" onClick={() => setFilter(type)}>
            {type}
          </Button>
        ))}
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-0.5">
          {filtered.slice(0, 100).map((e: any) => (
            <div key={e.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/30 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm"><span className="font-medium">{e.action}</span> <span className="text-muted-foreground">on {e.entity_type}</span></p>
                <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============= Collaboration Density Graph (Phase 6) =============

function CollaborationGraph({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const feed = data.feed.data || [];
  const tasks = data.tasks.data || [];
  const reviews = data.reviews.data || [];

  const chartData = useMemo(() => {
    const recentFeed = feed.filter((e: any) => differenceInDays(new Date(), new Date(e.created_at)) <= 30);
    const msgActivity = recentFeed.filter((e: any) => e.entity_type === "message").length;
    const taskActivity = recentFeed.filter((e: any) => e.entity_type === "task" || e.entity_type === "milestone_task").length;
    const reviewActivity = reviews.length;
    const artifactActivity = recentFeed.filter((e: any) => e.entity_type === "artifact").length;
    const milestoneActivity = recentFeed.filter((e: any) => e.entity_type === "milestone").length;
    const max = Math.max(msgActivity, taskActivity, reviewActivity, artifactActivity, milestoneActivity, 1);

    return [
      { metric: "Messages", value: Math.round((msgActivity / max) * 100) },
      { metric: "Tasks", value: Math.round((taskActivity / max) * 100) },
      { metric: "Reviews", value: Math.round((reviewActivity / max) * 100) },
      { metric: "Artifacts", value: Math.round((artifactActivity / max) * 100) },
      { metric: "Milestones", value: Math.round((milestoneActivity / max) * 100) },
    ];
  }, [feed, reviews]);

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Collaboration Density</CardTitle></CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============= Next Best Action Panel (Phase 7) =============

function NextBestAction({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const { userRole } = useAuth();
  const role = userRole?.role || "student";
  const milestones = data.milestones.data || [];
  const tasks = data.tasks.data || [];
  const reviews = data.reviews.data || [];

  const actions = useMemo(() => {
    const items: { label: string; description: string; icon: typeof Zap; href?: string }[] = [];
    const isStudent = role === "student" || role === "researcher";
    const isReviewer = role === "admin" || role === "tenant_admin" || role === "sponsor_admin";

    if (isStudent) {
      const pendingTasks = tasks.filter(t => t.status !== "completed").length;
      if (pendingTasks > 0) items.push({ label: "Complete pending tasks", description: `${pendingTasks} task(s) remaining`, icon: CheckSquare });

      const submittable = milestones.filter(m => m.status === "in_progress" || m.status === "funded");
      if (submittable.length) items.push({ label: "Submit milestone for review", description: submittable[0].title, icon: ArrowUpRight });

      const needsResponse = reviews.filter((r: any) => r.status === "revision_requested");
      if (needsResponse.length) items.push({ label: "Address review feedback", description: `${needsResponse.length} revision(s) requested`, icon: ClipboardCheck });
    }

    if (isReviewer) {
      const pendingReviews = reviews.filter((r: any) => r.status === "pending");
      if (pendingReviews.length) items.push({ label: "Review pending submissions", description: `${pendingReviews.length} awaiting review`, icon: ClipboardCheck, href: "/reviews" });

      const disputed = milestones.filter(m => m.status === "disputed");
      if (disputed.length) items.push({ label: "Resolve dispute", description: disputed[0].title, icon: Shield });

      const submitted = milestones.filter(m => m.status === "submitted");
      if (submitted.length) items.push({ label: "Approve submission", description: submitted[0].title, icon: CheckCircle });
    }

    if (!items.length) items.push({ label: "All actions completed", description: "No pending actions for your role.", icon: CheckCircle });
    return items;
  }, [role, milestones, tasks, reviews]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Recommended Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {actions.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
            <div className="p-1.5 rounded-md bg-primary/10"><a.icon className="h-3.5 w-3.5 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{a.label}</p>
              <p className="text-[10px] text-muted-foreground">{a.description}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============= Artifacts Tab =============

function ArtifactsTab({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const artifacts = (data.artifacts.data || []) as any[];
  const projectId = data.project.data?.id;

  const typeIcon = (t: string) => {
    switch (t) { case "code": return Code; case "dataset": return Database; case "draft": return FileText; default: return File; }
  };

  if (data.artifacts.isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  if (!artifacts.length) return <EmptyState icon={FileBox} title="No artifacts" description="Upload research artifacts to track deliverables." actionLabel="Manage Artifacts" actionHref={`/project/${projectId}/artifacts`} />;

  return (
    <div className="space-y-2">
      <div className="flex justify-end"><Link to={`/project/${projectId}/artifacts`}><Button variant="outline" size="sm" className="gap-1 text-xs"><FileBox className="h-3.5 w-3.5" /> Manage</Button></Link></div>
      {artifacts.slice(0, 20).map((a: any) => {
        const Icon = typeIcon(a.artifact_type);
        return (
          <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card">
            <div className="p-2 rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.title}</p>
              <p className="text-[9px] text-muted-foreground">v{a.version ?? 1} • {a.artifact_type}</p>
            </div>
            <StatusChip status={a.status ?? "active"} />
          </div>
        );
      })}
    </div>
  );
}

// ============= Reviews Tab =============

function ReviewsTab({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const reviews = (data.reviews.data || []) as any[];

  if (data.reviews.isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  if (!reviews.length) return <EmptyState icon={ClipboardCheck} title="No reviews" description="Request milestone reviews to track quality." actionLabel="View Reviews" actionHref="/reviews" />;

  return (
    <div className="space-y-1.5">
      {reviews.map((r: any) => (
        <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card">
          {r.status === "approved" ? <CheckCircle className="h-4 w-4 text-success shrink-0" /> : r.status === "rejected" ? <XCircle className="h-4 w-4 text-destructive shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{r.instructions || "Review request"}</p>
            <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
          </div>
          <StatusChip status={r.status} />
        </div>
      ))}
    </div>
  );
}

// ============= Messages Tab =============

function MessagesTab({ projectId }: { projectId: string }) {
  const { data: threads, isLoading } = useQuery({
    queryKey: ["ecc-messages", projectId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("message_threads").select("id, last_message_preview, last_message_at").eq("context_id", projectId).order("last_message_at", { ascending: false }).limit(10);
      return (data || []) as any[];
    },
    enabled: !!projectId,
  });

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!threads?.length) return <EmptyState icon={MessageSquare} title="No project messages" description="Conversations linked to this project will appear here." actionLabel="Open Messages" actionHref="/messages" />;

  return (
    <div className="space-y-1.5">
      {threads.map((t: any) => (
        <Link to={`/messages/${t.id}`} key={t.id}>
          <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{t.last_message_preview || "No messages yet"}</p>
              {t.last_message_at && <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true })}</p>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ============= Analytics Tab =============

function AnalyticsTab({ data }: { data: ReturnType<typeof useWorkspaceData> }) {
  const milestones = data.milestones.data || [];
  const summary = data.summary.data;

  const total = milestones.length;
  const completed = milestones.filter(m => m.status === "approved" || m.status === "released").length;
  const disputed = milestones.filter(m => m.status === "disputed").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const disputeRate = total > 0 ? Math.round((disputed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Completion Rate", value: `${completionRate}%`, sc: completionRate >= 75 ? "text-success" : completionRate >= 50 ? "text-warning" : "text-destructive" },
          { label: "Dispute Rate", value: `${disputeRate}%`, sc: disputeRate <= 10 ? "text-success" : disputeRate <= 25 ? "text-warning" : "text-destructive" },
          { label: "Total Tasks", value: `${summary?.total_tasks ?? 0}`, sc: "text-foreground" },
          { label: "Artifacts", value: `${summary?.artifact_count ?? 0}`, sc: "text-foreground" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${m.sc}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {total > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Milestone Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(milestones.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <StatusChip status={status} className="w-24 justify-center" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${((count as number) / total) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============= Main Execution Control Center =============

export default function ExecutionWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("command");

  if (!id) {
    return (
      <MainLayout>
        <div className="container py-12">
          <EmptyState icon={LayoutDashboard} title="No project selected" description="Navigate to a project to access the Execution Control Center." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/deals"><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Back to projects"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-lg font-bold">Execution Control Center</h1>
              <p className="text-xs text-muted-foreground">Unified project lifecycle intelligence</p>
            </div>
          </div>
        </div>
      </div>

      <WorkspaceContent projectId={id} activeTab={activeTab} setActiveTab={setActiveTab} />
    </MainLayout>
  );
}

function WorkspaceContent({ projectId, activeTab, setActiveTab }: { projectId: string; activeTab: string; setActiveTab: (v: string) => void }) {
  const data = useWorkspaceData(projectId);

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto space-y-6">
      {/* Phase 1: Execution Overview Panel */}
      <ExecutionOverviewPanel data={data} />

      {/* Tabs for detailed views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="command" className="gap-1.5 text-xs"><LayoutDashboard className="h-3.5 w-3.5" /> Command</TabsTrigger>
          <TabsTrigger value="milestones" className="gap-1.5 text-xs"><MilestoneIcon className="h-3.5 w-3.5" /> Milestones</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5 text-xs"><CheckSquare className="h-3.5 w-3.5" /> Tasks</TabsTrigger>
          <TabsTrigger value="artifacts" className="gap-1.5 text-xs"><FileBox className="h-3.5 w-3.5" /> Artifacts</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 text-xs"><ClipboardCheck className="h-3.5 w-3.5" /> Reviews</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" /> Messages</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs"><Eye className="h-3.5 w-3.5" /> Audit</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="command">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <BottleneckPanel data={data} />
                <CollaborationGraph data={data} />
              </div>
              <div className="space-y-4">
                <NextBestAction data={data} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="milestones"><MilestoneControlMatrix data={data} /></TabsContent>
          <TabsContent value="tasks"><TaskBoard data={data} /></TabsContent>
          <TabsContent value="artifacts"><ArtifactsTab data={data} /></TabsContent>
          <TabsContent value="reviews"><ReviewsTab data={data} /></TabsContent>
          <TabsContent value="messages"><MessagesTab projectId={projectId} /></TabsContent>
          <TabsContent value="activity"><ActivityTimeline data={data} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab data={data} /></TabsContent>
          <TabsContent value="audit"><AuditVisualizer projectId={projectId} milestones={data.milestones.data || []} milestoneIds={data.milestoneIds} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
