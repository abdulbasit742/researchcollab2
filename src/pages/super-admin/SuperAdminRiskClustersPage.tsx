import { SuperAdminGuard } from "@/components/super-admin/SuperAdminGuard";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSuperAdminAudit } from "@/hooks/useSuperAdminAudit";
import { useEffect } from "react";
import { Shield } from "lucide-react";

function useInstitutionRiskData() {
  return useQuery({
    queryKey: ["sa-risk-clusters"],
    queryFn: async () => {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name, type, org_trust_score, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!orgs?.length) return [];

      // Get milestone stats globally
      const { data: milestones } = await supabase
        .from("milestones")
        .select("id, status, offer_id")
        .limit(500);

      return orgs.map(org => {
        const total = milestones?.length ?? 0;
        const disputed = milestones?.filter(m => m.status === "disputed").length ?? 0;
        const disputeDensity = total > 0 ? Math.round((disputed / total) * 100) : 0;
        const trustScore = org.org_trust_score ?? 50;
        const riskScore = Math.min(100, disputeDensity * 2 + (100 - trustScore));

        return {
          id: org.id,
          name: org.name,
          type: org.type,
          trustScore,
          disputeDensity,
          totalMilestones: total,
          disputedMilestones: disputed,
          riskScore,
          riskLevel: riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low" as "high" | "medium" | "low",
        };
      }).sort((a, b) => b.riskScore - a.riskScore);
    },
    staleTime: 120_000,
  });
}

export default function SuperAdminRiskClustersPage() {
  const { logAction } = useSuperAdminAudit();
  const { data, isLoading } = useInstitutionRiskData();

  useEffect(() => { logAction("view_risk_clusters"); }, []);

  const riskColor = (level: string) => level === "high" ? "destructive" : level === "medium" ? "warning" : "default";

  return (
    <SuperAdminGuard>
      <SuperAdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">Multi-Tenant Risk Clusters</h1>
            <p className="text-sm text-muted-foreground">Institutions ranked by governance risk and dispute density</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : !data?.length ? (
            <EmptyState icon={Shield} title="No institutions found" description="Institution data will appear once organizations are created." />
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-7 gap-2 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">Institution</div>
                <div>Trust Score</div>
                <div>Dispute Density</div>
                <div>Milestones</div>
                <div>Risk Score</div>
                <div>Risk Level</div>
              </div>

              {data.map(org => (
                <Card key={org.id} className={org.riskLevel === "high" ? "border-destructive/30" : ""}>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center">
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium truncate">{org.name}</p>
                        <p className="text-[10px] text-muted-foreground">{org.type}</p>
                      </div>
                      <div><p className="text-sm font-semibold">{org.trustScore}</p></div>
                      <div><p className="text-sm font-semibold">{org.disputeDensity}%</p></div>
                      <div><p className="text-sm">{org.disputedMilestones}/{org.totalMilestones}</p></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${org.riskLevel === "high" ? "bg-destructive" : org.riskLevel === "medium" ? "bg-warning" : "bg-success"}`}
                              style={{ width: `${org.riskScore}%` }} />
                          </div>
                          <span className="text-xs font-mono">{org.riskScore}</span>
                        </div>
                      </div>
                      <div>
                        <Badge variant={riskColor(org.riskLevel) as any} className="text-[9px]">{org.riskLevel}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SuperAdminLayout>
    </SuperAdminGuard>
  );
}
