import { useState } from "react";
import { useRiskSimulations, useCreateSimulation } from "@/hooks/usePredictiveModeling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Play, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const SIM_TYPES = [
  { value: "slow_review", label: "Slower Review Speed" },
  { value: "high_disputes", label: "Higher Dispute Rate" },
  { value: "reduced_engagement", label: "Reduced Engagement" },
  { value: "milestone_delay", label: "Milestone Delays" },
];

export default function RiskSimulationPage() {
  const { data: simulations = [] } = useRiskSimulations();
  const createSim = useCreateSimulation();

  const [simType, setSimType] = useState("slow_review");
  const [entityId, setEntityId] = useState("");
  const [shiftPct, setShiftPct] = useState("20");

  const handleRun = () => {
    if (!entityId.trim()) { toast.error("Enter an entity ID"); return; }
    createSim.mutate({
      simulation_type: simType,
      entity_id: entityId.trim(),
      simulated_parameters: { type: simType, shift_percentage: parseFloat(shiftPct) },
      projected_outcome: `Simulated ${simType} with ${shiftPct}% shift on entity ${entityId.slice(0, 8)}`,
      risk_shift: parseFloat(shiftPct),
    }, {
      onSuccess: () => toast.success("Simulation recorded"),
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Risk Simulation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Run what-if scenarios without affecting real data</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
                <Info className="h-2.5 w-2.5" /> No Real Data Mutation
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              Simulations are purely advisory. No escrow, wallet, milestone, or trust data is modified.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Run Simulation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" /> New Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Select value={simType} onValueChange={setSimType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SIM_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Entity ID (project/institution)"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Shift %"
                value={shiftPct}
                onChange={(e) => setShiftPct(e.target.value)}
                className="w-24"
              />
              <Button onClick={handleRun} disabled={createSim.isPending}>
                <Play className="h-4 w-4 mr-1" /> Run
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Simulations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Simulation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {simulations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No simulations run yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {simulations.map((s: any) => (
                <div key={s.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-[10px]">{s.simulation_type}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{s.projected_outcome}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Risk Shift: <span className="text-foreground font-medium">{s.risk_shift}%</span></span>
                    <span>Entity: <code className="text-[10px]">{s.entity_id?.slice(0, 12)}...</code></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
