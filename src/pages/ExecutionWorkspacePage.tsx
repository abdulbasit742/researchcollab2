import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Milestone as MilestoneIcon,
  CheckSquare,
  FileBox,
  ClipboardCheck,
  MessageSquare,
  Activity,
  ChevronRight,
  Plus,
  Clock,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";

// Sub-components for each tab
function OverviewTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ["workspace-project", projectId],
    queryFn: async () => {
      // Try offers first (deals = offers in this platform)
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      return data;
    },
    enabled: !!projectId,
  });

  const { data: milestones } = useQuery({
    queryKey: ["workspace-milestones", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("milestones")
        .select("*")
        .eq("offer_id", projectId)
        .order("created_at");
      return data || [];
    },
    enabled: !!projectId,
  });

  const { data: activitySummary } = useQuery({
    queryKey: ["workspace-activity-summary", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("project_activity_summary")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      return data;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!project) {
    return <EmptyState icon={LayoutDashboard} title="Project not found" description="This project may not exist or you may not have access." />;
  }

  const completedMilestones = milestones?.filter(m => m.status === "approved" || m.status === "released").length || 0;
  const totalMilestones = milestones?.length || 0;
  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{project.status}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><MilestoneIcon className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</p>
                <p className="text-xs text-muted-foreground">Milestones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{progressPct}%</p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><CheckSquare className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{activitySummary?.completed_tasks ?? 0}/{activitySummary?.total_tasks ?? 0}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><FileBox className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{activitySummary?.artifact_count ?? 0}</p>
                <p className="text-xs text-muted-foreground">Artifacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Next Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {milestones?.filter(m => m.status === "funded" || m.status === "in_progress").slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">Status: {m.status}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No pending actions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MilestonesTab({ projectId }: { projectId: string }) {
  const { data: milestones, isLoading } = useQuery({
    queryKey: ["workspace-milestones-tab", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("milestones")
        .select("*")
        .eq("offer_id", projectId)
        .order("created_at");
      return data || [];
    },
    enabled: !!projectId,
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  if (!milestones?.length) {
    return <EmptyState icon={MilestoneIcon} title="No milestones" description="Milestones will appear here once created." />;
  }

  const statusColors: Record<string, string> = {
    funded: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    submitted: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    approved: "bg-green-500/10 text-green-700 dark:text-green-400",
    released: "bg-green-500/10 text-green-700 dark:text-green-400",
    disputed: "bg-red-500/10 text-red-700 dark:text-red-400",
    pending: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-3">
      {milestones.map((m, idx) => (
        <Card key={m.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{m.title}</h3>
                  {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={statusColors[m.status] || "bg-muted text-muted-foreground"}>
                      {m.status}
                    </Badge>
                    <Link to={`/milestone/${m.id}/tasks`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <CheckSquare className="h-3 w-3" /> Tasks
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlaceholderTab({ icon: Icon, title, description, linkTo, linkLabel }: { icon: any; title: string; description: string; linkTo?: string; linkLabel?: string }) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      actionLabel={linkLabel}
      actionHref={linkTo}
    />
  );
}

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
            <Link to="/deals">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Execution Workspace</h1>
              <p className="text-xs text-muted-foreground">Unified project view</p>
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
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview"><OverviewTab projectId={id} /></TabsContent>
            <TabsContent value="milestones"><MilestonesTab projectId={id} /></TabsContent>
            <TabsContent value="tasks">
              <PlaceholderTab icon={CheckSquare} title="Task Breakdown" description="Select a milestone to view and manage its tasks." linkTo={`/deals/${id}`} linkLabel="View Deal" />
            </TabsContent>
            <TabsContent value="artifacts">
              <PlaceholderTab icon={FileBox} title="Research Artifacts" description="Upload and manage project artifacts." linkTo={`/project/${id}/artifacts`} linkLabel="Manage Artifacts" />
            </TabsContent>
            <TabsContent value="reviews">
              <PlaceholderTab icon={ClipboardCheck} title="Reviews" description="Request and track milestone reviews." linkTo="/reviews" linkLabel="View Reviews" />
            </TabsContent>
            <TabsContent value="messages">
              <PlaceholderTab icon={MessageSquare} title="Messages" description="Project-linked conversations." linkTo="/messages" linkLabel="Open Messages" />
            </TabsContent>
            <TabsContent value="activity">
              <PlaceholderTab icon={Activity} title="Activity Feed" description="Track all project activity in one timeline." linkTo={`/project/${id}/activity`} linkLabel="View Activity" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
