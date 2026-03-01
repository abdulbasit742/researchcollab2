import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useMilestoneTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useResearchWorkflow";
import { ListChecks, Plus, Trash2, Loader2, Calendar, User } from "lucide-react";

export default function MilestoneTasksPage() {
  const { milestoneId } = useParams<{ milestoneId: string }>();
  const { data: tasks = [], isLoading } = useMilestoneTasks(milestoneId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const completedCount = tasks.filter((t: any) => t.status === "completed").length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleCreate = async () => {
    if (!milestoneId || !newTitle.trim()) return;
    await createTask.mutateAsync({
      milestone_id: milestoneId,
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      due_date: newDueDate || undefined,
    });
    setNewTitle("");
    setNewDesc("");
    setNewDueDate("");
    setShowCreate(false);
  };

  const handleToggle = (task: any) => {
    updateTask.mutate({
      id: task.id,
      milestoneId: milestoneId!,
      status: task.status === "completed" ? "pending" : "completed",
    });
  };

  return (
    <MainLayout>
      <div className="container py-6 px-4 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              Milestone Tasks
            </h1>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{tasks.length} tasks completed
            </p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <div>
                  <label className="text-sm text-muted-foreground">Due date</label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreate} disabled={createTask.isPending || !newTitle.trim()}>
                  {createTask.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Task List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ListChecks className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No tasks yet. Break down this milestone into actionable tasks.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: any) => (
              <Card key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => handleToggle(task)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === "completed" ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <Badge variant={
                        task.status === "completed" ? "default" :
                        task.status === "in_progress" ? "secondary" : "outline"
                      } className="text-xs">
                        {task.status.replace("_", " ")}
                      </Badge>
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => deleteTask.mutate({ id: task.id, milestoneId: milestoneId! })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
