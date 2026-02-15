import { useGovernancePods } from "@/hooks/useGovernancePods";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import { format } from "date-fns";

export default function AdminGovernanceOversightPage() {
  const { pods, decisions, isLoading } = useGovernancePods();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Governance Oversight
          </h1>
          <p className="text-sm text-muted-foreground">Pod composition, voting analytics, constitutional compliance</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Pods", value: pods.length },
                { label: "Total Decisions", value: decisions.length },
                { label: "Execution Required", value: decisions.filter((d: any) => d.execution_required).length },
                { label: "Executed", value: decisions.filter((d: any) => d.executed_at).length },
              ].map((card) => (
                <Card key={card.label}>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm">Pod Composition</CardTitle></CardHeader>
              <CardContent>
                {pods.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No active pods.</p>
                ) : (
                  <div className="space-y-2">
                    {pods.map((pod: any) => (
                      <div key={pod.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border">
                        <Badge variant="outline" className="capitalize">{pod.pod_type}</Badge>
                        <span className="text-sm text-foreground">{pod.formation_method}</span>
                        <Badge variant={pod.status === "active" ? "success" : "secondary"}>{pod.status}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{format(new Date(pod.created_at), "MMM d, yyyy")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Decisions</CardTitle></CardHeader>
              <CardContent>
                {decisions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No decisions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {decisions.slice(0, 20).map((d: any) => (
                      <div key={d.id} className="p-3 rounded-lg border border-border">
                        <p className="text-sm text-foreground">{d.decision_summary}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={d.execution_required ? "warning" : "secondary"} className="text-xs">
                            {d.execution_required ? "Exec Required" : "Advisory"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "MMM d, HH:mm")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
