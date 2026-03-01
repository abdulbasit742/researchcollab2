import { useCapitalSimulations } from "@/hooks/useCapitalCoordination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

function sc(v: number) {
  if (v >= 0) return "text-emerald-600";
  if (v >= -10) return "text-amber-600";
  return "text-destructive";
}

// TODO: Replace with real institution context
const DEMO_INSTITUTION_ID = undefined;

export default function CapitalSimulationPage() {
  const { data: simulations = [] } = useCapitalSimulations(DEMO_INSTITUTION_ID);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" /> Capital Simulation Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Model capital flow scenarios — no real mutations performed</p>
      </div>

      {simulations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No simulations available. Connect an institution and run scenarios to see projected outcomes.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {simulations.map((s: any) => {
            const params = s.simulated_parameter_changes ?? {};
            const paramEntries = Object.entries(params);
            return (
              <Card key={s.id}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[10px]">{s.simulation_type.replace(/_/g, " ")}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(s.generated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {paramEntries.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Parameters Changed</p>
                      <div className="flex gap-2 flex-wrap">
                        {paramEntries.map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[10px]">{k}: {String(v)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={`text-lg font-bold ${sc(s.projected_capital_velocity_change)}`}>
                        {s.projected_capital_velocity_change > 0 ? "+" : ""}{s.projected_capital_velocity_change.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Capital Velocity Change</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={`text-lg font-bold ${sc(-Math.abs(s.projected_dispute_impact))}`}>
                        {s.projected_dispute_impact > 0 ? "+" : ""}{s.projected_dispute_impact.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Dispute Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center">Simulation only. No escrow, wallet, or milestone state is modified.</p>
    </div>
  );
}
