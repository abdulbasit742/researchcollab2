import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { getTasks, createTask, updateTask, completeTask, TASK_TYPES } from "@/lib/omnichannel/taskService";
import { toast } from "sonner";

export default function OmniTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", task_type: "follow_up", priority: "medium", due_at: "" });

  useEffect(() => { loadTasks(); }, [filterStatus]);

  async function loadTasks() {
    setLoading(true);
    try { setTasks(await getTasks(filterStatus !== "all" ? { status: filterStatus } : undefined)); }
    catch { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newTask.title.trim()) return;
    try {
      await createTask({ ...newTask, due_at: newTask.due_at || undefined });
      toast.success("Task created");
      setShowCreate(false);
      setNewTask({ title: "", description: "", task_type: "follow_up", priority: "medium", due_at: "" });
      loadTasks();
    } catch { toast.error("Failed to create task"); }
  }

  async function handleComplete(id: string) {
    try { await completeTask(id); toast.success("Task completed"); loadTasks(); }
    catch { toast.error("Failed"); }
  }

  const pending = tasks.filter(t => t.status === "pending");
  const inProgress = tasks.filter(t => t.status === "in_progress");
  const completed = tasks.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks & Follow-Ups</h1>
            <p className="text-sm text-muted-foreground">Operator task management and follow-up engine</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />New Task</Button>
      </div>

      {showCreate && (
        <Card className="mb-4"><CardContent className="pt-4 space-y-3">
          <Input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
          <Textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
          <div className="flex gap-2">
            <Select value={newTask.task_type} onValueChange={v => setNewTask(p => ({ ...p, task_type: v }))}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" value={newTask.due_at} onChange={e => setNewTask(p => ({ ...p, due_at: e.target.value }))} className="h-8" />
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[{ title: "Pending", items: pending, color: "text-yellow-500", icon: Clock },
          { title: "In Progress", items: inProgress, color: "text-blue-500", icon: AlertTriangle },
          { title: "Completed", items: completed, color: "text-green-500", icon: CheckCircle },
        ].map(col => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-3">
              <col.icon className={`h-4 w-4 ${col.color}`} />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <Badge variant="outline" className="text-[9px]">{col.items.length}</Badge>
            </div>
            <div className="space-y-2">
              {col.items.map(t => (
                <Card key={t.id} className="hover:shadow-md transition">
                  <CardContent className="pt-3 pb-2 space-y-1">
                    <p className="text-sm font-medium">{t.title}</p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px]">{t.task_type?.replace(/_/g, " ")}</Badge>
                      <Badge variant={t.priority === "high" ? "destructive" : "secondary"} className="text-[9px]">{t.priority}</Badge>
                    </div>
                    {t.due_at && <p className="text-[10px] text-muted-foreground">Due: {new Date(t.due_at).toLocaleDateString()}</p>}
                    {t.omni_contacts?.display_name && <p className="text-[10px] text-muted-foreground">{t.omni_contacts.display_name}</p>}
                    {t.status !== "completed" && (
                      <Button size="sm" variant="ghost" className="h-5 text-[9px] mt-1" onClick={() => handleComplete(t.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" />Complete
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
