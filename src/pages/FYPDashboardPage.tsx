import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Target, TrendingUp, DollarSign, Clock, CheckCircle2, AlertTriangle, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { useFYPProjects, useFYPStats } from "@/hooks/useFYPProjects";

const statusColor: Record<string, string> = {
  proposal: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  active: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function FYPDashboardPage() {
  const { user } = useAuth();
  const [view, setView] = useState<"student" | "supervisor">("student");
  const { data: fypProjects = [], isLoading } = useFYPProjects();
  const stats = useFYPStats(fypProjects);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              FYP Execution Hub
            </h1>
            <p className="text-muted-foreground mt-1">Track, manage, and monetize final year projects</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> New FYP Project</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{stats.totalFYPs}</p>}
                <p className="text-sm text-muted-foreground">Total FYPs</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{stats.completionRate}%</p>}
                <p className="text-sm text-muted-foreground">Milestone Completion</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{stats.activeProjects}</p>}
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                {isLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">PKR {stats.totalEconomicValue.toLocaleString()}</p>}
                <p className="text-sm text-muted-foreground">Economic Value</p>
              </div>
            </div>
          </CardContent></Card>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as "student" | "supervisor")}>
          <TabsList>
            <TabsTrigger value="student">Student View</TabsTrigger>
            <TabsTrigger value="supervisor">Supervisor View</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
              </div>
            ) : fypProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No FYP Projects</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any final year projects yet. Create one to get started.
                  </p>
                  <Button><Plus className="h-4 w-4 mr-2" /> Create FYP Project</Button>
                </CardContent>
              </Card>
            ) : (
              fypProjects.map((fyp) => (
                <Card key={fyp.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{fyp.project_title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {fyp.domain || "General"} · Supervisor: {fyp.supervisor_name || "Unassigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusColor[fyp.status] || statusColor.proposal}>{fyp.status}</Badge>
                        {fyp.trust_weight && <Badge variant="outline">Trust ×{fyp.trust_weight}</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fyp.milestones.length > 0 && (
                      <>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Milestone Progress</span>
                            <span className="font-medium">
                              {fyp.milestones.filter(m => m.status === "completed").length}/{fyp.milestones.length}
                            </span>
                          </div>
                          <Progress value={(fyp.milestones.filter(m => m.status === "completed").length / fyp.milestones.length) * 100} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {fyp.milestones.map((m, i) => (
                            <div key={i} className={`p-2 rounded-lg border text-center text-xs ${
                              m.status === "completed" ? "bg-green-500/10 border-green-500/20" :
                              m.status === "active" ? "bg-blue-500/10 border-blue-500/20" :
                              "bg-muted/50 border-border"
                            }`}>
                              {m.status === "completed" ? <CheckCircle2 className="h-3 w-3 mx-auto mb-1 text-green-500" /> :
                               m.status === "active" ? <Clock className="h-3 w-3 mx-auto mb-1 text-blue-500" /> :
                               <AlertTriangle className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />}
                              <p className="font-medium">{m.name}</p>
                              <p className="text-muted-foreground">{m.due}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Economic Value: <strong>PKR {(fyp.economic_value || 0).toLocaleString()}</strong>
                      </span>
                      {fyp.final_score && <span className="text-sm font-semibold text-green-600">Score: {fyp.final_score}/100</span>}
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="supervisor" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : <p className="text-2xl font-bold">{stats.totalFYPs}</p>}
                    <p className="text-sm text-muted-foreground">Supervised Projects</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : <p className="text-2xl font-bold">{stats.activeProjects}</p>}
                    <p className="text-sm text-muted-foreground">Needing Attention</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : <p className="text-2xl font-bold">{stats.completedProjects}</p>}
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : fypProjects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No projects to supervise yet.</p>
                ) : (
                  <div className="space-y-3">
                    {fypProjects.map((fyp) => (
                      <div key={fyp.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{fyp.student_name}</p>
                          <p className="text-sm text-muted-foreground">{fyp.project_title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusColor[fyp.status] || statusColor.proposal}>{fyp.status}</Badge>
                          {fyp.milestones.length > 0 && (
                            <Progress 
                              value={(fyp.milestones.filter(m => m.status === "completed").length / fyp.milestones.length) * 100} 
                              className="w-24" 
                            />
                          )}
                          <Button size="sm" variant="outline">Review</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
