import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bot, Play, Pause, Activity, Zap, ListTodo, Radio, BarChart3, Shield,
  CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  getAgentRegistry, updateAgentStatus, getTaskQueue, getAgentSignals, getControlAnalytics,
  AGENT_STATUSES, TASK_PRIORITIES,
} from "@/lib/intelligence/agentControl";
import { runAgent } from "@/lib/intelligence/agentNetwork";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  disabled: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
};

const TASK_STATUS_ICON: Record<string, typeof CheckCircle> = {
  completed: CheckCircle, failed: XCircle, pending: Clock, running: RefreshCw, cancelled: XCircle,
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];

export default function AgentControlCenterPage() {
  const qc = useQueryClient();
  const [taskFilter, setTaskFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["agent-registry"],
    queryFn: getAgentRegistry,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["agent-tasks", taskFilter, agentFilter],
    queryFn: () => getTaskQueue({
      ...(taskFilter && taskFilter !== "all" ? { status: taskFilter } : {}),
      ...(agentFilter && agentFilter !== "all" ? { agent_key: agentFilter } : {}),
    }),
  });

  const { data: signals = [] } = useQuery({
    queryKey: ["agent-signals"],
    queryFn: () => getAgentSignals(50),
  });

  const { data: analytics } = useQuery({
    queryKey: ["agent-control-analytics"],
    queryFn: getControlAnalytics,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ key, status }: { key: string; status: string }) =>
      updateAgentStatus(key, status === "active" ? "paused" : "active"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-registry"] });
      qc.invalidateQueries({ queryKey: ["agent-control-analytics"] });
      toast.success("Agent status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const triggerRun = async (agentKey: string) => {
    try {
      await runAgent(agentKey, {});
      toast.success(`${agentKey} triggered`);
      qc.invalidateQueries({ queryKey: ["agent-tasks"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger agent");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" /> AI Agent Control Center
        </h1>
        <p className="text-muted-foreground mt-1">
          Orchestrate, monitor, and manage all AI agents — advisory only, never mutates core systems
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Agents", value: analytics?.totalAgents ?? 0, icon: Bot },
          { label: "Active", value: analytics?.activeAgents ?? 0, icon: Play },
          { label: "Paused", value: analytics?.pausedAgents ?? 0, icon: Pause },
          { label: "Total Tasks", value: analytics?.totalTasks ?? 0, icon: ListTodo },
          { label: "Pending", value: analytics?.pendingTasks ?? 0, icon: Clock },
          { label: "Running", value: analytics?.runningTasks ?? 0, icon: RefreshCw },
          { label: "Completed", value: analytics?.totalTasksCompleted ?? 0, icon: CheckCircle },
          { label: "Errors", value: analytics?.totalErrors ?? 0, icon: AlertTriangle },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <kpi.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safety Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-3 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            <strong>Safety Guarantee:</strong> All agents operate in advisory-only mode. No agent can modify financial ledgers, override trust scores, or bypass escrow logic.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry"><Bot className="h-4 w-4 mr-1" /> Registry</TabsTrigger>
          <TabsTrigger value="tasks"><ListTodo className="h-4 w-4 mr-1" /> Task Queue</TabsTrigger>
          <TabsTrigger value="signals"><Radio className="h-4 w-4 mr-1" /> Signals</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
        </TabsList>

        {/* Registry Tab */}
        <TabsContent value="registry" className="space-y-3">
          {loadingAgents ? (
            <p className="text-muted-foreground">Loading agents...</p>
          ) : (
            agents.map((agent: any) => (
              <Card key={agent.id}>
                <CardContent className="pt-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{agent.agent_name}</h3>
                      <Badge className={STATUS_STYLES[agent.status] || ""}>{agent.status}</Badge>
                      <Badge variant="outline">v{agent.version}</Badge>
                      <Badge variant="secondary">{agent.agent_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{agent.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Tasks: {agent.tasks_completed}</span>
                      <span>Errors: {agent.total_errors}</span>
                      <span>Avg: {agent.avg_response_ms}ms</span>
                      {agent.last_active_at && (
                        <span>Last: {new Date(agent.last_active_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerRun(agent.agent_key)}
                      disabled={agent.status !== "active"}
                    >
                      <Zap className="h-3 w-3 mr-1" /> Run
                    </Button>
                    <Button
                      size="sm"
                      variant={agent.status === "active" ? "secondary" : "default"}
                      onClick={() => toggleStatus.mutate({ key: agent.agent_key, status: agent.status })}
                    >
                      {agent.status === "active" ? (
                        <><Pause className="h-3 w-3 mr-1" /> Pause</>
                      ) : (
                        <><Play className="h-3 w-3 mr-1" /> Resume</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Task Queue Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex gap-2">
            <Select value={taskFilter} onValueChange={setTaskFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["pending", "running", "completed", "failed", "cancelled"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-52"><SelectValue placeholder="All agents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {agents.map((a: any) => (
                  <SelectItem key={a.agent_key} value={a.agent_key}>{a.agent_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No tasks in queue. Trigger an agent from the Registry tab to create tasks.
              </CardContent>
            </Card>
          ) : (
            tasks.map((task: any) => {
              const Icon = TASK_STATUS_ICON[task.status] || Clock;
              return (
                <Card key={task.id}>
                  <CardContent className="pt-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{task.task_type}</span>
                        <Badge variant="outline">{task.agent_key}</Badge>
                        <Badge className={
                          task.priority === "critical" ? "bg-destructive/10 text-destructive" :
                          task.priority === "high" ? "bg-orange-500/10 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        }>{task.priority}</Badge>
                      </div>
                      {task.error_message && (
                        <p className="text-xs text-destructive">{task.error_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(task.created_at).toLocaleString()}
                        {task.completed_at && ` · Completed: ${new Date(task.completed_at).toLocaleString()}`}
                      </p>
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-3">
          {signals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No agent signals recorded yet.
              </CardContent>
            </Card>
          ) : (
            signals.map((sig: any) => (
              <Card key={sig.id}>
                <CardContent className="pt-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{sig.signal_type}</span>
                      {sig.acknowledged && <Badge variant="secondary">ACK</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sig.source_agent} → {sig.target_agent || "broadcast"} · {new Date(sig.created_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Tasks by Agent</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.tasksByAgent || []}>
                    <XAxis dataKey="agent" tick={{ fontSize: 10 }} angle={-20} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Signals by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analytics?.signalsByType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                      {(analytics?.signalsByType || []).map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
