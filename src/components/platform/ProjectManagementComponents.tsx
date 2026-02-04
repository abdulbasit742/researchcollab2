import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Users,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  MoreVertical,
  ArrowRight,
  Timer,
  PlayCircle,
  PauseCircle,
  Flag,
  Milestone,
  GanttChart,
  KanbanSquare,
  ClipboardList
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

// =====================================================
// TYPES
// =====================================================
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "backlog" | "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: { id: string; name: string; avatar?: string };
  dueDate?: string;
  estimate?: number;
  logged?: number;
  tags?: string[];
  createdAt: string;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goals: string[];
  tasks: Task[];
  velocity?: number;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: "upcoming" | "in_progress" | "completed" | "overdue";
  progress: number;
  tasks: number;
  completedTasks: number;
}

// =====================================================
// KANBAN COLUMN
// =====================================================
function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onTaskClick
}: {
  title: string;
  status: string;
  tasks: Task[];
  onAddTask?: (status: string) => void;
  onTaskClick?: (task: Task) => void;
}) {
  const statusColors: Record<string, string> = {
    backlog: "bg-muted",
    todo: "bg-blue-500/10",
    in_progress: "bg-yellow-500/10",
    review: "bg-purple-500/10",
    done: "bg-green-500/10",
  };

  const priorityColors: Record<string, string> = {
    low: "border-l-slate-400",
    medium: "border-l-blue-500",
    high: "border-l-orange-500",
    urgent: "border-l-red-500",
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className={`p-3 rounded-t-lg ${statusColors[status]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onAddTask?.(status)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2 bg-muted/30 rounded-b-lg min-h-[400px]">
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${priorityColors[task.priority]}`}
              onClick={() => onTaskClick?.(task)}
            >
              <CardContent className="p-3">
                <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(task.dueDate), "MMM d")}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback className="text-xs">
                        {task.assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {task.estimate && (
                  <div className="mt-2">
                    <Progress 
                      value={((task.logged || 0) / task.estimate) * 100} 
                      className="h-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.logged || 0}h / {task.estimate}h
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// =====================================================
// KANBAN BOARD
// =====================================================
export function KanbanBoard({ tasks: initialTasks }: { tasks?: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || [
    {
      id: "1",
      title: "Research competitor analysis",
      status: "todo",
      priority: "high",
      tags: ["Research"],
      dueDate: addDays(new Date(), 3).toISOString(),
      estimate: 8,
      logged: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Design system documentation",
      status: "in_progress",
      priority: "medium",
      assignee: { id: "1", name: "John Doe" },
      tags: ["Design", "Docs"],
      estimate: 16,
      logged: 8,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "API integration testing",
      status: "review",
      priority: "urgent",
      assignee: { id: "2", name: "Jane Smith" },
      tags: ["Testing"],
      dueDate: addDays(new Date(), 1).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      title: "User interview synthesis",
      status: "done",
      priority: "medium",
      tags: ["Research", "UX"],
      createdAt: new Date().toISOString(),
    },
  ]);

  const columns = [
    { id: "backlog", title: "Backlog" },
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-primary" />
              Project Board
            </CardTitle>
            <CardDescription>Drag and drop tasks between columns</CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                title={column.title}
                status={column.id}
                tasks={tasks.filter((t) => t.status === column.id)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =====================================================
// GANTT CHART (SIMPLIFIED)
// =====================================================
export function GanttChartView({ milestones }: { milestones?: Milestone[] }) {
  const defaultMilestones: Milestone[] = milestones || [
    {
      id: "1",
      title: "Phase 1: Discovery",
      dueDate: addDays(new Date(), 14).toISOString(),
      status: "completed",
      progress: 100,
      tasks: 8,
      completedTasks: 8,
    },
    {
      id: "2",
      title: "Phase 2: Design",
      dueDate: addDays(new Date(), 28).toISOString(),
      status: "in_progress",
      progress: 65,
      tasks: 12,
      completedTasks: 8,
    },
    {
      id: "3",
      title: "Phase 3: Development",
      dueDate: addDays(new Date(), 56).toISOString(),
      status: "upcoming",
      progress: 0,
      tasks: 24,
      completedTasks: 0,
    },
    {
      id: "4",
      title: "Phase 4: Testing",
      dueDate: addDays(new Date(), 70).toISOString(),
      status: "upcoming",
      progress: 0,
      tasks: 16,
      completedTasks: 0,
    },
  ];

  const statusColors: Record<string, string> = {
    upcoming: "bg-muted",
    in_progress: "bg-primary",
    completed: "bg-green-500",
    overdue: "bg-red-500",
  };

  const today = new Date();
  const projectStart = addDays(today, -14);
  const projectEnd = addDays(today, 70);
  const totalDays = differenceInDays(projectEnd, projectStart);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GanttChart className="h-5 w-5 text-primary" />
              Project Timeline
            </CardTitle>
            <CardDescription>Visual timeline of project phases</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline header */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
            <span>{format(projectStart, "MMM d")}</span>
            <span>Today</span>
            <span>{format(projectEnd, "MMM d")}</span>
          </div>

          {/* Milestones */}
          {defaultMilestones.map((milestone) => {
            const startOffset = 10; // Simplified start position
            const width = 20 + Math.random() * 20; // Simplified width

            return (
              <div key={milestone.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className={`h-4 w-4 ${
                      milestone.status === "completed" ? "text-green-500" :
                      milestone.status === "in_progress" ? "text-primary" :
                      "text-muted-foreground"
                    }`} />
                    <span className="font-medium text-sm">{milestone.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {milestone.completedTasks}/{milestone.tasks} tasks
                    </span>
                    <Badge variant={
                      milestone.status === "completed" ? "default" :
                      milestone.status === "in_progress" ? "secondary" :
                      "outline"
                    }>
                      {milestone.progress}%
                    </Badge>
                  </div>
                </div>
                
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`absolute h-full rounded-lg transition-all ${statusColors[milestone.status]}`}
                    style={{
                      left: `${startOffset}%`,
                      width: `${width}%`,
                    }}
                  >
                    <div 
                      className="h-full bg-white/20 rounded-l-lg"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  
                  {/* Due date marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-destructive"
                    style={{ left: `${startOffset + width}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Today line */}
          <div className="relative h-4">
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: "50%" }}
            />
            <div 
              className="absolute -top-1 w-3 h-3 bg-primary rounded-full"
              style={{ left: "calc(50% - 6px)" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// SPRINT OVERVIEW
// =====================================================
export function SprintOverview({ sprint }: { sprint?: Sprint }) {
  const defaultSprint: Sprint = sprint || {
    id: "1",
    name: "Sprint 14",
    startDate: addDays(new Date(), -7).toISOString(),
    endDate: addDays(new Date(), 7).toISOString(),
    goals: [
      "Complete user authentication flow",
      "Finalize dashboard design",
      "API integration testing"
    ],
    tasks: [],
    velocity: 34,
  };

  const daysRemaining = differenceInDays(new Date(defaultSprint.endDate), new Date());
  const totalDays = differenceInDays(new Date(defaultSprint.endDate), new Date(defaultSprint.startDate));
  const progress = ((totalDays - daysRemaining) / totalDays) * 100;

  const taskStats = {
    total: 24,
    completed: 16,
    inProgress: 5,
    remaining: 3,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {defaultSprint.name}
            </CardTitle>
            <CardDescription>
              {format(new Date(defaultSprint.startDate), "MMM d")} - {format(new Date(defaultSprint.endDate), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <Badge variant={daysRemaining > 3 ? "secondary" : "destructive"}>
            {daysRemaining} days remaining
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Sprint Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Task breakdown */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{taskStats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <p className="text-2xl font-bold text-green-500">{taskStats.completed}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-2xl font-bold text-yellow-500">{taskStats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <p className="text-2xl font-bold text-blue-500">{taskStats.remaining}</p>
            <p className="text-xs text-muted-foreground">To Do</p>
          </div>
        </div>

        {/* Sprint Goals */}
        <div>
          <h4 className="font-medium mb-3">Sprint Goals</h4>
          <div className="space-y-2">
            {defaultSprint.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${
                  index === 0 ? "text-green-500" : "text-muted-foreground"
                }`} />
                <span className={index === 0 ? "line-through text-muted-foreground" : ""}>
                  {goal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity */}
        {defaultSprint.velocity && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Sprint Velocity</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{defaultSprint.velocity}</span>
              <span className="text-xs text-muted-foreground">story points</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// TIME TRACKING WIDGET
// =====================================================
export function TimeTrackingWidget() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const todayLogs = [
    { task: "API Development", duration: 120, project: "Project Alpha" },
    { task: "Code Review", duration: 45, project: "Project Beta" },
    { task: "Documentation", duration: 60, project: "Project Alpha" },
  ];

  const totalToday = todayLogs.reduce((sum, log) => sum + log.duration, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current session */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {isTracking ? "Currently tracking" : "Not tracking"}
              </p>
              <p className="font-medium">
                {currentTask || "Select a task to start"}
              </p>
            </div>
            <p className="text-2xl font-mono font-bold">
              {formatTime(elapsedTime)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={isTracking ? "destructive" : "default"}
              className="flex-1 gap-2"
              onClick={() => setIsTracking(!isTracking)}
            >
              {isTracking ? (
                <>
                  <PauseCircle className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Today's summary */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Today's Log</h4>
            <Badge variant="secondary">{formatTime(totalToday)}</Badge>
          </div>
          
          <div className="space-y-2">
            {todayLogs.map((log, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
              >
                <div>
                  <p className="font-medium">{log.task}</p>
                  <p className="text-xs text-muted-foreground">{log.project}</p>
                </div>
                <span className="font-mono">{formatTime(log.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// PROJECT MANAGEMENT DASHBOARD
// =====================================================
export function ProjectManagementDashboard() {
  const [activeView, setActiveView] = useState<"kanban" | "timeline" | "list">("kanban");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">
            Track tasks, milestones, and team progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeView === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("kanban")}
          >
            <KanbanSquare className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button
            variant={activeView === "timeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("timeline")}
          >
            <GanttChart className="h-4 w-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={activeView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("list")}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SprintOverview />
        </div>
        <TimeTrackingWidget />
      </div>

      {activeView === "kanban" && <KanbanBoard />}
      {activeView === "timeline" && <GanttChartView />}
      {activeView === "list" && (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">List view coming soon</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProjectManagementDashboard;
