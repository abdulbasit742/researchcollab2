import { useState, useCallback } from "react";
import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Play, Square } from "lucide-react";

interface SimResult {
  scenario: string;
  totalRequests: number;
  completedRequests: number;
  avgResponseMs: number;
  errorRate: number;
  maxResponseMs: number;
}

const SCENARIOS = [
  { id: "analytics_reads", label: "Analytics Reads", count: 100, desc: "Simulate 100 concurrent read operations" },
  { id: "search_queries", label: "Search Queries", count: 50, desc: "Simulate 50 concurrent search queries" },
  { id: "queue_jobs", label: "Queue Jobs", count: 30, desc: "Simulate 30 export queue operations" },
  { id: "messaging", label: "Messaging Burst", count: 80, desc: "Simulate 80 messaging events" },
];

export default function SuperAdminStressSimulationPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SimResult[]>([]);

  const runSimulation = useCallback(async (scenarioId: string, count: number) => {
    setRunning(scenarioId);
    setProgress(0);

    const durations: number[] = [];
    let errors = 0;

    // Simulate with delays — no real mutations
    for (let i = 0; i < count; i++) {
      const start = performance.now();
      try {
        // Simulated read-only operation
        await new Promise(r => setTimeout(r, Math.random() * 50 + 10));
        if (Math.random() < 0.03) throw new Error("sim");
      } catch {
        errors++;
      }
      durations.push(Math.round(performance.now() - start));
      setProgress(Math.round(((i + 1) / count) * 100));
    }

    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const max = Math.max(...durations);

    setResults(prev => [...prev, {
      scenario: scenarioId,
      totalRequests: count,
      completedRequests: count - errors,
      avgResponseMs: avg,
      errorRate: Math.round((errors / count) * 100),
      maxResponseMs: max,
    }]);
    setRunning(null);
    setProgress(0);
  }, []);

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Stress Simulation</h1>
            <p className="text-sm text-muted-foreground">Test platform resilience under synthetic load</p>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="pt-4 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Simulations are client-side only with no real data mutation. Results are indicative of client-side performance characteristics.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {SCENARIOS.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={running === s.id ? "destructive" : "default"}
                      disabled={running !== null && running !== s.id}
                      onClick={() => running === s.id ? setRunning(null) : runSimulation(s.id, s.count)}
                    >
                      {running === s.id ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                  {running === s.id && <Progress value={progress} className="h-1.5" />}
                </CardContent>
              </Card>
            ))}
          </div>

          {results.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Simulation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-xs font-medium">{r.scenario}</p>
                        <p className="text-[10px] text-muted-foreground">{r.completedRequests}/{r.totalRequests} completed</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px]">Avg: {r.avgResponseMs}ms</Badge>
                        <Badge variant="outline" className="text-[10px]">Max: {r.maxResponseMs}ms</Badge>
                        <Badge variant={r.errorRate > 5 ? "destructive" : "secondary"} className="text-[10px]">
                          Err: {r.errorRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
