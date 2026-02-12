import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function GovernanceDecisionsPage() {
  const { data: decisions } = useQuery({
    queryKey: ["governance-decisions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("governance_decisions")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Governance Decisions</h1>
          <p className="text-muted-foreground">Full traceability of every major system change</p>
        </div>
      </div>

      <div className="space-y-3">
        {decisions?.length === 0 && (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No decisions recorded yet.</CardContent></Card>
        )}
        {decisions?.map((d) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{d.description}</CardTitle>
                <Badge>{d.decision_type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {(d.affected_systems || []).map((s: string) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>Economic Impact: {d.economic_impact || "N/A"}</div>
                <div>Trust Impact: {d.trust_impact || "N/A"}</div>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
