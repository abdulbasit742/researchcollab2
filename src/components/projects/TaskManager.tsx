import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_PROJECT_TASKS,
  TASK_STATUS_ORDER,
  getTaskCompletionScore,
  getTaskPriorityClass,
  getTaskStatusClass,
  getTaskStatusLabel,
  groupTasksByStatus,
  type ProjectTask,
} from "@/config/projectTasks";
import { AlertTriangle, CalendarDays, ClipboardList, Flag, Milestone, Tags, UserRound } from "lucide-react";

type TaskManagerProps = {
  tasks?: ProjectTask[];
};

export function TaskManager({ tasks = DEMO_PROJECT_TASKS }: TaskManagerProps) {
  const groupedTasks = groupTasksByStatus(tasks);
  const completionScore = getTaskCompletionScore(tasks);
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const review = tasks.filter((task) => task.status === "review").length;
  const active = tasks.filter((task) => task.status === "in_progress").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Task Completion" value={`${completionScore}%`} helper="Done tasks" />
        <MetricCard label="Active" value={active.toString()} helper="In progress" />
        <MetricCard label="Review" value={review.toString()} helper="Needs reviewer" />
        <MetricCard label="Blocked" value={blocked.toString()} helper="Needs attention" danger={blocked > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Task Manager
          </CardTitle>
          <CardDescription>
            Track execution tasks by status, assignee, milestone, due week, tags, and blockers.
          </CardDescription>
          <div className="pt-2">
            <Progress value={completionScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-5">
            {TASK_STATUS_ORDER.map((status) => (
              <TaskColumn key={status} title={getTaskStatusLabel(status)} tasks={groupedTasks[status]} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-red-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-red-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function TaskColumn({ title, tasks }: { title: string; tasks: ProjectTask[] }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-background/70 p-4 text-center text-xs text-muted-foreground">
            No tasks
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: ProjectTask }) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm space-y-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={getTaskStatusClass(task.status)}>{getTaskStatusLabel(task.status)}</Badge>
          <Badge className={getTaskPriorityClass(task.priority)}>{task.priority}</Badge>
        </div>
        <h5 className="text-sm font-semibold leading-snug">{task.title}</h5>
        <p className="text-xs text-muted-foreground line-clamp-3">{task.description}</p>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <InfoRow icon={UserRound} label={task.assignee} />
        <InfoRow icon={Milestone} label={task.milestoneLabel} />
        <InfoRow icon={CalendarDays} label={task.dueLabel} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {task.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="gap-1 text-[10px]">
            <Tags className="h-3 w-3" /> {tag}
          </Badge>
        ))}
      </div>

      {task.blocker ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs text-red-600">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{task.blocker}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ icon: Icon, label }: { icon: typeof Flag; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3" />
      <span className="truncate">{label}</span>
    </div>
  );
}
