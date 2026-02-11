import { useGovernancePods } from "@/hooks/useGovernancePods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Vote, ScrollText, Users, Gavel } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function GovernancePage() {
  const { pods, decisions, constitution, isLoading, assemblePod } = useGovernancePods();

  const handleAssemble = async (podType: string) => {
    try {
      await assemblePod.mutateAsync({ pod_type: podType });
      toast.success(`${podType} governance pod assembled`);
    } catch (e: any) {
      toast.error(e.message || "Failed to assemble pod");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Platform Governance
            </h1>
            <p className="text-muted-foreground mt-1">Decentralized, trust-weighted governance for ecosystem stability</p>
          </div>
          <div className="flex gap-2">
            {["risk", "capital", "dispute", "constitutional"].map((type) => (
              <Button key={type} variant="outline" size="sm" onClick={() => handleAssemble(type)} disabled={assemblePod.isPending}>
                {assemblePod.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                Form {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Pods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Vote className="h-4 w-4" /> Active Governance Pods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pods.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No active governance pods. Assemble one above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pods.map((pod: any) => (
                  <div key={pod.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">{pod.pod_type}</Badge>
                      <Badge variant={pod.status === "active" ? "success" : "secondary"}>{pod.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formed: {format(new Date(pod.created_at), "MMM d, yyyy")} · Method: {pod.formation_method}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground/60 truncate">{pod.id}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decision History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gavel className="h-4 w-4" /> Decision History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No decisions rendered yet.</p>
            ) : (
              <div className="space-y-3">
                {decisions.map((d: any) => (
                  <div key={d.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{d.decision_summary}</p>
                      <Badge variant={d.execution_required ? "warning" : "secondary"}>
                        {d.execution_required ? "Execution Required" : "Advisory"}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(d.created_at), "MMM d, HH:mm")}</span>
                      {d.executed_at && <span>Executed: {format(new Date(d.executed_at), "MMM d")}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Constitutional Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ScrollText className="h-4 w-4" /> Platform Constitution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {constitution.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No constitutional rules enacted yet.</p>
            ) : (
              <div className="space-y-2">
                {constitution.map((rule: any) => (
                  <div key={rule.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{rule.rule_category}</Badge>
                      <span className="text-sm font-medium text-foreground">{rule.rule_key}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rule.rationale || JSON.stringify(rule.rule_value)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
