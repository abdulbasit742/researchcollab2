import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Map, Rocket, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getRoadmap, updateRoadmapItem, invokeInnovationGenerator } from "@/lib/innovation/innovationGenerator";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function ExpansionRoadmapPage() {
  const qc = useQueryClient();

  const { data: roadmap } = useQuery({ queryKey: ["inn-roadmap"], queryFn: () => getRoadmap(), staleTime: 60_000 });

  const generateRoadmap = useMutation({
    mutationFn: () => invokeInnovationGenerator("generate_roadmap", { platform: "RCollab", context: "Global execution economy expansion" }),
    onSuccess: () => { toast.success("Roadmap generated"); qc.invalidateQueries({ queryKey: ["inn-roadmap"] }); },
    onError: () => toast.error("Generation failed"),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, status, progress }: { id: string; status: string; progress?: number }) => updateRoadmapItem(id, { status, progress }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["inn-roadmap"] }); },
  });

  const phases = (roadmap ?? []).reduce((acc: Record<string, any[]>, item: any) => {
    (acc[item.phase] = acc[item.phase] ?? []).push(item);
    return acc;
  }, {});

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="h-4 w-4 text-primary" />;
    if (status === "in_progress") return <Clock className="h-4 w-4 text-accent-foreground" />;
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  const totalItems = (roadmap ?? []).length;
  const completedItems = (roadmap ?? []).filter((r: any) => r.status === "completed").length;

  return (
    <>
      <Helmet><title>Expansion Roadmap | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expansion Roadmap</h1>
            <p className="text-muted-foreground">Phased platform expansion planning and tracking</p>
          </div>
          <Button onClick={() => generateRoadmap.mutate()} disabled={generateRoadmap.isPending}>
            <Map className="h-4 w-4 mr-2" /> Generate Roadmap
          </Button>
        </div>

        {totalItems > 0 && (
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completedItems}/{totalItems} completed</span>
            </div>
            <Progress value={totalItems > 0 ? (completedItems / totalItems) * 100 : 0} className="h-3" />
          </CardContent></Card>
        )}

        {Object.entries(phases).length > 0 ? (
          Object.entries(phases).map(([phase, items]) => {
            const phaseComplete = items.filter((i: any) => i.status === "completed").length;
            return (
              <Card key={phase}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Phase: {phase}</CardTitle>
                    <span className="text-sm text-muted-foreground">{phaseComplete}/{items.length} done</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item: any) => (
                    <div key={item.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {statusIcon(item.status)}
                          <span className="font-medium text-foreground">{item.title}</span>
                          <Badge variant="outline">{item.priority}</Badge>
                          {item.target_quarter && <Badge variant="secondary">{item.target_quarter}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.estimated_effort && <span className="text-xs text-muted-foreground">{item.estimated_effort}</span>}
                          {item.status === "planned" && (
                            <Button size="sm" variant="outline" onClick={() => updateItem.mutate({ id: item.id, status: "in_progress", progress: 10 })}>Start</Button>
                          )}
                          {item.status === "in_progress" && (
                            <Button size="sm" onClick={() => updateItem.mutate({ id: item.id, status: "completed", progress: 100 })}>Complete</Button>
                          )}
                        </div>
                      </div>
                      {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                      {item.progress > 0 && item.status !== "completed" && (
                        <Progress value={item.progress} className="h-2 mt-2" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card><CardContent className="pt-6 text-center text-muted-foreground py-12">No roadmap items — generate an expansion roadmap</CardContent></Card>
        )}
      </div>
    </>
  );
}
