import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BookOpen, Code, FileText, BarChart3, DollarSign, Loader2 } from "lucide-react";
import { useAcademicTasks } from "@/hooks/useAcademicData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";

const taskTypeIcons: Record<string, any> = {
  literature_review: BookOpen, coding: Code, data_cleaning: FileText, survey_analysis: BarChart3, writing: FileText, other: FileText,
};

const statusColor: Record<string, string> = {
  open: "bg-green-500/10 text-green-600 border-green-500/20",
  assigned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

export default function AcademicTaskMarketplacePage() {
  const [search, setSearch] = useState("");
  const { data: tasks, isLoading } = useAcademicTasks();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const applyMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("micro_academic_tasks")
        .update({ assigned_to: user?.id, status: "assigned" })
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-tasks"] });
      toast({ title: "Applied successfully" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = (tasks || []).filter(t =>
    t.task_title?.toLowerCase().includes(search.toLowerCase()) ||
    t.task_type?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <MainLayout><div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;

  const renderTask = (task: any) => {
    const Icon = taskTypeIcons[task.task_type] || FileText;
    return (
      <Card key={task.id}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="font-medium">{task.task_title}</p>
                <p className="text-sm text-muted-foreground">{task.task_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-right">
                <p className="font-semibold flex items-center gap-1"><DollarSign className="h-3 w-3" /> PKR {(task.reward_amount ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Trust ×{task.trust_weight ?? 1}</p>
              </div>
              <Badge variant="outline" className={statusColor[task.status] || statusColor.open}>{task.status}</Badge>
              {task.status === "open" && (
                <Button size="sm" onClick={() => applyMutation.mutate(task.id)} disabled={applyMutation.isPending}>Apply</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Academic Task Marketplace</h1>
            <p className="text-muted-foreground mt-1">Quick tasks for trust growth and earnings</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Post Task</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Tabs defaultValue="all">
          <div className="overflow-x-auto -mx-4 px-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="literature_review">Literature</TabsTrigger>
            <TabsTrigger value="coding">Coding</TabsTrigger>
            <TabsTrigger value="data_cleaning">Data</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
          </TabsList>
          </div>
          <TabsContent value="all" className="space-y-3 mt-4">
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks available</p>}
            {filtered.map(renderTask)}
          </TabsContent>
          {["literature_review", "coding", "data_cleaning", "writing"].map(type => (
            <TabsContent key={type} value={type} className="space-y-3 mt-4">
              {filtered.filter(t => t.task_type === type).length === 0 && <p className="text-center text-muted-foreground py-8">No {type.replace("_", " ")} tasks</p>}
              {filtered.filter(t => t.task_type === type).map(renderTask)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}
