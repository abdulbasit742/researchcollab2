import { useEnterpriseSalesIntelligence } from "@/hooks/useMonetization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, Users, Target } from "lucide-react";

export default function EnterpriseSalesIntelligencePage() {
  const { data: intel } = useEnterpriseSalesIntelligence();
  const subs = (intel?.subscriptions ?? []) as any[];
  const usage = (intel?.usage ?? []) as any[];

  // Group usage by institution for quick lookup
  const usageByInst = usage.reduce((acc: Record<string, any>, u: any) => {
    if (!acc[u.institution_id]) acc[u.institution_id] = u;
    return acc;
  }, {} as Record<string, any>);

  // Identify high-usage low-tier institutions
  const upgradeTargets = subs.filter((s: any) => {
    const plan = s.institution_subscription_plans?.plan_name;
    const u = usageByInst[s.institution_id];
    return plan !== "Enterprise" && u && (u.active_users > 20 || u.projects_created > 10);
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          Enterprise Sales Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Identify upgrade opportunities and high-value institutions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{subs.length}</p>
            <p className="text-[10px] text-muted-foreground">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{upgradeTargets.length}</p>
            <p className="text-[10px] text-muted-foreground">Upgrade Candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{usage.length}</p>
            <p className="text-[10px] text-muted-foreground">Institutions Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Candidates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Upgrade Candidates
            <Badge variant="outline" className="text-[10px] ml-auto">Internal Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upgradeTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No upgrade candidates identified yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {upgradeTargets.map((s: any) => {
                const u = usageByInst[s.institution_id];
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Institution: <code className="text-[10px] text-muted-foreground">{s.institution_id?.slice(0, 8)}...</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u?.active_users ?? 0} users · {u?.projects_created ?? 0} projects
                      </p>
                    </div>
                    <Badge variant="secondary">{s.institution_subscription_plans?.plan_name}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Subscriptions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No active subscriptions.</p>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {subs.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded text-sm hover:bg-muted/30">
                  <span className="text-foreground font-mono text-xs">{s.institution_id?.slice(0, 12)}...</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{s.institution_subscription_plans?.plan_name ?? "—"}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.start_date ?? s.created_at).toLocaleDateString()}
                    </span>
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
