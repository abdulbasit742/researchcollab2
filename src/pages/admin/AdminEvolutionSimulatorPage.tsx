import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Zap } from "lucide-react";

export default function AdminEvolutionSimulatorPage() {
  const { data: scenarios } = useQuery({
    queryKey: ["evolution-scenarios"],
    queryFn: async () => {
      const { data } = await supabase
        .from("evolution_scenarios")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Evolution Simulator</h1>
            <p className="text-muted-foreground">Simulate changes before deployment — no blind changes</p>
          </div>
        </div>

        <div className="space-y-3">
          {scenarios?.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No simulations run yet.</CardContent></Card>
          )}
          {scenarios?.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  {s.proposed_change}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Economic Simulation</p>
                  <pre className="mt-1 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(s.economic_simulation_result, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Trust Simulation</p>
                  <pre className="mt-1 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(s.trust_simulation_result, null, 2)}
                  </pre>
                </div>
                <div><span className="text-muted-foreground">Liquidity Impact:</span> {s.liquidity_impact || "N/A"}</div>
                <div><span className="text-muted-foreground">Growth Impact:</span> {s.projected_growth_impact || "N/A"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
