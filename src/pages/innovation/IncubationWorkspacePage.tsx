import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Beaker, CheckCircle, Clock, Plus, ListTodo } from "lucide-react";
import {
  getStartupCandidates, getIncubationTasks, createIncubationTask, updateIncubationTask,
  getTeamMembers, TASK_CATEGORIES,
} from "@/lib/innovation/ventureFactory";

export default function IncubationWorkspacePage() {
  const qc = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskCategory, setTaskCategory] = useState("general");

  const { data: candidates = [] } = useQuery({ queryKey: ["vf-candidates-incubation"], queryFn: () => getStartupCandidates() });
  const { data: tasks = [] } = useQuery({ queryKey: ["vf-tasks", selectedCandidate], queryFn: () => getIncubationTasks(selectedCandidate), enabled: !!selectedCandidate });
  const { data: team = [] } = useQuery({ queryKey: ["vf-team", selectedCandidate], queryFn: () => getTeamMembers(selectedCandidate), enabled: !!selectedCandidate });

  const createTask = useMutation({
    mutationFn: createIncubationTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vf-tasks"] }); toast.success("Task added"); setShowAddTask(false); setTaskTitle(""); setTaskDesc(""); },
  });

  const completeTask = useMutation({
    mutationFn: ({ id }: { id: string }) => updateIncubationTask(id, { status: "done", completed_at: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vf-tasks"] }); toast.success("Task completed"); },
  });

  const todoTasks = tasks.filter((t: any) => t.status === "todo");
  const inProgress = tasks.filter((t: any) => t.status === "in_progress");
  const done = tasks.filter((t: any) => t.status === "done");

  const TaskColumn = ({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: any[]; color: string }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      {items.map((t: any) => (
        <Card key={t.id}>
          <CardContent className="pt-4 space-y-2">
            <p className="font-medium text-foreground text-sm">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{t.category}</Badge>
              {t.status !== "done" && (
                <Button size="sm" variant="ghost" onClick={() => completeTask.mutate({ id: t.id })}>
                  <CheckCircle className="h-3 w-3 mr-1" /> Done
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Beaker className="h-8 w-8 text-primary" /> Incubation Workspace
          </h1>
          <p className="text-muted-foreground mt-1">Coordinate startup incubation tasks and team</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
          <SelectTrigger className="w-80"><SelectValue placeholder="Select a venture" /></SelectTrigger>
          <SelectContent>
            {candidates.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        {selectedCandidate && (
          <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Task</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Incubation Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                <Textarea placeholder="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} />
                <Select value={taskCategory} onValueChange={setTaskCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full" disabled={!taskTitle || createTask.isPending}
                  onClick={() => createTask.mutate({ candidate_id: selectedCandidate, title: taskTitle, description: taskDesc, category: taskCategory })}>
                  {createTask.isPending ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedCandidate ? (
        <>
          <Card>
            <CardHeader><CardTitle className="text-sm">Team ({team.length} members)</CardTitle></CardHeader>
            <CardContent>
              {team.length === 0 ? <p className="text-muted-foreground text-sm">No team members yet.</p> : (
                <div className="flex gap-2 flex-wrap">
                  {team.map((m: any) => <Badge key={m.id} variant="outline">{m.role} • {m.user_id.slice(0, 8)}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TaskColumn title="To Do" icon={<ListTodo className="h-4 w-4 text-muted-foreground" />} items={todoTasks} color="muted" />
            <TaskColumn title="In Progress" icon={<Clock className="h-4 w-4 text-amber-500" />} items={inProgress} color="amber" />
            <TaskColumn title="Done" icon={<CheckCircle className="h-4 w-4 text-green-500" />} items={done} color="green" />
          </div>
        </>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Select a venture to manage its incubation workspace.</CardContent></Card>
      )}
    </div>
  );
}
