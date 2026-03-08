import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Play, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getSimulations, runSimulation, SIMULATION_TYPES } from "@/lib/innovation/marketSimulator";

export default function MarketSimulatorPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [simType, setSimType] = useState(SIMULATION_TYPES[0]);
  const [params, setParams] = useState({ researchDemand: "60", talentDemand: "70", talentSupply: "40", fundingNeeded: "80", fundingAvailable: "50" });

  const { data: sims = [] } = useQuery({ queryKey: ["market-simulations"], queryFn: () => getSimulations() });

  const runMutation = useMutation({
    mutationFn: () => runSimulation({
      simulation_type: simType,
      title: `${simType} simulation`,
      parameters: params as any,
      run_by: user?.id,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["market-simulations"] }); toast.success("Simulation complete"); },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Execution Market Simulator</h1>
          <p className="text-sm text-muted-foreground">Predict demand, talent shortages, and funding bottlenecks</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Run Simulation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Select value={simType} onValueChange={setSimType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SIMULATION_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(params).map(([key, val]) => (
              <div key={key}>
                <label className="text-[10px] text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</label>
                <Input type="number" value={val} onChange={e => setParams(p => ({ ...p, [key]: e.target.value }))} className="h-8 text-xs" />
              </div>
            ))}
          </div>
          <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
            <Play className="h-4 w-4 mr-2" />{runMutation.isPending ? "Running…" : "Run Simulation"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Past Simulations</h2>
      <div className="space-y-3">
        {sims.map((s: any) => {
          const r = (s.results || {}) as any;
          return (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{s.title}</span>
                  <Badge variant="secondary">{s.simulation_type}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Demand: {r.projected_demand}</div>
                  <div className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Talent Gap: {r.talent_gap_severity}</div>
                  <div>Funding Gap: {r.funding_bottleneck}</div>
                  <div className="font-medium">{r.recommendation}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {sims.length === 0 && <div className="text-center py-8 text-muted-foreground">No simulations yet.</div>}
      </div>
    </div>
  );
}
