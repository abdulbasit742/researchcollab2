import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectArtifacts, useActivityFeed, useProjectActivitySummary, useMyReviewRequests } from "@/hooks/useResearchWorkflow";
import {
  LayoutDashboard, Milestone as MilestoneIcon, CheckSquare, FileBox,
  ClipboardCheck, MessageSquare, Activity, BarChart3,
  ChevronRight, Clock, TrendingUp, ArrowLeft, FileText, Code, Database, File,
  Star, CheckCircle, XCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// ============= Overview Tab =============
function OverviewTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["workspace-project", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").eq("id", projectId).maybeSingle();
      return data;
    },
    enabled: !!projectId,
  });

  const { data: milestones } = useQuery({
    queryKey: ["workspace-milestones", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("milestones").select("*").eq("offer_id", projectId).order("created_at");
      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: summary } = useProjectActivitySummary(projectId);

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>)}</div>;
  if (!project) return <EmptyState icon={LayoutDashboard} title="Project not found" description="This project may not exist or you may not have access." />;

  const completed = milestones?.filter(m => m.status === "approved" || m.status === "released").length || 0;
  const total = milestones?.length || 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{project.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: MilestoneIcon, label: "Milestones", value: `${completed}/${total}` },
          { icon: TrendingUp, label: "Progress", value: `${pct}%` },
          { icon: CheckSquare, label: "Tasks", value: `${summary?.completed_tasks ?? 0}/${summary?.total_tasks ?? 0}` },
          { icon: FileBox, label: "Artifacts", value: `${summary?.artifact_count ?? 0}` },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><m.icon className="h-4 w-4 text-primary" /></div>
                <div><p className="text-2xl font-bold">{m.value}</p><p className="text-xs text-muted-foreground">{m.label}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Next Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {milestones?.filter(m => m.status === "funded" || m.status === "in_progress").slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div><p className="text-sm font-medium">{m.title}</p><p className="text-xs text-muted-foreground">Status: {m.status}</p></div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )) || <p className="text-sm text-muted-foreground">No pending actions.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= Milestones Tab =============
const STATUS_COLORS: Record<string, string> = {
  funded: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  submitted: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  released: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  disputed: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

function MilestonesTab({ projectId }: { projectId: string }) {
  const { data: milestones, isLoading } = useQuery({
    queryKey: ["workspace-milestones-tab", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("milestones").select("*").eq("offer_id", projectId).order("created_at");
      return data || [];
    },
    enabled: !!projectId,
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (!milestones?.length) return <EmptyState icon={MilestoneIcon} title="No milestones" description="Milestones will appear here once created." />;

  return (
    <div className="space-y-3">
      {/* State Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {["Draft","Funded","In Progress","Submitted","Approved","Released"].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className="px-2 py-1 rounded text-[10px] font-medium bg-muted text-muted-foreground">{s}</div>
            {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>
      {milestones.map((m, idx) => (
        <Card key={m.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-bold shrink-0">{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{m.title}</h3>
                {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={STATUS_COLORS[m.status] || "bg-muted text-muted-foreground"}>{m.status}</Badge>
                  <Link to={`/milestone/${m.id}/tasks`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><CheckSquare className="h-3 w-3" /> Tasks</Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============= Tasks Tab (aggregated across milestones) =============
function TasksTab({ projectId }: { projectId: string }) {
  const { data: milestones } = useQuery({
    queryKey: ["workspace-milestones-for-tasks", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("milestones").select("id, title").eq("offer_id", projectId).order("created_at");
      return data || [];
    },
    enabled: !!projectId,
  });

  const milestoneIds = milestones?.map(m => m.id) || [];

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["workspace-all-tasks", projectId, milestoneIds],
    queryFn: async () => {
      if (milestoneIds.length === 0) return [];
      const { data } = await supabase.from("milestone_tasks").select("*").in("milestone_id", milestoneIds.slice(0, 50)).order("created_at");
      return data || [];
    },
    enabled: milestoneIds.length > 0,
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  if (!tasks?.length) return <EmptyState icon={CheckSquare} title="No tasks yet" description="Add tasks within milestones to track work breakdown." />;

  const milestoneMap = Object.fromEntries((milestones || []).map(m => [m.id, m.title]));
  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="outline">{completedCount}/{tasks.length} completed</Badge>
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="space-y-1.5">
        {tasks.map(t => (
          <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${t.status === "completed" ? "bg-muted/30" : "bg-card"}`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "completed" ? "bg-emerald-500" : t.status === "in_progress" ? "bg-blue-500" : "bg-muted-foreground"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
              <p className="text-[10px] text-muted-foreground">{milestoneMap[t.milestone_id] ?? "Unknown milestone"}</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{t.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= Artifacts Tab =============
function ArtifactsTab({ projectId }: { projectId: string }) {
  const { data: artifacts = [], isLoading } = useProjectArtifacts(projectId);

  const typeIcon = (t: string) => {
    switch (t) { case "code": return Code; case "dataset": return Database; case "draft": return FileText; default: return File; }
  };

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (!artifacts.length) return <EmptyState icon={FileBox} title="No artifacts" description="Upload research artifacts to track deliverables." actionLabel="Upload Artifact" actionHref={`/project/${projectId}/artifacts`} />;

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Link to={`/project/${projectId}/artifacts`}><Button variant="outline" size="sm" className="gap-1"><FileBox className="h-3.5 w-3.5" /> Manage Artifacts</Button></Link>
      </div>
      {artifacts.slice(0, 15).map((a: any) => {
        const Icon = typeIcon(a.artifact_type);
        return (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <div className="p-2 rounded-lg bg-muted"><Icon className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.title}</p>
              <p className="text-[10px] text-muted-foreground">v{a.version ?? 1} • {a.artifact_type}</p>
            </div>
            <Badge variant="outline" className="text-[10px]">{a.status ?? "active"}</Badge>
          </div>
        );
      })}
    </div>
  );
}

// ============= Reviews Tab =============
function ReviewsTab({ projectId }: { projectId: string }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["workspace-reviews", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("review_requests").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!projectId,
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  if (!reviews.length) return <EmptyState icon={ClipboardCheck} title="No reviews" description="Request milestone reviews to track progress." actionLabel="View All Reviews" actionHref="/reviews" />;

  return (
    <div className="space-y-2">
      {reviews.map((r: any) => (
        <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          {r.status === "approved" ? <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" /> : r.status === "rejected" ? <XCircle className="h-4 w-4 text-destructive shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{r.instructions || "Review request"}</p>
            <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
          </div>
          <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "outline"} className="text-[10px]">{r.status}</Badge>
        </div>
      ))}
    </div>
  );
}

// ============= Messages Tab =============
function MessagesTab({ projectId }: { projectId: string }) {
  const { data: threads, isLoading } = useQuery({
    queryKey: ["workspace-messages", projectId],
    queryFn: async () => {
      const { data } = await (supabase as any).from("message_threads").select("id, last_message_preview, last_message_at").eq("context_id", projectId).order("last_message_at", { ascending: false }).limit(10);
      return (data || []) as any[];
    },
    enabled: !!projectId,
  });

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!threads?.length) return <EmptyState icon={MessageSquare} title="No project messages" description="Start a conversation linked to this project." actionLabel="Open Messages" actionHref="/messages" />;

  return (
    <div className="space-y-2">
      {threads.map((t: any) => (
        <Link to={`/messages/${t.id}`} key={t.id}>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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

// ============= Activity Tab =============
function ActivityTab({ projectId }: { projectId: string }) {
  const { data: feed = [], isLoading } = useActivityFeed(projectId);

  if (isLoading) return <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  if (!feed.length) return <EmptyState icon={Activity} title="No activity yet" description="Project activity will appear here as work progresses." />;

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-1">
        {feed.slice(0, 50).map((e: any) => (
          <div key={e.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/30">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm"><span className="font-medium">{e.action}</span> on <span className="text-muted-foreground">{e.entity_type}</span></p>
              <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ============= Analytics Tab =============
function AnalyticsTab({ projectId }: { projectId: string }) {
  const { data: milestones } = useQuery({
    queryKey: ["workspace-analytics-milestones", projectId],
    queryFn: async () => {
      const { data } = await supabase.from("milestones").select("status, created_at, updated_at").eq("offer_id", projectId);
      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: summary } = useProjectActivitySummary(projectId);

  const total = milestones?.length || 0;
  const completed = milestones?.filter(m => m.status === "approved" || m.status === "released").length || 0;
  const disputed = milestones?.filter(m => m.status === "disputed").length || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const disputeRate = total > 0 ? Math.round((disputed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Completion Rate", value: `${completionRate}%`, sc: completionRate >= 75 ? "text-emerald-600" : completionRate >= 50 ? "text-amber-600" : "text-destructive" },
          { label: "Dispute Rate", value: `${disputeRate}%`, sc: disputeRate <= 10 ? "text-emerald-600" : disputeRate <= 25 ? "text-amber-600" : "text-destructive" },
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
              {Object.entries(milestones!.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24">{status}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_COLORS[status]?.includes("emerald") ? "bg-emerald-500" : STATUS_COLORS[status]?.includes("blue") ? "bg-blue-500" : STATUS_COLORS[status]?.includes("yellow") ? "bg-yellow-500" : "bg-muted-foreground"}`} style={{ width: `${((count as number) / total) * 100}%` }} />
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

// ============= Main Workspace =============
export default function ExecutionWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  if (!id) {
    return (
      <MainLayout>
        <div className="container py-12">
          <EmptyState icon={LayoutDashboard} title="No project selected" description="Navigate to a project to open its workspace." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/deals"><Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-lg font-bold">Execution Workspace</h1>
              <p className="text-xs text-muted-foreground">Unified project lifecycle</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="milestones" className="gap-1.5"><MilestoneIcon className="h-3.5 w-3.5" /> Milestones</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5"><CheckSquare className="h-3.5 w-3.5" /> Tasks</TabsTrigger>
            <TabsTrigger value="artifacts" className="gap-1.5"><FileBox className="h-3.5 w-3.5" /> Artifacts</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5"><ClipboardCheck className="h-3.5 w-3.5" /> Reviews</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Messages</TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview"><OverviewTab projectId={id} /></TabsContent>
            <TabsContent value="milestones"><MilestonesTab projectId={id} /></TabsContent>
            <TabsContent value="tasks"><TasksTab projectId={id} /></TabsContent>
            <TabsContent value="artifacts"><ArtifactsTab projectId={id} /></TabsContent>
            <TabsContent value="reviews"><ReviewsTab projectId={id} /></TabsContent>
            <TabsContent value="messages"><MessagesTab projectId={id} /></TabsContent>
            <TabsContent value="activity"><ActivityTab projectId={id} /></TabsContent>
            <TabsContent value="analytics"><AnalyticsTab projectId={id} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
